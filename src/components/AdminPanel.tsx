import { clubApiRequest } from "../clubApiRequest";
import "./AdminLoader.css";
import streetSoccerBall from "../img/street-soccer-ball.webp";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const loadingCaptions = {
  manager: "Switching to Manager Mode...",
  player: "Switching to Player Mode...",
  backup: "Downloading production backup…",
};

export default function AdminPanel({
  open,
  onClose,
  authenticated,
  manageMode,
  onAuthChange,
  onManageModeChange,
  onBackupTools,
}: {
  open: boolean;
  onClose: () => void;
  authenticated: boolean;
  manageMode: boolean;
  onAuthChange: (authenticated: boolean) => void;
  onManageModeChange: (enabled: boolean) => Promise<void>;
  onBackupTools: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    keyof typeof loadingCaptions | null
  >(null);
  const [working, setWorking] = useState(false);
  const busy = working || pendingAction !== null;
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setChecking(true);
    setError("");
    void clubApiRequest("/api/admin/session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check admin access.");
        const status = await response.json();
        if (!controller.signal.aborted)
          onAuthChange(status.authenticated === true);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not check admin access.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, [open]);

  async function signIn() {
    if (!secret || busy) return;
    setWorking(true);
    setError("");
    const entered = secret;
    setSecret("");
    try {
      const response = await clubApiRequest("/api/admin/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret: entered }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      onAuthChange(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setWorking(false);
    }
  }

  async function changeManageMode(enabled: boolean) {
    setPendingAction(enabled ? "manager" : "player");
    setError("");
    try {
      await onManageModeChange(enabled);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not change Manage Mode.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function download() {
    setPendingAction("backup");
    setError("");
    try {
      const response = await clubApiRequest("/api/admin/backup", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Admin session expired. Sign in again."
            : "Could not download the backup.",
        );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tbfc-production-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not download the backup.",
      );
      if (cause instanceof Error && cause.message.includes("expired"))
        onAuthChange(false);
    } finally {
      setPendingAction(null);
    }
  }

  async function signOut() {
    setWorking(true);
    setError("");
    try {
      const response = await clubApiRequest("/api/admin/session", {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Could not sign out.");
      onAuthChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Admin Panel</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          {checking && (
            <Typography variant="body2">Checking access…</Typography>
          )}
          {!checking && !authenticated && (
            <>
              <Typography variant="body2" color="text.secondary">
                Enter the club admin secret to manage club data. This browser
                stays signed in for 30 days.
              </Typography>
              <form
                id="admin-panel-sign-in"
                onSubmit={(event) => {
                  event.preventDefault();
                  void signIn();
                }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  label="Club admin secret"
                  type="password"
                  autoComplete="off"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  disabled={busy}
                />
              </form>
            </>
          )}
          {!checking && authenticated && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={manageMode}
                    disabled={busy}
                    onChange={(_, enabled) => void changeManageMode(enabled)}
                  />
                }
                label="Manager Mode"
              />
              <Typography variant="body2" color="text.secondary">
                {manageMode
                  ? "Live editing is on for this browser."
                  : "Turn on Manage Mode to edit the live site."}
              </Typography>
              <Button
                variant="outlined"
                disabled={busy}
                onClick={() => void download()}
              >
                Download Production Backup
              </Button>
              {manageMode && (
                <Button
                  variant="outlined"
                  disabled={busy}
                  onClick={onBackupTools}
                >
                  Browser backup tools
                </Button>
              )}
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        {authenticated && (
          <Button disabled={busy} onClick={() => void signOut()}>
            Sign Out
          </Button>
        )}
        <Button disabled={busy} onClick={onClose}>
          Close
        </Button>
        {!authenticated && !checking && (
          <Button
            type="submit"
            form="admin-panel-sign-in"
            variant="contained"
            disabled={busy || !secret}
          >
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        )}
      </DialogActions>
      {pendingAction && (
        <div className="admin-loader" role="status">
          <div className="admin-loader-art" aria-hidden="true">
            <span className="admin-loader-paint" />
            <img src={streetSoccerBall} className="admin-loader-ball" alt="" />
          </div>
          <span className="admin-loader-caption">
            {loadingCaptions[pendingAction]}
          </span>
        </div>
      )}
    </Dialog>
  );
}
