import React, { createContext, useContext, useState, useEffect } from 'react';
import { processDoctorNote, updateAdherence } from '../services/api';

const CareSyncContext = createContext(null);

const DEFAULT_DOCTOR_NOTE = (
  "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen " +
  "twice a day for her knee pain, morning and evening. She should continue her other meds."
);

export function CareSyncProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState('User::Alice');
  const [patientId, setPatientId] = useState('Grandma_Bob');
  const [doctorsNote, setDoctorsNote] = useState(DEFAULT_DOCTOR_NOTE);
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [forbiddenError, setForbiddenError] = useState(null);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isSnsDrawerOpen, setIsSnsDrawerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'intake' | 'security' | 'alerts' | 'telemetry'

  // Sync activeTab with URL hash for deep linking and browser history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validTabs = ['schedule', 'intake', 'security', 'alerts', 'telemetry'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        window.location.hash = '#/schedule';
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

  // Run initial golden path once on mount
  useEffect(() => {
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
    await updateAdherence(patientId, slot, medication, status);
  };

  const value = {
    selectedUser,
    setSelectedUser,
    patientId,
    setPatientId,
    doctorsNote,
    setDoctorsNote,
    isLoading,
    resultData,
    forbiddenError,
    isLiveBackend,
    isSnsDrawerOpen,
    setIsSnsDrawerOpen,
    isTraceModalOpen,
    setIsTraceModalOpen,
    activeTab,
    navigateTo,
    executeProcess,
    handleAdherenceUpdate,
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
