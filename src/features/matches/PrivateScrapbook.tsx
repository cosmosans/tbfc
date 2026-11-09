import { clubApiRequest } from "../../clubApiRequest";
import { useEffect, useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { MatchChatMessage, Player } from "../../model";
import { canEditClub } from "../../editAccess";
import OpeningBall from "../../img/street-soccer-ball.webp";
import "../../components/AdminLoader.css";
import MatchChat from "./MatchChat";

export default function PrivateScrapbook({
  matchId,
  players,
}: {
  matchId: string;
  players: Player[];
}) {
  const [messages, setMessages] = useState<MatchChatMessage[] | null>(null);
  const [expires, setExpires] = useState(0);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setOpening(true);
    setError("");
    setMessages(null);
    setExpires(0);
    void clubApiRequest(
      `/api/scrapbook?match=${encodeURIComponent(matchId)}`,
      {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (response.status === 401) return;
        if (!response.ok) throw new Error("Could not load the scrapbook.");
        const body = await response.json();
        if (!controller.signal.aborted) {
          setMessages(body.messages);
          setExpires(body.expires);
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setOpening(false);
      });
    return () => controller.abort();
  }, [matchId, refresh]);
  useEffect(() => {
    if (!expires) return;
    // Check frequently enough to clear an expired session after a suspended tab wakes.
    const check = () => {
      if (Date.now() >= expires * 1000) {
        setMessages(null);
        setExpires(0);
      }
    };
    const timer = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [expires]);
  useEffect(() => {
    const channel = new BroadcastChannel("scrapbook");
    channel.onmessage = () => {
      setMessages(null);
      setExpires(0);
      setRefresh((value) => value + 1);
    };
    return () => channel.close();
  }, []);
  function close() {
    if (!busy) {
      setOpen(false);
      setPassword("");
    }
  }
  async function unlock() {
    setOpening(true);
    setOpen(false);
    setBusy(true);
    setError("");
    try {
      const response = await clubApiRequest("/api/scrapbook", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Could not unlock the scrapbook.");
      setPassword("");
      setOpen(false);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setOpening(false);
      setOpen(true);
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not unlock the scrapbook.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function lock() {
    setBusy(true);
    setError("");
    try {
      const response = await clubApiRequest("/api/scrapbook", {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Could not log out. Please try again.");
      setMessages(null);
      setExpires(0);
      setRefresh((value) => value + 1);
      const channel = new BroadcastChannel("scrapbook");
      channel.postMessage("locked");
      channel.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not log out.");
    } finally {
      setBusy(false);
    }
  }
  async function saveMessages(next: MatchChatMessage[]) {
    if (!canEditClub || messages === null || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await clubApiRequest("/api/scrapbook", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matchId, messages: next, previous: messages }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Could not save the chat.");
      setMessages(body.messages);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save the chat.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack gap={2} sx={{ alignItems: "center" }}>
      {opening && (
        <Box
          className="admin-loader"
          role="status"
          sx={{ position: "relative", width: "100%", py: 2 }}
        >
          <div className="admin-loader-art" aria-hidden="true">
            <span className="admin-loader-paint" />
            <img src={OpeningBall} className="admin-loader-ball" alt="" />
          </div>
          <span className="admin-loader-caption">Opening Chat...</span>
        </Box>
      )}
      {!opening && messages === null && (
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${theme.palette.primary.main}`,
            p: 2,
            maxWidth: 500,
          })}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
            }}
          >
            <LockOutlinedIcon
              sx={{ color: "white", verticalAlign: "middle", mr: 0.5 }}
            />
            <strong>Team Chat is set to private.</strong>
          </Typography>
          <Button
            variant="contained"
            disabled={busy}
            sx={{ marginTop: 1 }}
            onClick={() =>
              messages === null ? (setError(""), setOpen(true)) : void lock()
            }
          >
            {messages === null && "Enter Team Password"}
          </Button>
        </Box>
      )}

      {error && !open && <Alert severity="error">{error}</Alert>}
      {!opening && messages !== null && (
        <MatchChat
          messages={messages}
          players={players}
          onSave={
            canEditClub && !busy ? (next) => void saveMessages(next) : undefined
          }
        />
      )}
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void unlock();
          }}
        >
          <DialogTitle>Enter Team Password</DialogTitle>
          <DialogContent>
            <Stack gap={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
              <Alert severity="info">
                This device will stay unlocked for 30 days.
              </Alert>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={busy || !password}
            >
              {busy ? "Unlocking…" : "Unlock"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
