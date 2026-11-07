/** Local development can always edit; production requires an admin session and Manage Mode. */
export const isLocalEditor = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
export let canEditClub = isLocalEditor;

export function setProductionManageMode(authenticated: boolean, enabled: boolean) {
  canEditClub = isLocalEditor || (authenticated && enabled);
}
