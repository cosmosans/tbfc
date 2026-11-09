/** Editing requires an admin session and Manager Mode on every host. */
export let canEditClub = false;

export function setManageModeAccess(authenticated: boolean, enabled: boolean) {
  canEditClub = authenticated && enabled;
}
