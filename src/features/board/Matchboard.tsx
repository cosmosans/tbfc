import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import AnnotatePencil from "../../img/annotate-pencil.png";
import AnnotatePencilActive from "../../img/annotate-pencil-active.png";
import UndoArrow from "../../img/undo-arrow.png";
import TrashBin from "../../img/trash-bin.png";
import TeamViewTbfc from "../../img/team-view-tbfc.png";
import TeamViewOpponent from "../../img/team-view-opponent.png";
import TeamViewBoth from "../../img/team-view-both.png";
import CloseIcon from "@mui/icons-material/Close";
import type { Board, ClubData, Marker, Match, Point } from "../../model";
import { defaultBoard, defaultLineup } from "../../store";
import { opponentFor } from "../../clubView";
import { Pitch, PitchMarker } from "./Matchboard.styles";
import PitchSurface from "../../components/PitchSurface";
import {
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
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
  const lineup = useMemo(
    () =>
      data.lineups.find((l) => l.matchId === match.id) ??
      defaultLineup(match.id),
    [data.lineups, match.id],
  );
  const base = useMemo(
    () => defaultBoard(match.id, lineup, data),
    [match.id, lineup, data.players],
  );
  const saved = useMemo(
    () => data.boards.find((b) => b.matchId === match.id),
    [data.boards, match.id],
  );
  const opponentColor = opponentFor(data, match)?.color || "#555";
  const lineupBoard = useMemo<Board>(
    () =>
      saved && (saved.formation ?? "1-2-3-1") === lineup.formation
        ? {
            ...saved,
            formation: lineup.formation,
            markers: base.markers.map((marker) => {
              const previous = saved.markers.find((m) => m.id === marker.id);
              if (!previous) return marker;
              return marker.team === "tbfc"
                ? {
                    ...previous,
                    playerNumber: marker.playerNumber,
                    label: marker.label,
                  }
                : { ...marker, ...previous };
            }),
          }
        : {
            ...base,
            markers: base.markers.map((marker) => {
              if (marker.team !== "opponent") return marker;
              const previous = saved?.markers.find((m) => m.id === marker.id);
              return previous
                ? {
                    ...marker,
                    label: previous.label,
                    playerNumber: previous.playerNumber,
                  }
                : marker;
            }),
            notes: saved?.notes ?? "",
            annotations: saved?.annotations ?? [],
          },
    [saved, lineup.formation, base],
  );
  const [board, setBoard] = useState<Board>(lineupBoard);
  const boardRef = useRef(board);
  const drag = useRef<{
    id: string;
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const drawing = useRef<{ pointerId: number; points: Point[] } | null>(null);
  const [draftStroke, setDraftStroke] = useState<Point[]>([]);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [teamView, setTeamView] = useState<"tbfc" | "opponent" | "both">("both");
  const [editingOpponentId, setEditingOpponentId] = useState<string | null>(
    null,
  );
  const [opponentNumber, setOpponentNumber] = useState("");
  const [opponentName, setOpponentName] = useState("");
  function editOpponent(marker: Marker) {
    setEditingOpponentId(marker.id);
    setOpponentNumber(marker.playerNumber ?? "");
    setOpponentName(marker.label);
  }
  function saveOpponent() {
    if (!editingOpponentId) return;
    persist({
      ...boardRef.current,
      markers: boardRef.current.markers.map((marker) =>
        marker.id === editingOpponentId
          ? {
              ...marker,
              playerNumber: opponentNumber.trim(),
              label: opponentName.trim(),
            }
          : marker,
      ),
    });
    setEditingOpponentId(null);
  }
  useEffect(() => {
    if (drag.current) return;
    boardRef.current = lineupBoard;
    setBoard(lineupBoard);
  }, [lineupBoard]);
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
  function resetToLineup(clearAnnotations: boolean) {
    cancelDrawing();
    ballMotion.reset();
    persist({
      ...base,
      notes: boardRef.current.notes,
      annotations: clearAnnotations ? [] : boardRef.current.annotations,
      markers: base.markers.map((marker) => {
        if (marker.team !== "opponent") return marker;
        const previous = boardRef.current.markers.find(
          (m) => m.id === marker.id,
        );
        return previous
          ? {
              ...marker,
              label: previous.label,
              playerNumber: previous.playerNumber,
            }
          : marker;
      }),
    });
  }
  function pointOnPitch(
    event: { clientX: number; clientY: number },
    pitch: HTMLDivElement,
  ): Point {
    const rect = pitch.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(100, ((event.clientX - rect.left) / rect.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, ((event.clientY - rect.top) / rect.height) * 100),
      ),
    };
  }
  function addDrawingPoints(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawing.current || drawing.current.pointerId !== event.pointerId)
      return;
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [
      event.nativeEvent,
    ];
    for (const sample of samples) {
      const next = pointOnPitch(sample, event.currentTarget);
      const last = drawing.current.points.at(-1);
      if (!last || Math.hypot(next.x - last.x, next.y - last.y) >= 0.2) {
        drawing.current.points.push(next);
      }
      if (drawing.current.points.length >= 1000) break;
    }
    setDraftStroke([...drawing.current.points]);
  }
  function cancelDrawing() {
    drawing.current = null;
    setDraftStroke([]);
  }
  const annotationTools = (
    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
      <Tooltip title="Annotate">
      <IconButton
        aria-label="Annotate"
        sx={{ width: 44, height: 36, borderRadius: 0, bgcolor: annotateMode ? "primary.main" : "transparent", "&:hover": { bgcolor: annotateMode ? "primary.dark" : "action.hover" } }}
        aria-pressed={annotateMode}
        onClick={() => {
          cancelDrawing();
          setAnnotateMode((current) => !current);
        }}
      >
        <Box component="img" src={annotateMode ? AnnotatePencilActive : AnnotatePencil} alt="" sx={{ width: 24, height: 24, objectFit: "contain" }} />
      </IconButton>
      </Tooltip>
      <Tooltip title="Undo">
      <span>
      <IconButton
        aria-label="Undo"
        disabled={!board.annotations?.length}
        onClick={() =>
          persist({
            ...boardRef.current,
            annotations: boardRef.current.annotations?.slice(0, -1) ?? [],
          })
        }
      >
        <Box component="img" src={UndoArrow} alt="" sx={{ width: 22, height: 22, objectFit: "contain", ".Mui-disabled &": { opacity: 0.3 } }} />
      </IconButton>
      </span>
      </Tooltip>
      <Tooltip title="Clear Drawings">
      <span>
      <IconButton
        aria-label="Clear Drawings"
        disabled={!board.annotations?.length}
        onClick={() => persist({ ...boardRef.current, annotations: [] })}
      >
        <Box component="img" src={TrashBin} alt="" sx={{ width: 22, height: 22, objectFit: "contain", ".Mui-disabled &": { opacity: 0.3 } }} />
      </IconButton>
      </span>
      </Tooltip>
      {fullScreen && (
        <Tooltip title={`Showing ${teamView === "tbfc" ? "TBFC only" : teamView === "opponent" ? "opponents only" : "both teams"}. Click for ${teamView === "both" ? "TBFC only" : teamView === "tbfc" ? "opponents only" : "both teams"}.`}>
          <IconButton
            aria-label={`Showing ${teamView === "tbfc" ? "TBFC only" : teamView === "opponent" ? "opponents only" : "both teams"}; switch to ${teamView === "both" ? "TBFC only" : teamView === "tbfc" ? "opponents only" : "both teams"}`}
            onClick={() => {
              ballMotion.stop();
              setTeamView((current) => current === "both" ? "tbfc" : current === "tbfc" ? "opponent" : "both");
            }}
            sx={{ width: 44, height: 36, borderRadius: 0, border: "1px solid", borderColor: "primary.main", bgcolor: "rgba(244,119,48,.18)", "&:hover": { bgcolor: "rgba(244,119,48,.28)" } }}
          >
            <Box component="img" src={teamView === "tbfc" ? TeamViewTbfc : teamView === "opponent" ? TeamViewOpponent : TeamViewBoth} alt="" sx={{ width: 30, height: 20, objectFit: "contain" }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (drawing.current?.pointerId === event.pointerId) {
      addDrawingPoints(event);
      return;
    }
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    if (
      drag.current.id.startsWith("opponent-") &&
      Math.hypot(
        event.clientX - drag.current.x,
        event.clientY - drag.current.y,
      ) < 8
    )
      return;
    if (drag.current.id === "ball")
      ballMotion.sample(event.clientX, event.clientY);
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
      sx={
        fullScreen
          ? {
              flex: 1,
              minHeight: "0 !important",
              touchAction: "none",
              overflow: "hidden",
            }
          : annotateMode
            ? { touchAction: "none" }
            : undefined
      }
      onPointerDown={(event) => {
        if (
          !annotateMode ||
          !event.isPrimary ||
          event.button !== 0 ||
          drag.current
        )
          return;
        if ((event.target as HTMLElement).closest("button")) return;
        event.preventDefault();
        const points = [pointOnPitch(event, event.currentTarget)];
        drawing.current = { pointerId: event.pointerId, points };
        setDraftStroke(points);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={move}
      onPointerUp={(e) => {
        if (drawing.current?.pointerId === e.pointerId) {
          addDrawingPoints(e);
          const points = drawing.current.points;
          cancelDrawing();
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          persist({
            ...boardRef.current,
            annotations: [...(boardRef.current.annotations ?? []), points],
          });
          return;
        }
        if (drag.current?.pointerId !== e.pointerId) return;
        const pressed = drag.current;
        if (
          pressed.id.startsWith("opponent-") &&
          Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) < 8
        ) {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          const marker = boardRef.current.markers.find(
            (m) => m.id === pressed.id,
          );
          if (marker) editOpponent(marker);
          return;
        }
        move(e);
        const isBall = drag.current.id === "ball";
        drag.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        if (isBall) ballMotion.release();
        else persist(boardRef.current);
      }}
      onPointerCancel={() => {
        drag.current = null;
        cancelDrawing();
      }}
      onLostPointerCapture={() => {
        drag.current = null;
        cancelDrawing();
      }}
    >
      <PitchSurface />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 6,
          pointerEvents: "none",
        }}
      >
        {[
          ...(board.annotations ?? []),
          ...(draftStroke.length ? [draftStroke] : []),
        ].map((points, index) => (
          <path
            key={index}
            d={`M ${points[0].x} ${points[0].y} ${points
              .slice(1)
              .map((point) => `L ${point.x} ${point.y}`)
              .join(
                " ",
              )} ${points.length === 1 ? `L ${points[0].x + 0.001} ${points[0].y}` : ""}`}
            fill="none"
            stroke="#ffdf26"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {board.markers.filter((marker) => !fullScreen || teamView === "both" || marker.team === "ball" || marker.team === teamView).map((marker) => (
        <PitchMarker
          key={marker.id}
          team={marker.team}
          data-ball={marker.team === "ball" ? "true" : undefined}
          data-player-marker={marker.team !== "ball" ? marker.id : undefined}
          sx={{ zIndex: marker.team === "ball" ? 5 : 4 }}
          kit={match.kit}
          opponentColor={opponentColor}
          goalkeeper={goalkeeperPlate(
            lineup.starters[Number(marker.id.replace("slot-", ""))],
            formationSlots[lineup.formation][
              Number(marker.id.replace("slot-", ""))
            ],
          )}
          style={{ left: `${marker.point.x}%`, top: `${marker.point.y}%` }}
          onPointerDown={(e) => {
            if (drag.current || !e.isPrimary || e.button !== 0) return;
            e.preventDefault();
            if (marker.team === "ball") ballMotion.begin(e.clientX, e.clientY);
            e.currentTarget.parentElement?.setPointerCapture(e.pointerId);
            drag.current = {
              id: marker.id,
              pointerId: e.pointerId,
              x: e.clientX,
              y: e.clientY,
            };
          }}
          type="button"
          aria-label={
            marker.team === "ball"
              ? "Drag or flick soccer ball"
              : marker.team === "opponent"
                ? `Edit opponent ${marker.playerNumber || marker.label || marker.id}`
                : `Move ${marker.label}`
          }
        >
          {marker.team === "tbfc" ? (
            <NameplateText number={marker.playerNumber} name={marker.label} />
          ) : marker.team === "ball" ? (
            <SoccerBall point={marker.point} />
          ) : (
            <NameplateText number={marker.playerNumber} name={marker.label} />
          )}
        </PitchMarker>
      ))}
    </Pitch>
  );
  return (
    <Stack direction={{ xs: "column", lg: "row" }} gap={2}>
      <Box sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: 1 }}
        >
          <Button
            variant="outlined"
            sx={{ height: 36 }}
            onClick={() => {
              ballMotion.stop();
              setFullScreen(true);
            }}
          >
            Full Screen
          </Button>
          {annotationTools}
        </Stack>
        {!fullScreen && pitch}
        <Dialog
          fullScreen
          open={fullScreen}
          onClose={() => {
            ballMotion.stop();
            setFullScreen(false);
          }}
          slotProps={{
            paper: {
              sx: {
                height: "100dvh",
                overflow: "hidden",
                overscrollBehavior: "none",
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
              },
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: { xs: 1, sm: 2 }, py: 1, flexShrink: 0, flexWrap: "wrap", gap: 1 }}
          >
            <Typography variant="h6">Matchboard</Typography>
            {annotationTools}
            <Button variant="outlined" onClick={() => resetToLineup(true)}>
              Reset
            </Button>
            <IconButton
              aria-label="Exit Full Screen"
              onClick={() => {
                ballMotion.stop();
                setFullScreen(false);
              }}
              sx={{ color: "text.primary" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          {fullScreen && pitch}
        </Dialog>
        <Dialog
          open={Boolean(editingOpponentId)}
          onClose={() => setEditingOpponentId(null)}
          fullWidth
          maxWidth="xs"
        >
          <Stack gap={2} sx={{ p: 3 }}>
            <Typography variant="h6">Opponent player</Typography>
            <TextField
              label="Number"
              value={opponentNumber}
              onChange={(e) => setOpponentNumber(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Name"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              fullWidth
            />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setEditingOpponentId(null)}>Cancel</Button>
              <Button variant="contained" onClick={saveOpponent}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Dialog>
      </Box>
      <Stack gap={2} sx={{ width: { lg: 280 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Coaching Board</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              {canEditClub
                ? "Drag markers on the pitch. Positions save when released."
                : "Drag markers to try a setup. Changes stay on this board until you leave."}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Flick the ball to pass. It bounces off the sides and sticks to
              players. Drag a player to carry it, or flick the ball away again.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => resetToLineup(false)}
            >
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
