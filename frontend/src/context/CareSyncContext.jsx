import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  processDoctorNote,
  updateAdherence,
  fetchPatients,
  fetchAdherence,
  addPatientMedication,
  removePatientMedication,
  savePatientData,
  resetDatabase,
} from '../services/api';

const CareSyncContext = createContext(null);

const DEFAULT_DOCTOR_NOTE = (
  "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen " +
  "twice a day for her knee pain, morning and evening. She should continue her other meds."
);

export function CareSyncProvider({ children }) {
  // Read persisted user settings from localStorage
  const [selectedUser, setSelectedUserState] = useState(() => {
    return localStorage.getItem('caresync_selected_user') || 'User::Alice';
  });

  const [patientId, setPatientIdState] = useState(() => {
    return localStorage.getItem('caresync_selected_patient') || 'Grandma_Bob';
  });

  const [doctorsNote, setDoctorsNoteState] = useState(() => {
    return localStorage.getItem('caresync_custom_note') || DEFAULT_DOCTOR_NOTE;
  });

  const [patients, setPatients] = useState({});
  const [adherenceLogs, setAdherenceLogs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [forbiddenError, setForbiddenError] = useState(null);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isSnsDrawerOpen, setIsSnsDrawerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isMedManagerOpen, setIsMedManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'schedule' | 'intake' | 'security' | 'alerts' | 'telemetry'

  // Persist setters
  const setSelectedUser = (user) => {
    setSelectedUserState(user);
    localStorage.setItem('caresync_selected_user', user);
  };

  const setPatientId = (id) => {
    setPatientIdState(id);
    localStorage.setItem('caresync_selected_patient', id);
  };

  const setDoctorsNote = (note) => {
    setDoctorsNoteState(note);
    localStorage.setItem('caresync_custom_note', note);
  };

  // Sync activeTab with URL hash for deep linking and browser history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validTabs = ['home', 'schedule', 'intake', 'security', 'alerts', 'telemetry'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        window.location.hash = '#/home';
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab) => {
    window.location.hash = `#/${tab}`;
    setActiveTab(tab);
  };

  // Load patients and initial adherence
  const loadPatients = useCallback(async () => {
    try {
      const data = await fetchPatients();
      setPatients(data || {});
    } catch (e) {
      console.error('Failed to load patients:', e);
    }
  }, []);

  const loadAdherence = useCallback(async (currentPatient) => {
    try {
      const logs = await fetchAdherence(currentPatient);
      setAdherenceLogs(logs || {});
    } catch (e) {
      console.error('Failed to load adherence:', e);
    }
  }, []);

  // Run initial golden path once on mount and fetch patients
  useEffect(() => {
    loadPatients();
    loadAdherence(patientId);
    executeProcess(selectedUser, patientId, doctorsNote);
  }, []);

  const executeProcess = async (user = selectedUser, patient = patientId, note = doctorsNote) => {
    setIsLoading(true);
    setForbiddenError(null);

    try {
      const res = await processDoctorNote(user, patient, note);
      setIsLiveBackend(res.isLiveBackend);

      if (res.status === 403) {
        setForbiddenError(res.data);
        setResultData(null);
      } else if (res.status === 200) {
        setResultData(res.data);
        setForbiddenError(null);
      } else {
        setForbiddenError({
          error: 'Execution Error',
          message: res.data?.error || 'An unexpected error occurred during execution.',
        });
      }
    } catch (err) {
      console.error('CareSync processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdherenceUpdate = async (slot, medication, status) => {
    // 1. Optimistically update local state immediately
    const key = `${slot}_${medication}`;
    const newRecord = {
      slot,
      medication,
      status,
      timestamp: new Date().toISOString(),
    };
    const updated = { ...adherenceLogs, [key]: newRecord };
    setAdherenceLogs(updated);
    localStorage.setItem(`caresync_adh_${patientId}`, JSON.stringify(updated));

    // 2. Persist to backend
    await updateAdherence(patientId, slot, medication, status);
  };

  // Customization: Add Custom Medication
  const addCustomMedication = async (medicationName, slot = 'morning', instructions = '') => {
    if (!medicationName.trim()) return;
    const cleanMed = medicationName.trim();

    // 1. Backend persistent save
    await addPatientMedication(patientId, cleanMed);

    // 2. Update local patients cache
    setPatients((prev) => {
      const current = prev[patientId] || { current_medications: [] };
      const meds = current.current_medications || [];
      if (!meds.includes(cleanMed)) meds.push(cleanMed);
      return { ...prev, [patientId]: { ...current, current_medications: meds } };
    });

    // 3. Update active schedule immediately
    if (resultData) {
      const existingMeds = resultData.current_medications || [];
      const updatedMeds = existingMeds.includes(cleanMed) ? existingMeds : [...existingMeds, cleanMed];

      const currentSchedule = resultData.daily_schedule || { morning: [], afternoon: [], evening: [], bedtime: [] };
      const targetSlotList = [...(currentSchedule[slot] || [])];

      if (!targetSlotList.some((p) => p.medication.toLowerCase() === cleanMed.toLowerCase())) {
        targetSlotList.push({
          medication: cleanMed,
          instructions: instructions || `Take with water as directed during ${slot}`,
        });
      }

      setResultData({
        ...resultData,
        current_medications: updatedMeds,
        daily_schedule: {
          ...currentSchedule,
          [slot]: targetSlotList,
        },
      });
    }

    // Refresh from backend
    await loadPatients();
  };

  // Customization: Remove Medication
  const removeCustomMedication = async (medicationName) => {
    if (!medicationName) return;

    // 1. Backend persistent removal
    await removePatientMedication(patientId, medicationName);

    // 2. Update local patients cache
    setPatients((prev) => {
      const current = prev[patientId] || { current_medications: [] };
      const meds = (current.current_medications || []).filter((m) => m !== medicationName);
      return { ...prev, [patientId]: { ...current, current_medications: meds } };
    });

    // 3. Update active schedule
    if (resultData) {
      const currentSchedule = resultData.daily_schedule || {};
      const updatedSchedule = {};
      Object.keys(currentSchedule).forEach((slotKey) => {
        updatedSchedule[slotKey] = (currentSchedule[slotKey] || []).filter(
          (p) => p.medication.toLowerCase() !== medicationName.toLowerCase()
        );
      });

      setResultData({
        ...resultData,
        current_medications: (resultData.current_medications || []).filter((m) => m !== medicationName),
        daily_schedule: updatedSchedule,
      });
    }

    await loadPatients();
  };

  // Customization: Create New Custom Patient
  const createNewPatient = async (patientData) => {
    const cleanId = patientData.id || (patientData.name ? patientData.name.replace(/\s+/g, '_') : `Patient_${Date.now()}`);
    await savePatientData(cleanId, patientData);
    await loadPatients();
    setPatientId(cleanId);
    loadAdherence(cleanId);
    executeProcess(selectedUser, cleanId, doctorsNote);
  };

  // Reset all to sample defaults
  const resetAllData = async () => {
    await resetDatabase();
    localStorage.clear();
    setSelectedUserState('User::Alice');
    setPatientIdState('Grandma_Bob');
    setDoctorsNoteState(DEFAULT_DOCTOR_NOTE);
    await loadPatients();
    await loadAdherence('Grandma_Bob');
    executeProcess('User::Alice', 'Grandma_Bob', DEFAULT_DOCTOR_NOTE);
  };

  const value = {
    selectedUser,
    setSelectedUser,
    patientId,
    setPatientId,
    doctorsNote,
    setDoctorsNote,
    patients,
    adherenceLogs,
    isLoading,
    resultData,
    forbiddenError,
    isLiveBackend,
    isSnsDrawerOpen,
    setIsSnsDrawerOpen,
    isTraceModalOpen,
    setIsTraceModalOpen,
    isMedManagerOpen,
    setIsMedManagerOpen,
    activeTab,
    navigateTo,
    executeProcess,
    handleAdherenceUpdate,
    addCustomMedication,
    removeCustomMedication,
    createNewPatient,
    resetAllData,
  };

  return (
    <CareSyncContext.Provider value={value}>
      {children}
    </CareSyncContext.Provider>
  );
}

export function useCareSync() {
  const context = useContext(CareSyncContext);
  if (!context) {
    throw new Error('useCareSync must be used within a CareSyncProvider');
  }
  return context;
}
