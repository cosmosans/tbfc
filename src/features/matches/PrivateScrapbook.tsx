import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import type { MatchChatMessage, Player } from "../../model";
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
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setMessages(null);
    setExpires(0);
    void fetch("/api/scrapbook?match=" + encodeURIComponent(matchId), {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
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
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/scrapbook", {
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
      const response = await fetch("/api/scrapbook", {
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
  return (
    <Stack gap={2}>
      <Button
        variant="outlined"
        disabled={busy}
        sx={{ alignSelf: "flex-start" }}
        onClick={() =>
          messages === null ? (setError(""), setOpen(true)) : void lock()
        }
      >
        {messages === null ? "Unlock Scrapbook" : "Lock Scrapbook"}
      </Button>
      {error && !open && <Alert severity="error">{error}</Alert>}
      {messages !== null && <MatchChat messages={messages} players={players} />}
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void unlock();
          }}
        >
          <DialogTitle>Unlock Scrapbook</DialogTitle>
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
                Private chats. This device stays unlocked for 30 days, or until
                you lock the scrapbook.
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
