import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';

export default function AdminBackupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setChecking(true);
    setError('');
    void fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not check admin access.');
        const status = await response.json();
        if (!controller.signal.aborted) setAuthenticated(status.authenticated === true);
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not check admin access.'); })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [open]);

  async function signIn() {
    if (!secret || busy) return;
    setBusy(true);
    setError('');
    const entered = secret;
    setSecret('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret: entered }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not sign in.');
      setAuthenticated(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally { setBusy(false); }
  }

  async function download() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/backup', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Admin session expired. Sign in again.' : 'Could not download the backup.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tbfc-production-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not download the backup.');
      if (cause instanceof Error && cause.message.includes('expired')) setAuthenticated(false);
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Could not sign out.');
      setAuthenticated(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out.');
    } finally { setBusy(false); }
  }

  return <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle>Admin backup</DialogTitle>
    <DialogContent>
      <Stack gap={2} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Download a private copy of the current production records, including scrapbook chats.
        </Typography>
        {!authenticated && !checking && <form id="admin-backup-sign-in" onSubmit={event => { event.preventDefault(); void signIn(); }}>
          <TextField autoFocus fullWidth label="Club admin secret" type="password" autoComplete="off"
            value={secret} onChange={event => setSecret(event.target.value)} disabled={busy} />
        </form>}
        {checking && <Typography variant="body2">Checking access…</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        {authenticated && <Button variant="contained" disabled={busy} onClick={() => void download()}>
          Download Production Backup
        </Button>}
      </Stack>
    </DialogContent>
    <DialogActions>
      {authenticated && <Button disabled={busy} onClick={() => void signOut()}>Sign out</Button>}
      <Button disabled={busy} onClick={onClose}>Close</Button>
      {!authenticated && !checking && <Button type="submit" form="admin-backup-sign-in" variant="contained" disabled={busy || !secret}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>}
    </DialogActions>
  </Dialog>;
}
