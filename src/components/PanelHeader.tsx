import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export const panelBorder = { borderTop: "3px solid", borderTopColor: "primary.main" };

export default function PanelHeader({ title, context, children }: {
  title: string;
  context?: string;
  children?: ReactNode;
}) {
  return (
    <Stack component="header" direction="row" alignItems="center" flexWrap="wrap"
      gap={2} sx={{ ...panelBorder, bgcolor: "background.paper", p: { xs: 2, sm: 3 } }}>
      <Typography component="h2" variant="h5" color="text.secondary" sx={{ flex: 1, fontWeight: 700 }}>
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
