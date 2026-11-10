import { useRef, useState } from "react";
import { IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export function useMediaOrder<T extends { id: string }>(items: T[], save?: (items: T[]) => void) {
  const grid = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<string | null>(null);

  function move(id: string, to: number) {
    const from = items.findIndex(item => item.id === id);
    if (!save || from < 0 || to < 0 || to >= items.length || from === to) return;
    const next = items.slice();
    next.splice(to, 0, next.splice(from, 1)[0]);
    save(next);
  }

  function hit(x: number, y: number) {
    const tile = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-media-id]");
    return tile && grid.current?.contains(tile) ? tile.dataset.mediaId : undefined;
  }

  function handle(id: string, label: string) {
    if (!save || items.length < 2) return null;
    return <IconButton size="small" aria-label={`Reorder ${label}`}
      title="Drag to reorder, or use the arrow keys"
      sx={{ touchAction: "none", cursor: "grab", "&:active": { cursor: "grabbing" } }}
      onPointerDown={event => {
        if (event.button === 0) event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) setTarget(hit(event.clientX, event.clientY) ?? null);
      }}
      onPointerUp={event => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const destination = hit(event.clientX, event.clientY);
        move(id, items.findIndex(item => item.id === destination));
        setTarget(null);
      }}
      onLostPointerCapture={() => setTarget(null)}
      onKeyDown={event => {
        const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
        if (delta) {
          event.preventDefault();
          move(id, items.findIndex(item => item.id === id) + delta);
        }
      }}>
      <DragIndicatorIcon fontSize="small" />
    </IconButton>;
  }
  return { grid, target, handle };
}
