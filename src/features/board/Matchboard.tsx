import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Box, Button, Card, CardContent, Dialog, Stack, TextField, Typography } from "@mui/material";
import type { Board, ClubData, Match } from "../../model";
import { defaultBoard, defaultLineup } from "../../store";
import { Pitch, CenterLine, CenterCircle, TopBox, BottomBox, PitchMarker } from "./Matchboard.styles";
import { NameplateText, goalkeeperPlate } from "../../components/LineupNameplate";
import { formationSlots } from "../lineup/formations";
import SoccerBall from "./SoccerBall";
import { useBallMotion } from "./useBallMotion";
import { canEditClub } from "../../editAccess";

export default function Matchboard({
  data,
  match,
  update,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
}) {
  const lineup =
    data.lineups.find((l) => l.matchId === match.id) ?? defaultLineup(match.id);
  const base = defaultBoard(match.id, lineup, data);
  const saved = data.boards.find((b) => b.matchId === match.id);
  const [board, setBoard] = useState<Board>(() =>
    saved && (saved.formation ?? '1-2-3-1') === lineup.formation
      ? {
          ...saved,
          formation: lineup.formation,
          markers: saved.markers.map((marker) => ({
            ...marker,
            playerNumber: base.markers.find((m) => m.id === marker.id)?.playerNumber,
            label:
              base.markers.find((m) => m.id === marker.id)?.label ??
              marker.label,
          })),
        }
      : { ...base, notes: saved?.notes ?? '' },
  );
  const boardRef = useRef(board);
  const drag = useRef<{ id: string; pointerId: number } | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  function persist(next: Board) {
    boardRef.current = next;
    setBoard(next);
    if (!canEditClub) return;
    update({
      ...data,
      boards: [...data.boards.filter((b) => b.matchId !== match.id), next],
    });
  }
  const ballMotion = useBallMotion(boardRef, setBoard, persist);
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    if (drag.current.id === "ball") ballMotion.sample(event.clientX, event.clientY);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      4,
      Math.min(96, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      4,
      Math.min(96, ((event.clientY - rect.top) / rect.height) * 100),
    );
    const next = ballMotion.follow({
      ...boardRef.current,
      markers: boardRef.current.markers.map((m) =>
        m.id === drag.current?.id ? { ...m, point: { x, y } } : m,
      ),
    });
    boardRef.current = next;
    setBoard(next);
  }
  const pitch = (
        <Pitch
          ref={ballMotion.pitch}
          sx={fullScreen ? { flex: 1, minHeight: '0 !important', touchAction: 'none', overflow: 'hidden' } : undefined}
          onPointerMove={move}
          onPointerUp={(e) => {
            if (drag.current?.pointerId !== e.pointerId) return;
            move(e);
            const isBall = drag.current.id === "ball";
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
            if (isBall) ballMotion.release();
            else persist(boardRef.current);
          }}
          onPointerCancel={() => { drag.current = null; }}
          onLostPointerCapture={() => { drag.current = null; }}
        >
          <CenterLine />
          <CenterCircle />
          <TopBox />
          <BottomBox />
          {board.markers.map((marker) => (
            <PitchMarker
              key={marker.id}
              team={marker.team}
              data-ball={marker.team === "ball" ? "true" : undefined}
              data-player-marker={marker.team !== "ball" ? marker.id : undefined}
              sx={marker.team === "ball" ? { zIndex: 2 } : undefined}
              kit={match.kit}
              goalkeeper={goalkeeperPlate(
                lineup.starters[Number(marker.id.replace('slot-', ''))],
                formationSlots[lineup.formation][Number(marker.id.replace('slot-', ''))],
              )}
              style={{ left: `${marker.point.x}%`, top: `${marker.point.y}%` }}
              onPointerDown={(e) => {
                if (drag.current || !e.isPrimary || e.button !== 0) return;
                e.preventDefault();
                if (marker.team === "ball") ballMotion.begin(e.clientX, e.clientY);
                e.currentTarget.parentElement?.setPointerCapture(e.pointerId);
                drag.current = { id: marker.id, pointerId: e.pointerId };
              }}
              type="button"
              aria-label={marker.team === "ball" ? "Drag or flick soccer ball" : `Move ${marker.label}`}
            >
              {marker.team === "tbfc" ? (
                <NameplateText number={marker.playerNumber} name={marker.label} />
              ) : marker.team === "ball" ? <SoccerBall point={marker.point} /> : marker.label}
            </PitchMarker>
          ))}
        </Pitch>
  );
  return (
    <Stack direction={{ xs: "column", lg: "row" }} gap={2}>
      <Box sx={{ flexGrow: 1 }}>
        <Button variant="outlined" sx={{ mb: 1 }} onClick={() => { ballMotion.stop(); setFullScreen(true); }}>
          Full screen
        </Button>
        {!fullScreen && pitch}
        <Dialog fullScreen open={fullScreen} onClose={() => { ballMotion.stop(); setFullScreen(false); }}
          slotProps={{ paper: { sx: {
            height: '100dvh', overflow: 'hidden', overscrollBehavior: 'none',
            paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)',
          } } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, flexShrink: 0 }}>
            <Typography variant="h6">Matchboard</Typography>
            <Button onClick={() => { ballMotion.stop(); setFullScreen(false); }}>Exit full screen</Button>
          </Stack>
          {fullScreen && pitch}
        </Dialog>
      </Box>
      <Stack gap={2} sx={{ width: { lg: 280 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Coaching board</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              {canEditClub
                ? 'Drag markers on the pitch. Positions save when released.'
                : 'Drag markers to try a setup. Changes stay on this board until you leave.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Flick the ball to pass. It bounces off the sides and sticks to players.
              Drag a player to carry it, or flick the ball away again.
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => { ballMotion.reset(); persist({ ...base, notes: boardRef.current.notes }); }}>
              Reset to lineup
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <TextField
              label="Board notes"
              multiline
              minRows={5}
              fullWidth
              value={board.notes}
              disabled={!canEditClub}
              onChange={(e) => {
                const next = { ...boardRef.current, notes: e.target.value };
                boardRef.current = next;
                setBoard(next);
              }}
              onBlur={() => persist(boardRef.current)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Formation: {lineup.formation}
              <br />
              The board is stored with this match. Reset uses the latest saved
              lineup.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}

