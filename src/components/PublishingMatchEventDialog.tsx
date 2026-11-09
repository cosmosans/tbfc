import { Dialog } from "@mui/material";
import streetSoccerBall from "../img/street-soccer-ball.webp";
import "./AdminLoader.css";

export default function PublishingMatchEventDialog({
  open,
}: {
  open: boolean;
}) {
  return (
    <Dialog
      open={open}
      aria-label="Publishing..."
      PaperProps={{
        sx: {
          m: 2,
          width: "min(100%, 360px)",
          height: 250,
          bgcolor: "transparent",
          boxShadow: "none",
          overflow: "hidden",
        },
      }}
    >
      <div className="admin-loader" role="status" aria-live="polite">
        <div className="admin-loader-art" aria-hidden="true">
          <span className="admin-loader-paint" />
          <img src={streetSoccerBall} className="admin-loader-ball" alt="" />
        </div>
        <span className="admin-loader-caption">Publishing...</span>
      </div>
    </Dialog>
  );
}
