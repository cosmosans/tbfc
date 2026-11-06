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
  "@media (max-width: 599.95px)": { width: "100%", justifyContent: "center", gap: 8 },
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
  "@media (max-width: 599.95px)": { minHeight: 44, minWidth: 0, padding: "8px 10px", fontSize: ".75rem" },
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
  onBackup?: () => void;
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
            sx={{ fontWeight: 800, letterSpacing: "-.04em", fontSize: { xs: "1rem", sm: "1.25rem" } }}
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
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <NavigationTab value="matches" label="Matchday" />
          <NavigationTab value="schedule" label="Schedule" />
          <NavigationTab value="roster" label="roster" />
          {/* <NavigationTab value="tactics" label="Tactics" /> */}
          <NavigationTab value="stats" label="Stats" />
          <NavigationTab value="teams" label="Teams" />
          {/* <NavigationTab value="locations" label="Locations" />
          <NavigationTab value="seasons" label="Seasons" /> */}
        </Navigation>
        {onBackup && (
          <Button
            variant="outlined"
            onClick={onBackup}
            sx={{
              color: "#fff",
              borderColor: "#ffffff99",
              display: { xs: "none", lg: "inline-flex" },
              whiteSpace: "nowrap",
              flexShrink: 0,
              mx: { xs: "auto", sm: 0 },
              fontSize: { xs: ".75rem", sm: ".875rem" },
              minHeight: { xs: 36, sm: 0 },
              py: { xs: 0.5, sm: 0.75 },
              "&:hover": { borderColor: "#fff" },
            }}
          >
            Backup
          </Button>
        )}
      </Toolbar>
    </Header>
  );
}
