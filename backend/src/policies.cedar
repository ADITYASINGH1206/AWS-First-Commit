// CareSync Zero-Trust Elder Policy
// Strictly limits patient record access to authorized family members

permit(
    principal,
    action == Action::"ViewPatientRecord",
    resource
)
when {
    principal in resource.authorized_family
};
