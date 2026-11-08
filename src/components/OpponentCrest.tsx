import { useState } from "react";
import { styled } from "@mui/material/styles";
import ShieldIcon from "@mui/icons-material/Shield";
import { Link } from "react-router-dom";

const CrestFrame = styled("span", {
  shouldForwardProp: (prop) =>
    prop !== "compact" && prop !== "size" && prop !== "mobileSize",
})<{ compact: boolean; size?: number; mobileSize?: number }>(
  ({ compact, size, mobileSize }) => ({
    width: size ?? (compact ? 42 : 58),
    height: size ?? (compact ? 42 : 58),
    position: "relative",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    overflow: "visible",
    ...(mobileSize
      ? {
          "@media (max-width: 599.95px)": {
            width: mobileSize,
            height: mobileSize,
          },
        }
      : {}),
  }),
);

const CrestImage = styled("img")({
  display: "block",
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  filter: "drop-shadow(0 2px 3px rgba(0,0,0,.4))",
});

export default function OpponentCrest({
  url,
  compact = false,
  size,
  mobileSize,
  teamId,
  teamName,
}: {
  url?: string;
  compact?: boolean;
  size?: number;
  mobileSize?: number;
  teamId?: string;
  teamName?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const crest = (
    <CrestFrame
      compact={compact}
      size={size}
      mobileSize={mobileSize}
      aria-hidden="true"
    >
      {url && url !== failedUrl ? (
        <CrestImage src={url} alt="" onError={() => setFailedUrl(url)} />
      ) : (
        <ShieldIcon
          viewBox="2 1 20 22"
          sx={{
            width: "100%",
            height: "100%",
            color: "#828892",
            stroke: "#f2f3f5",
            strokeWidth: 0.85,
          }}
        />
      )}
    </CrestFrame>
  );
  return teamId ? (
    <Link
      to={`/team/${encodeURIComponent(teamId)}`}
      aria-label={`View ${teamName ?? "team"} history`}
      onClick={(event) => event.stopPropagation()}
      style={{ display: "inline-flex", flex: "0 0 auto" }}
    >
      {crest}
    </Link>
  ) : (
    crest
  );
}
