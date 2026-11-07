/** Editing requires an admin session and Manage Mode on every host. */
export let canEditClub = false;

export function setManageModeAccess(authenticated: boolean, enabled: boolean) {
  canEditClub = authenticated && enabled;
}
