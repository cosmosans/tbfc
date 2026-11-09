import { Chip } from "@mui/material";

export default function TimelineMarker({ minute, compact = false }: {
  minute?: number;
  compact?: boolean;
}) {
  return (
    <Chip
      component="span"
      size={compact ? "small" : "medium"}
      sx={{ height: compact ? 20 : 28, flexShrink: 0 }}
      label={minute == null ? "Time Unknown" : `${minute}′`}
    />
  );
}
