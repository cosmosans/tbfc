import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Match } from "../../model";
import { saveStoryHtml, storyToHtml } from "./matchStory";

export default function MatchHistory({
  match,
  onSaveReport,
}: {
  match: Match;
  onSaveReport?: (report: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, refreshToolbar] = useState(0);
  const isFixture = match.status === "scheduled";
  const editor = useEditor({
    extensions: [StarterKit],
    content: storyToHtml(match.report ?? ""),
    onSelectionUpdate: () => refreshToolbar((value) => value + 1),
    onTransaction: () => refreshToolbar((value) => value + 1),
  });

  function openDialog() {
    editor?.commands.setContent(storyToHtml(match.report ?? ""));
    setDialogOpen(true);
  }

  function save() {
    if (editor) onSaveReport?.(saveStoryHtml(editor.getHTML()));
    setDialogOpen(false);
  }

  return (
    <Stack gap={2}>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">
              {isFixture ? "Fixture Notes" : "Match Story"}
            </Typography>
            {onSaveReport && (
              <Button variant="outlined" onClick={openDialog}>
                {match.report ? "Edit Story" : "Add Story"}
              </Button>
            )}
          </Stack>
          {match.report ? (
            <Box
              sx={{
                "& p": { my: 0, mb: 2 },
                "& p:last-child": { mb: 0 },
                "& ul, & ol": { pl: 3 },
                "& blockquote": { borderLeft: "3px solid", borderColor: "primary.main", pl: 2, ml: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: storyToHtml(match.report) }}
            />
          ) : (
            <Typography>
              {isFixture
                ? "No fixture notes yet."
                : "No report yet. Add a match report when the story is ready."}
            </Typography>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isFixture ? "Edit Fixture Notes" : "Edit Match Story"}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1, mb: 1 }}>
            <Button size="small" variant={editor?.isActive("bold") ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold">Bold</Button>
            <Button size="small" variant={editor?.isActive("italic") ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic">Italic</Button>
            <Button size="small" variant={editor?.isActive("heading", { level: 2 }) ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading">Heading</Button>
            <Button size="small" variant={editor?.isActive("bulletList") ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Bulleted list">Bullets</Button>
            <Button size="small" variant={editor?.isActive("orderedList") ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleOrderedList().run()} aria-label="Numbered list">Numbers</Button>
            <Button size="small" variant={editor?.isActive("blockquote") ? "contained" : "outlined"} onClick={() => editor?.chain().focus().toggleBlockquote().run()} aria-label="Quote">Quote</Button>
            <Button size="small" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>Undo</Button>
            <Button size="small" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>Redo</Button>
          </Stack>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "background.default",
              minHeight: 240,
              "& .tiptap": { minHeight: 240, p: 2, outline: "none" },
              "& .tiptap p": { my: 0, mb: 1.5 },
              "& .tiptap ul, & .tiptap ol": { pl: 3 },
              "& .tiptap blockquote": { borderLeft: "3px solid", borderColor: "primary.main", pl: 2, ml: 0 },
            }}
          >
            <EditorContent editor={editor} aria-label={isFixture ? "Fixture notes" : "Match story"} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save Story
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
