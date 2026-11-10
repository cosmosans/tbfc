import { PlayerCardFrame, PlayerPhoto, PlayerInformation } from "../features/roster/PlayerCard.styles";
import { FourColumnGrid } from "./layout";
import PanelHeader from "./PanelHeader";
import PageHeading from "./PageHeading";
import { canEditClub } from "../editAccess";
import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

function TeamsPlaceholder({ count }: { count: number }) {
  return (
    <Stack gap={2}>
      <PageHeading>Teams</PageHeading>
      {canEditClub && (
        <Stack direction="row" gap={2}>
          <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" height={40} width={96} />
        </Stack>
      )}
      <FourColumnGrid>
        {Array.from({ length: count || 12 }, (_, index) => (
          <Card key={index}>
            <CardContent sx={{ pt: 2.5, px: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={2}>
                <Skeleton variant="circular" width={58} height={58} />
                <Box sx={{ flex: 1 }}><Skeleton width="75%" height={28} /></Box>
                <Skeleton variant="rounded" width={48} height={54} />
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: "5px", px: "5px", height: 28 }}>
                <Skeleton width={18} /><Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="rectangular" height={24} sx={{ flex: 1, transform: "skewX(-10deg)" }} />
                <Skeleton variant="circular" width={20} height={20} /><Skeleton width={18} />
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3, mb: -1 }}>
                {canEditClub && <Skeleton variant="rectangular" width={64} height={36} />}
                <Skeleton variant="rectangular" width={102} height={36} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </FourColumnGrid>
    </Stack>
  );
}

function RosterPlaceholder() {
  return <Stack gap={2}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <PageHeading>Roster</PageHeading>
      {canEditClub && <Stack direction="row" gap={2}>
        <Skeleton variant="rectangular" width={100} height={36} />
        <Skeleton variant="rectangular" width={110} height={36} />
      </Stack>}
    </Stack>
    {["Active Roster", "Retired Roster"].map((title, index) => (
      <Box key={title} sx={{ bgcolor: "background.paper" }}>
        <PanelHeader title={title} />
        {Array.from({ length: index === 0 ? 5 : 3 }, (_, index) => {
          const header = index === 0;
          return <PlayerCardFrame key={index} as="div" style={header ? { height: "auto" } : undefined}>
            <Box sx={{ display: header ? { xs: "none", sm: "flex" } : "flex",
              height: "100%", bgcolor: header ? "action.hover" : undefined }}>
              <PlayerPhoto>{header ? <Skeleton width={40} /> : <Skeleton variant="rectangular" width="100%" height="100%" />}</PlayerPhoto>
              <PlayerInformation as="div">
                <Skeleton sx={{ gridArea: "number" }} width={header ? 46 : 40} height={header ? 24 : 64} />
                <Box sx={{ gridArea: "identity" }}>
                  <Skeleton width={header ? 40 : "65%"} sx={{ maxWidth: 160 }} />
                  {!header && <Skeleton width="40%" sx={{ maxWidth: 100 }} />}
                </Box>
                <Box sx={{ gridArea: "stats", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: { xs: 1, md: 2 }, justifyItems: { xs: "center", sm: "start" } }}>
                  {[0, 1, 2].map(stat => <Skeleton key={stat} width={header ? 60 : 22} />)}
                </Box>
                <Skeleton sx={{ gridArea: "status", justifySelf: "end" }} width={48} />
              </PlayerInformation>
            </Box>
          </PlayerCardFrame>;
        })}
      </Box>
    ))}
  </Stack>;
}

function TablePlaceholder() {
  return (
    <Card>
      <CardContent>
        {Array.from({ length: 6 }, (_, row) => (
          <Stack
            key={row}
            direction="row"
            gap={2}
            sx={{
              py: 2,
              borderBottom: row < 5 ? "1px solid" : 0,
              borderColor: "divider",
            }}
          >
            <Skeleton width="22%" />
            <Skeleton width="18%" />
            <Skeleton width="35%" />
            <Skeleton width="15%" />
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}

function MatchPlaceholder() {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={{ xs: 3, sm: 6 }}
          sx={{ py: 3 }}
        >
          {[0, 1, 2].map((item) =>
            item === 1 ? (
              <Skeleton key={item} width={60} height={48} />
            ) : (
              <Stack key={item} alignItems="center" gap={1}>
                <Skeleton
                  variant="circular"
                  sx={{
                    width: { xs: 64, sm: 140 },
                    height: { xs: 64, sm: 140 },
                  }}
                />
                <Skeleton sx={{ width: { xs: 70, sm: 130 } }} />
              </Stack>
            ),
          )}
        </Stack>
        <Skeleton variant="rectangular" height={24} />
        <Stack alignItems="center" gap={1} sx={{ mt: 3 }}>
          <Skeleton width="50%" height={30} />
          <Skeleton width="60%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ClubDataSkeleton({ view, teamCount = 0 }: { view: string; teamCount?: number }) {
  const cards = view === "player" || view === "locations";
  const stats = view === "stats" || view === "seasons";
  return (
    <Box
      role="status"
      aria-label="Loading club data"
      aria-busy="true"
      sx={{
        "@media (prefers-reduced-motion: reduce)": {
          "& .MuiSkeleton-root": { animation: "none" },
        },
      }}
    >
      <Stack gap={3} aria-hidden="true">
        {view === "teams" ? <TeamsPlaceholder count={teamCount} /> : view === "roster" ? <RosterPlaceholder /> : view === "schedule" ? (
          <>
            <Stack direction="row" gap={2}>
              <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" width="25%" height={40} />
            </Stack>
            <TablePlaceholder />
          </>
        ) : cards || stats ? (
          <>
            {stats && <Skeleton variant="rectangular" height={340} />}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {Array.from({ length: 4 }, (_, index) => (
                <Card key={index}>
                  <CardContent>
                    <Skeleton width="70%" height={32} sx={{ mt: 2 }} />
                    <Skeleton width="45%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        ) : (
          <>
            <MatchPlaceholder />
            <Skeleton variant="rectangular" height={44} />
            <Skeleton
              variant="rectangular"
              sx={{ height: { xs: 380, sm: 500 } }}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
