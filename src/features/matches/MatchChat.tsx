import { useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { MatchChatMessage, MatchChatReply, Player } from '../../model';

export default function MatchChat({ messages, players, onSave }: {
  messages: MatchChatMessage[];
  players: Player[];
  onSave?: (messages: MatchChatMessage[]) => void;
}) {
  const [draft, setDraft] = useState<MatchChatReply | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const siblings = parentId ? messages.find(item => item.id === parentId)?.replies ?? [] : messages;
  const editing = siblings.some(item => item.id === draft?.id);
  function openDraft(message: MatchChatReply, parent: string | null = null) {
    setParentId(parent);
    setDraft({ ...message });
  }
  function changeList(next: MatchChatReply[], parent: string | null) {
    if (parent) onSave?.(messages.map(item => item.id === parent ? { ...item, replies: next } : item));
    else onSave?.(next);
  }
  function move(index: number, offset: number, parent: string | null) {
    const next = [...(parent ? messages.find(item => item.id === parent)?.replies ?? [] : messages)];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    changeList(next, parent);
  }
  function save() {
    if (!draft || !draft.text.trim() || (!editing && !players.some(player => player.id === draft.playerId))) return;
    if (parentId && !messages.some(item => item.id === parentId)) return;
    const message = { ...draft, text: draft.text.trim() };
    changeList(editing
      ? siblings.map(item => item.id === message.id ? { ...item, ...message } : item)
      : [...siblings, message], parentId);
    setDraft(null);
  }
  function renderMessage(message: MatchChatReply, index: number, list: MatchChatReply[], parent: string | null) {
    const player = players.find(item => item.id === message.playerId);
    const sender = player?.name || message.senderName || 'Former player';
    const label = parent ? `reply ${index + 1}` : `message ${index + 1}`;
    return <Stack direction="row" gap={1.5} alignItems="flex-start">
      <Avatar src={player?.photoUrl} alt={sender} sx={{ width: parent ? 36 : 48, height: parent ? 36 : 48 }}>{sender.charAt(0)}</Avatar>
      <Box sx={{ flex: 1, minWidth: 0, bgcolor: 'background.default', borderRadius: 2, p: 1.5 }}>
        <Typography fontWeight={700}>{sender}</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.text}</Typography>
        {onSave && <Stack direction="row" justifyContent="flex-end" flexWrap="wrap" mt={1}>
          {!parent && <Button size="small" disabled={!players.length} onClick={() => openDraft({ id: crypto.randomUUID(), playerId: '', text: '' }, message.id)}>Reply</Button>}
          <IconButton size="small" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => move(index, -1, parent)}><ArrowUpwardIcon fontSize="small" /></IconButton>
          <IconButton size="small" aria-label={`Move ${label} down`} disabled={index === list.length - 1} onClick={() => move(index, 1, parent)}><ArrowDownwardIcon fontSize="small" /></IconButton>
          <Button size="small" aria-label={`Edit ${label}`} onClick={() => openDraft(message, parent)}>Edit</Button>
          <Button size="small" color="error" aria-label={`Delete ${label}`} onClick={() => {
            if (window.confirm(`Delete this ${parent ? 'reply' : 'message'} from the chat archive?`))
              changeList(list.filter(item => item.id !== message.id), parent);
          }}>Delete</Button>
        </Stack>}
      </Box>
    </Stack>;
  }
  return <Card><CardContent>
    <Stack gap={0.5} mb={2}>
      <Typography variant="h6">Chat</Typography>
      <Typography variant="body2" color="text.secondary">WhatsApp messages sent between final whistle and 12AM EST.</Typography>
    </Stack>
    {!messages.length && <Typography color="text.secondary">No messages yet. Save messages from the team about this match here.</Typography>}
    <Stack component="ol" gap={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {messages.map((message, index) => <Box component="li" key={message.id}>
        {renderMessage(message, index, messages, null)}
        {!!message.replies?.length && <Stack component="ol" gap={1.5} sx={{ listStyle: 'none', m: 0, mt: 1.5, ml: { xs: 2, sm: 6 }, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
          {message.replies.map((reply, replyIndex) => <Box component="li" key={reply.id}>
            {renderMessage(reply, replyIndex, message.replies!, message.id)}
          </Box>)}
        </Stack>}
      </Box>)}
    </Stack>
    {onSave && <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button variant="outlined" disabled={!players.length} onClick={() => openDraft({ id: crypto.randomUUID(), playerId: '', text: '' })}>Add message</Button>
    </Box>}
    <Dialog open={draft !== null} onClose={() => setDraft(null)} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? (parentId ? 'Edit reply' : 'Edit message') : (parentId ? 'Add reply' : 'Add message')}</DialogTitle>
      <DialogContent><Stack gap={2} mt={1}>
        <TextField select label="Player" value={draft?.playerId ?? ''} onChange={event => setDraft(current => current && ({ ...current, playerId: event.target.value }))}>
          {draft?.playerId && !players.some(player => player.id === draft.playerId) &&
            <MenuItem value={draft.playerId}>{draft.senderName || 'Former player'}</MenuItem>}
          {[...players].sort((a, b) => a.name.localeCompare(b.name)).map(player => <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>)}
        </TextField>
        <TextField label="Message" multiline minRows={4} value={draft?.text ?? ''} onChange={event => setDraft(current => current && ({ ...current, text: event.target.value }))} />
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setDraft(null)}>Cancel</Button><Button variant="contained" disabled={!draft?.text.trim() || (!editing && !players.some(player => player.id === draft?.playerId))} onClick={save}>{parentId ? 'Save reply' : 'Save message'}</Button></DialogActions>
    </Dialog>
  </CardContent></Card>;
}
