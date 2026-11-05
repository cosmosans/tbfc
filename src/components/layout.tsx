import { Box, Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const CardGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: 16,
});

export const FourColumnGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 16,
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
}));

export const InteractiveCard = styled(Card)({
  cursor: "pointer",
  border: "0px solid",
  transition: "transform .15s ease, border-color .15s ease",
  "&:hover": { transform: "translateY(-5px)", borderColor: "#f47730" },
});

export const LineupGrid = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 10,
});
