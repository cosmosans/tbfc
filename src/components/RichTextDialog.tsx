import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { saveStoryHtml, storyToHtml } from "../features/matches/matchStory";

export default function RichTextDialog({ title, value, saveLabel, onClose, onSave }: {
  title: string;
  value: string;
  saveLabel: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [, refreshToolbar] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit],
    content: storyToHtml(value),
    editorProps: { attributes: { role: "textbox", "aria-label": title, "aria-multiline": "true" } },
    onTransaction: () => refreshToolbar(n => n + 1),
  });
  return (
      <Dialog
        open
        onClose={onClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1, mb: 1 }}>
            <Button
              size="small"
              variant={editor?.isActive("bold") ? "contained" : "outlined"}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              aria-label="Bold"
            >
              Bold
            </Button>
            <Button
              size="small"
              variant={editor?.isActive("italic") ? "contained" : "outlined"}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              aria-label="Italic"
            >
              Italic
            </Button>
            <Button
              size="small"
              variant={
                editor?.isActive("heading", { level: 2 })
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              aria-label="Heading"
            >
              Heading
            </Button>
            <Button
              size="small"
              variant={
                editor?.isActive("bulletList") ? "contained" : "outlined"
              }
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              aria-label="Bulleted list"
            >
              Bullets
            </Button>
            <Button
              size="small"
              variant={
                editor?.isActive("orderedList") ? "contained" : "outlined"
              }
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              aria-label="Numbered list"
            >
              Numbers
            </Button>
            <Button
              size="small"
              variant={
                editor?.isActive("blockquote") ? "contained" : "outlined"
              }
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              aria-label="Quote"
            >
              Quote
            </Button>
            <Button
              size="small"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
            >
              Undo
            </Button>
            <Button
              size="small"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
            >
              Redo
            </Button>
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
              "& .tiptap blockquote": {
                borderLeft: "3px solid",
                borderColor: "primary.main",
                pl: 2,
                ml: 0,
              },
            }}
          >
            <EditorContent editor={editor} aria-label={title} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" disabled={!editor} onClick={() => {
              if (editor) onSave(saveStoryHtml(editor.getHTML()));
            }}>
            {saveLabel}
          </Button>
        </DialogActions>
      </Dialog>
  );
}
