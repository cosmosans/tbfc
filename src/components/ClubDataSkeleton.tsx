import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

function TablePlaceholder() {
  return (
    <Card>
      <CardContent>
        {Array.from({ length: 6 }, (_, row) => (
          <Stack key={row} direction="row" gap={2} sx={{ py: 2, borderBottom: row < 5 ? "1px solid" : 0, borderColor: "divider" }}>
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
        <Skeleton width="35%" height={24} />
        <Stack direction="row" justifyContent="center" alignItems="center" gap={{ xs: 3, sm: 6 }} sx={{ py: 3 }}>
          {[0, 1, 2].map((item) => item === 1 ? (
            <Skeleton key={item} width={60} height={48} />
          ) : (
            <Stack key={item} alignItems="center" gap={1}>
              <Skeleton variant="circular" sx={{ width: { xs: 64, sm: 140 }, height: { xs: 64, sm: 140 } }} />
              <Skeleton sx={{ width: { xs: 70, sm: 130 } }} />
            </Stack>
          ))}
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

export default function ClubDataSkeleton({ view }: { view: string }) {
  const cards = view === "roster" || view === "teams" || view === "locations";
  const stats = view === "stats" || view === "seasons";
  return (
    <Box role="status" aria-label="Loading club data" aria-busy="true"
      sx={{ "@media (prefers-reduced-motion: reduce)": { "& .MuiSkeleton-root": { animation: "none" } } }}>
      <Stack gap={3} aria-hidden="true">
        {view === "schedule" ? (
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
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
              {Array.from({ length: 4 }, (_, index) => (
                <Card key={index}>
                  <CardContent>
                    <Skeleton variant="rectangular" height={view === "roster" ? 240 : 90} />
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
            <Skeleton variant="rectangular" sx={{ height: { xs: 380, sm: 500 } }} />
          </>
        )}
      </Stack>
    </Box>
  );
}
