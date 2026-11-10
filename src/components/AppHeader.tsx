import matchdayActiveIcon from "../img/nav/matchday-active.svg";
import matchdayIcon from "../img/nav/matchday.svg";
import scheduleActiveIcon from "../img/nav/schedule-active.svg";
import scheduleIcon from "../img/nav/schedule.svg";
import squadActiveIcon from "../img/nav/squad-active.svg";
import squadIcon from "../img/nav/squad.svg";
import statsActiveIcon from "../img/nav/stats-active.svg";
import statsIcon from "../img/nav/stats.svg";
import teamsActiveIcon from "../img/nav/teams-active.svg";
import teamsIcon from "../img/nav/teams.svg";
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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import type { MatchTab } from "../features/matches/matchTabs";

export type NavigationPage =
  | "matches"
  | "schedule"
  | "roster"
  | "tactics"
  | "teams"
  | "locations"
  | "stats";
const Header = styled(AppBar)({
  paddingTop: "var(--club-safe-top, env(safe-area-inset-top, 0px))",
  background: "#CA5126",
});
const Brand = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  whiteSpace: "nowrap",
  cursor: "pointer",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  "@media (max-width: 599.95px)": {
    width: "auto",
    justifyContent: "center",
    gap: 8,
  },
});
const mobileCrestSize = 36;
const BrandCrest = styled("img")({
  width: 48,
  height: 48,
  objectFit: "contain",
  "@media (max-width: 599.95px)": {
    width: mobileCrestSize,
    height: mobileCrestSize,
  },
  filter: "drop-shadow(0 2px 3px #0008)",
});
const primaryItems = [
  {
    page: "matches",
    label: "Matchday",
    active: matchdayActiveIcon,
    inactive: matchdayIcon,
  },
  {
    page: "schedule",
    label: "Schedule",
    active: scheduleActiveIcon,
    inactive: scheduleIcon,
  },
  {
    page: "roster",
    label: "Roster",
    active: squadActiveIcon,
    inactive: squadIcon,
  },
  {
    page: "stats",
    label: "Stats",
    active: statsActiveIcon,
    inactive: statsIcon,
  },
  {
    page: "teams",
    label: "Teams",
    active: teamsActiveIcon,
    inactive: teamsIcon,
  },
] as const;

export default function AppHeader({
  page,
  onNavigate,
  onAdmin,
  onBack,
  matchTab,
  matchTabOptions,
  onMatchTabChange,
}: {
  page: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onAdmin?: () => void;
  onBack?: () => void;
  matchTab?: MatchTab;
  matchTabOptions?: readonly MatchTab[];
  onMatchTabChange?: (tab: MatchTab) => void;
}) {
  return (
    <>
      <Header id="club-header" position="sticky" elevation={0}>
        <Toolbar
          sx={{
            minHeight: { xs: 48, sm: 56 },
            position: "relative",
            gap: { xs: 0.5, sm: 2 },
            flexWrap: "nowrap",
            px: { xs: 2, md: 4 },
          }}
        >
          {onBack && (
            <IconButton
              onClick={onBack}
              aria-label="Back"
              title="Back"
              sx={{
                color: "#fff",
                flexShrink: 0,
                mr: { xs: 0, sm: 1 },
                width: 44,
                height: 44,
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
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
          {onAdmin && (
            <IconButton
              onClick={onAdmin}
              aria-label="Open Admin Panel"
              title="Admin Panel"
              sx={{
                color: "#fff",
                border: 0,
                width: 44,
                height: 44,
                p: { xs: 0, sm: 1 },
                flexShrink: 0,
                order: { xs: 1, md: 0 },
                ml: "auto",
              }}
            >
              <Box
                component="img"
                src="/icons/soccer-settings.svg"
                alt=""
                aria-hidden="true"
                sx={{ width: 25, height: 25 }}
              />
            </IconButton>
          )}
        </Toolbar>
        {matchTab && matchTabOptions && onMatchTabChange && (
          <Tabs
            aria-label="Match navigation"
            value={matchTab}
            onChange={(_, value: MatchTab) => onMatchTabChange(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              px: 1,
              "& .MuiTabs-list": {
                justifyContent: { lg: "center" },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#fff",
                height: 4,
                transform: "skewX(-25deg)",
              },
            }}
          >
            {matchTabOptions.map((tab) => (
              <Tab
                key={tab}
                value={tab}
                label={
                  tab === "story"
                    ? "Report"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)
                }
                sx={{
                  textTransform: "none",
                  color: "#fff",
                  fontWeight: 700,
                  minHeight: 48,
                  "&.Mui-selected": { color: "#fff" },
                }}
              />
            ))}
          </Tabs>
        )}
      </Header>
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          display: "grid",
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          gridTemplateColumns: "repeat(5, minmax(0, 144px))",
          justifyContent: "center",
          bgcolor: "#111",
          borderTop: "1px solid #333",
          pb: "env(safe-area-inset-bottom, 0px)",
          boxShadow: "0 -4px 18px #0008",
          "@media (width > 1200px)": {
            top: 0, right: "auto", width: "var(--nav-rail-width)",
            gridTemplateColumns: "1fr", gridAutoRows: "min-content",
            alignContent: "start", overflowY: "auto",
            pt: "env(safe-area-inset-top, 0px)",
            borderTop: 0, borderRight: "1px solid #333", boxShadow: "none",
          },
        }}
      >
        {primaryItems.map((item) => {
          const active = page === item.page;
          return (
            <Box
              key={item.page}
              component="button"
              type="button"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.page)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.35,
                minWidth: 0,
                minHeight: 62,
                py: 0.75,
                px: 0.25,
                color: active ? "#CA5126" : "#777",
                bgcolor: "transparent",
                border: 0,
                cursor: "pointer",
                font: "inherit",
                fontSize: "0.62rem",
                fontWeight: 800,
                textTransform: "uppercase",
                "&:focus-visible": {
                  outline: "2px solid #fff",
                  outlineOffset: -3,
                },
              }}
            >
              <Box
                component="img"
                src={active ? item.active : item.inactive}
                alt=""
                aria-hidden="true"
                sx={{
                  width: 27,
                  height: 27,
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {item.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
