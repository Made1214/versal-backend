const ROLE_USER = "USER";
const ROLE_ADMIN = "ADMIN";

function normalizeRole(role) {
  if (!role || typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toUpperCase();
  if (normalized === ROLE_USER || normalized === ROLE_ADMIN) {
    return normalized;
  }

  return null;
}

function isAdminRole(role) {
  return normalizeRole(role) === ROLE_ADMIN;
}

export { ROLE_USER, ROLE_ADMIN, normalizeRole, isAdminRole };
