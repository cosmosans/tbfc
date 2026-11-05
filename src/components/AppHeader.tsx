import {
  AppBar,
  Box,
  Button,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export type NavigationPage =
  | "matches"
  | "schedule"
  | "squad"
  | "tactics"
  | "teams"
  | "locations"
  | "stats";
const Header = styled(AppBar)({
  background: "#CA5126",
});
const Brand = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  whiteSpace: "nowrap",
  cursor: "pointer",
});
const BrandCrest = styled("img")({
  width: 48,
  height: 48,
  objectFit: "contain",
  filter: "drop-shadow(0 2px 3px #0008)",
});
const Navigation = styled(Tabs)({
  minHeight: 64,
  "& .MuiTabs-indicator": {
    height: 5,
    background: "#ebebeb",
    transform: "skewX(-25deg)",
  },
});
const NavigationTab = styled(Tab)({
  minHeight: 64,
  color: "#fff",
  fontSize: "1.05rem",
  fontWeight: 700,
  "&.Mui-selected": { color: "#fff" },
});

export default function AppHeader({
  page,
  onNavigate,
  onBackup,
}: {
  page: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onBackup: () => void;
}) {
  return (
    <Header position="sticky" elevation={0}>
      <Toolbar
        sx={{
          minHeight: 76,
          gap: 2,
          flexWrap: { xs: "wrap", md: "nowrap" },
          px: { xs: 2, md: 4 },
        }}
      >
        <Brand
          onClick={() => onNavigate("matches")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") onNavigate("matches");
          }}
        >
          <BrandCrest src="/crests/tbfc.png" alt="TBFC crest" />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: "-.04em" }}
          >
            TURF BURNERS FC
          </Typography>
        </Brand>
        <Navigation
          value={page}
          onChange={(_, value: NavigationPage) => onNavigate(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            ml: { md: "auto" },
            maxWidth: "100%",
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          <NavigationTab value="matches" label="Matchday" />
          <NavigationTab value="schedule" label="Schedule" />
          <NavigationTab value="squad" label="Squad" />
          <NavigationTab value="tactics" label="Tactics" />
          <NavigationTab value="teams" label="Teams" />
          <NavigationTab value="locations" label="Locations" />
          <NavigationTab value="stats" label="Stats" />
        </Navigation>
        <Button
          variant="outlined"
          onClick={onBackup}
          sx={{
            color: "#fff",
            borderColor: "#ffffff99",
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { borderColor: "#fff" },
          }}
        >
          Backup
        </Button>
      </Toolbar>
    </Header>
  );
}
