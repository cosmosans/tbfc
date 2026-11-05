import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import type { Board, ClubData, Match } from "../../model";
import { defaultBoard, defaultLineup } from "../../store";
import { Pitch, CenterLine, CenterCircle, TopBox, BottomBox, PitchMarker } from "./Matchboard.styles";
import { NameplateText } from "../../components/LineupNameplate";
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
  const [dragId, setDragId] = useState<string | null>(null);
  function persist(next: Board) {
    if (!canEditClub) return;
    boardRef.current = next;
    setBoard(next);
    update({
      ...data,
      boards: [...data.boards.filter((b) => b.matchId !== match.id), next],
    });
  }
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canEditClub) return;
    if (!dragId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      4,
      Math.min(96, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      4,
      Math.min(96, ((event.clientY - rect.top) / rect.height) * 100),
    );
    const next = {
      ...boardRef.current,
      markers: boardRef.current.markers.map((m) =>
        m.id === dragId ? { ...m, point: { x, y } } : m,
      ),
    };
    boardRef.current = next;
    setBoard(next);
  }
  return (
    <Stack direction={{ xs: "column", lg: "row" }} gap={2}>
      <Box sx={{ flexGrow: 1 }}>
        <Pitch
          onPointerMove={move}
          onPointerUp={(e) => {
            if (dragId) {
              e.currentTarget.releasePointerCapture(e.pointerId);
              persist(boardRef.current);
              setDragId(null);
            }
          }}
          onPointerCancel={() => setDragId(null)}
        >
          <CenterLine />
          <CenterCircle />
          <TopBox />
          <BottomBox />
          {board.markers.map((marker) => (
            <PitchMarker
              key={marker.id}
              team={marker.team}
              kit={match.kit}
              style={{ left: `${marker.point.x}%`, top: `${marker.point.y}%` }}
              onPointerDown={(e) => {
                if (!canEditClub) return;
                e.preventDefault();
                e.currentTarget.parentElement?.setPointerCapture(e.pointerId);
                setDragId(marker.id);
              }}
              aria-label={`Move ${marker.label}`}
            >
              {marker.team === "tbfc" ? (
                <NameplateText number={marker.playerNumber} name={marker.label} />
              ) : marker.label}
            </PitchMarker>
          ))}
        </Pitch>
      </Box>
      <Stack gap={2} sx={{ width: { lg: 280 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Coaching board</Typography>
            {canEditClub && <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              Drag markers on the pitch. Positions save when released.
            </Typography>}
            {canEditClub && <Button variant="outlined" fullWidth onClick={() => persist({ ...base, notes: boardRef.current.notes })}>
              Reset to lineup
            </Button>}
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

