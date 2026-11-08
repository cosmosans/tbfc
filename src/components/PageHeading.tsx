import type { ReactNode } from "react";
import { Typography } from "@mui/material";

export default function PageHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h1"
      variant="h4"
      sx={{ bgcolor: "#111", color: "#fff", px: 2, py: 1, mt: 2, alignSelf: "flex-start" }}
    >
      {children}
    </Typography>
  );
}
