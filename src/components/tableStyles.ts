export const tableHeading = {
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: "1.5rem",
  color: "text.secondary",
} as const;

export const tablePaddingX = { xs: 0.5, sm: 1.5, lg: 2 };
export const sortLabelStyle = {
  color: "inherit",
  font: "inherit",
  "&.Mui-active, &.Mui-active .MuiTableSortLabel-icon": { color: "primary.main" },
};

export const tableStyles = {
  "& .MuiTableCell-root": { px: tablePaddingX, py: 2, fontSize: "0.875rem" },
  "& thead": { bgcolor: "action.hover" },
  "& thead th": tableHeading,
  "& .MuiTableSortLabel-root": sortLabelStyle,
};
