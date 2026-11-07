import {
  AppBar,
  Box,
  IconButton,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export type NavigationPage =
  | "matches"
  | "schedule"
  | "roster"
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
  "@media (max-width: 599.95px)": {
    width: "auto",
    justifyContent: "flex-start",
    gap: 8,
  },
});
const BrandCrest = styled("img")({
  width: 48,
  height: 48,
  objectFit: "contain",
  "@media (max-width: 599.95px)": { width: 36, height: 36 },
  filter: "drop-shadow(0 2px 3px #0008)",
});
const Navigation = styled(Tabs)({
  minHeight: 64,
  "@media (max-width: 599.95px)": { minHeight: 44 },
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
  "@media (max-width: 599.95px)": {
    minHeight: 44,
    minWidth: 0,
    padding: "8px 10px",
    fontSize: ".75rem",
  },
  fontWeight: 700,
  "&.Mui-selected": { color: "#fff" },
});

export default function AppHeader({
  page,
  onNavigate,
  onAdmin,
}: {
  page: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onAdmin?: () => void;
}) {
  return (
    <Header position="sticky" elevation={0}>
      <Toolbar
        sx={{
          minHeight: 76,
          gap: { xs: 0.5, sm: 2 },
          py: { xs: 1, sm: 0 },
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
            sx={{
              fontWeight: 800,
              letterSpacing: "-.04em",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Turf Burners FC
          </Typography>
        </Brand>
        <Navigation
          value={page}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            ml: { md: "auto" },
            maxWidth: "100%",
            minWidth: 0,
            flexShrink: 1,
            width: { xs: "100%", sm: "auto" },
            order: { xs: 2, md: 0 },
          }}
        >
          <NavigationTab
            value="matches"
            label="Matchday"
            onClick={() => onNavigate("matches")}
          />
          <NavigationTab
            value="schedule"
            label="Schedule"
            onClick={() => onNavigate("schedule")}
          />
          <NavigationTab
            value="roster"
            label="Roster"
            onClick={() => onNavigate("roster")}
          />
          {/* <NavigationTab value="tactics" label="Tactics" /> */}
          <NavigationTab
            value="stats"
            label="Stats"
            onClick={() => onNavigate("stats")}
          />
          <NavigationTab
            value="teams"
            label="Teams"
            onClick={() => onNavigate("teams")}
          />
          {/* <NavigationTab value="locations" label="Locations" />
          <NavigationTab value="seasons" label="Seasons" /> */}
        </Navigation>
        {onAdmin && (
          <IconButton onClick={onAdmin} aria-label="Open Admin Panel" title="Admin Panel"
            sx={{ color: "#fff", border: "1px solid #ffffff99", borderRadius: 1, width: 44, height: 44, flexShrink: 0, order: { xs: 1, md: 0 }, ml: { xs: "auto", md: 0 }, "&:hover": { borderColor: "#fff" } }}>
            <Box component="img" src="/icons/admin-flame.svg" alt="" aria-hidden="true" sx={{ width: 25, height: 25 }} />
          </IconButton>
        )}
      </Toolbar>
    </Header>
  );
}
