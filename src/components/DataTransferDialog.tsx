import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { ClubData } from '../model';
import { parseBackup } from '../store';

export default function DataTransferDialog({
  open,
  onClose,
  onDownload,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  onRestore: (backup: ClubData) => void;
}) {
  const [backup, setBackup] = useState<ClubData | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  function close() {
    setBackup(null);
    setFileName('');
    setError('');
    onClose();
  }
  async function chooseFile(file?: File) {
    setBackup(null);
    setFileName(file?.name ?? '');
    setError('');
    if (!file) return;
    try {
      setBackup(parseBackup(await file.text()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read this backup.');
    }
  }
  function restore() {
    if (!backup) return;
    try {
      onRestore(backup);
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not restore this backup.');
    }
  }
  return <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
    <DialogTitle>Move your TBFC data</DialogTitle>
    <DialogContent>
      <Stack gap={2} sx={{ pt: 1 }}>
        <Typography color="text.secondary">
          Download a backup of the records shown here. Restoring a backup on localhost also replaces the shared club data once connected.
        </Typography>
        <Button variant="contained" onClick={onDownload} sx={{ alignSelf: 'flex-start' }}>Download backup JSON</Button>
        <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
          Choose backup to restore
          <input hidden type="file" accept=".json,application/json" onChange={event => {
            void chooseFile(event.target.files?.[0]);
            event.target.value = '';
          }} />
        </Button>
        {fileName && <Typography variant="body2">{fileName}</Typography>}
        {backup && <Alert severity="warning">
          Ready to restore {backup.matches.length} matches, {backup.players.length} players, and {backup.opponents.length} teams. This replaces the records shown here{location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? ' and publishes them to the shared database when connected' : ''}.
        </Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Close</Button>
      <Button variant="contained" disabled={!backup} onClick={restore}>Restore backup</Button>
    </DialogActions>
  </Dialog>;
}
