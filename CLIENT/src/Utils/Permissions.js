export const canInviteUsers = (role) => role === "admin";
export const canManageUsers = (role) => role === "admin";
export const canManageItems = (role) =>
  role === "admin" || role === "storekeeper" || role === "manager";
export const canEditItems = (role) =>
  role === "admin" || role === "storekeeper" || role === "manager";
export const canDeleteItems = (role) =>
  role === "admin" || role === "storekeeper" || role === "manager";
export const canCreateStockingRequest = (role) =>
  role === "admin" || role === "manager";
export const canAcceptStockingRequest = (role) =>
  role === "admin" || role === "manager" || role === "storekeeper";
export const canViewReports = (role) => true;
