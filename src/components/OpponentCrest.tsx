import { useState } from 'react';
import { styled } from '@mui/material/styles';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { Link } from 'react-router-dom';

const CrestFrame = styled('span', { shouldForwardProp: prop => prop !== 'compact' && prop !== 'size' })<{ compact: boolean; size?: number }>(({ compact, size }) => ({
  width: size ?? (compact ? 42 : 58),
  height: size ?? (compact ? 42 : 58),
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  flex: '0 0 auto',
  overflow: 'hidden',
}));

const CrestImage = styled('img')({
  display: 'block',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))',
});

export default function OpponentCrest({ url, compact = false, size, teamId, teamName }: { url?: string; compact?: boolean; size?: number; teamId?: string; teamName?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const crest = <CrestFrame compact={compact} size={size} aria-hidden="true">
    {url && !imageFailed ? <CrestImage src={url} alt="" onError={() => setImageFailed(true)} /> : <SportsSoccerIcon color="disabled" />}
  </CrestFrame>;
  return teamId ? <Link to={`/team/${encodeURIComponent(teamId)}`} aria-label={`View ${teamName ?? 'team'} history`} onClick={event => event.stopPropagation()} style={{ display: 'inline-flex', flex: '0 0 auto' }}>{crest}</Link> : crest;
}
