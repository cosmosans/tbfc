import { Box } from "@mui/material";

/** Three pitch lanes, with the selected lane highlighted in orange. */
export default function PitchIndicator({ pitch }: { pitch: string }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 24"
      role="img"
      aria-label={`Pitch ${pitch}`}
      sx={{ width: { xs: 34, sm: 48 }, height: "auto", display: "block", flexShrink: 0 }}
    >
      {[1, 2, 3].map((lane) => (
        <path
          key={lane}
          d={`M${(lane - 1) * 16 + 4} 1h11l-4 22H${(lane - 1) * 16}z`}
          fill={pitch === String(lane) ? "#db6337" : "#b6b6b6"}
        />
      ))}
    </Box>
  );
}
