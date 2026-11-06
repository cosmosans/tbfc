import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import type { ClubData, Location } from '../../model';
import { FourColumnGrid } from '../../components/layout';
import { canEditClub } from '../../editAccess';

async function prepareImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 10_000_000) throw new Error('Choose an image smaller than 10 MB.');
  const image = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not open this image.'));
      image.src = url;
    });
    const scale = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare this image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function Locations({ data, update }: { data: ClubData; update: (data: ClubData) => void }) {
  const [editing, setEditing] = useState<Location | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  function save(location: Location) {
    const exists = data.locations.some(item => item.id === location.id);
    update({
      ...data,
      locations: exists ? data.locations.map(item => item.id === location.id ? location : item) : [...data.locations, location],
      matches: data.matches.map(match => match.locationId === location.id ? { ...match, venue: location.name } : match),
    });
    setEditing(null);
  }
  return <Stack gap={2}>
    <Typography variant="h5" sx={{ bgcolor: '#111', color: '#fff', px: 2, py: 1, alignSelf: 'flex-start' }}>Locations</Typography>
    {canEditClub && <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
      <TextField label="Location name" size="small" value={name} onChange={event => setName(event.target.value)} sx={{ flexGrow: 1 }} />
      <Button variant="contained" disabled={!name.trim() || data.locations.some(item => item.name.toLowerCase() === name.trim().toLowerCase())} onClick={() => {
        setEditing({ id: crypto.randomUUID(), name: name.trim(), address: '', imageUrl: '' });
        setName('');
      }}>Add location</Button>
    </Stack>}
    <FourColumnGrid>
      {[...data.locations].sort((a, b) => a.name.localeCompare(b.name)).map(location => <Card key={location.id}>
        {location.imageUrl && <Box component="img" src={location.imageUrl} alt="" sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />}
        <CardContent>
          <Typography variant="h6">{location.name}</Typography>
          <Typography color="text.secondary" variant="body2">{location.address || 'Address not added'}</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>{data.matches.filter(match => match.locationId === location.id).length} matches</Typography>
          {canEditClub && <Button sx={{ mt: 1 }} onClick={() => { setError(''); setEditing({ ...location }); }}>Edit location</Button>}
        </CardContent>
      </Card>)}
    </FourColumnGrid>
    {canEditClub && <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
      <DialogTitle>{data.locations.some(item => item.id === editing?.id) ? 'Edit location' : 'Add location'}</DialogTitle>
      {editing && <>
        <DialogContent><Stack gap={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} required />
          <TextField label="Address" value={editing.address} onChange={event => setEditing({ ...editing, address: event.target.value })} />
          {editing.imageUrl && <Box component="img" src={editing.imageUrl} alt="" sx={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', alignSelf: 'flex-start' }} />}
          <Button component="label" variant="outlined" disabled={preparingImage}>{preparingImage ? 'Preparing image…' : editing.imageUrl ? 'Change image' : 'Add image'}<input hidden type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) { const locationId = editing.id; setPreparingImage(true); setError(''); void prepareImage(file).then(imageUrl => setEditing(current => current?.id === locationId ? { ...current, imageUrl } : current)).catch(cause => setError(cause instanceof Error ? cause.message : 'Could not add image.')).finally(() => setPreparingImage(false)); } event.target.value = ''; }} /></Button>
          {editing.imageUrl && <Button onClick={() => setEditing({ ...editing, imageUrl: '' })}>Remove image</Button>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button variant="contained" disabled={preparingImage || !editing.name.trim() || data.locations.some(item => item.id !== editing.id && item.name.toLowerCase() === editing.name.trim().toLowerCase())} onClick={() => save({ ...editing, name: editing.name.trim(), address: editing.address.trim() })}>Save</Button></DialogActions>
      </>}
    </Dialog>}
  </Stack>;
}
