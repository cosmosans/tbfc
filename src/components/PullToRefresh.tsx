import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const triggerDistance = 64;

export default function PullToRefresh({
  enabled,
  onRefresh,
}: {
  enabled: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled || refreshing) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let pulled = 0;

    const atTop = () => (document.scrollingElement?.scrollTop ?? window.scrollY) <= 0;
    const onStart = (event: TouchEvent) => {
      const target = event.target;
      if (event.touches.length !== 1 || !atTop() || !(target instanceof Element) ||
          target.closest("#club-header, nav, input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      pulled = 0;
      tracking = true;
    };
    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const vertical = event.touches[0].clientY - startY;
      const horizontal = event.touches[0].clientX - startX;
      if (vertical <= 0 || Math.abs(horizontal) > vertical || !atTop()) {
        tracking = false;
        setDistance(0);
        return;
      }
      event.preventDefault();
      pulled = Math.min(96, vertical * 0.5);
      setDistance(pulled);
    };
    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      setDistance(0);
      if (pulled < triggerDistance) return;
      setRefreshing(true);
      void refreshRef.current().finally(() => setRefreshing(false));
    };
    const onCancel = () => {
      tracking = false;
      pulled = 0;
      setDistance(0);
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onCancel);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onCancel);
    };
  }, [enabled, refreshing]);

  if (!enabled && !refreshing) return null;
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 104px)",
        left: "50%",
        transform: `translate(-50%, ${refreshing ? 0 : Math.max(-64, distance - 64)}px)`,
        opacity: refreshing || distance > 8 ? 1 : 0,
        transition: refreshing ? "opacity .2s ease" : "transform .1s ease, opacity .1s ease",
        zIndex: (theme) => theme.zIndex.appBar + 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: 3,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {refreshing ? <CircularProgress size={18} /> : <KeyboardArrowDownIcon sx={{ transform: distance >= triggerDistance ? "rotate(180deg)" : "none" }} />}
      <Typography variant="body2">{refreshing ? "Refreshing…" : distance >= triggerDistance ? "Release to refresh" : "Pull to refresh"}</Typography>
    </Box>
  );
}
