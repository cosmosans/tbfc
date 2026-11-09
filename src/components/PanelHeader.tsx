import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export default function PanelHeader({ title, context, children }: {
  title: string;
  context?: string;
  children?: ReactNode;
}) {
  return (
    <Stack component="header" direction="row" alignItems="center" flexWrap="wrap"
      gap={2} sx={{ bgcolor: "background.paper", p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" color="text.secondary" sx={{ flex: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      {context && (
        <Typography variant="body2" color="text.secondary"
          sx={{ textAlign: "right", fontSize: 12, order: { xs: 1, md: 0 }, width: { xs: "100%", md: "auto" } }}>
          {context}
        </Typography>
      )}
      {children}
    </Stack>
  );
}
