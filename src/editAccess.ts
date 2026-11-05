/** Local development is the only place where club records can be edited. */
export const canEditClub = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
