// components/Questionnaire/RichTextField.jsx
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Box, IconButton, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import Placeholder from '@tiptap/extension-placeholder';


const RichTextField = ({ defaultValue, onChange, placeholder }) => {
  const [, forceUpdate] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: placeholder || 'Resposta',
      }),
    ],
    content: defaultValue || '',

    onUpdate: ({ editor }) => {
      onChange({ target: { value: editor.getHTML() } });
    },
      onTransaction: () => {
          forceUpdate((n) => n + 1);
      },
  });

  if (!editor) return null;

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: 1,
        '&:focus-within': {
          borderColor: 'primary.main',
          borderWidth: '1px',
        },
        '& .ProseMirror': {
          outline: 'none',
          padding: '16.5px 14px',
          minHeight: '56px',
          fontFamily: 'inherit',
          fontSize: '1rem',
        },
        '& .ProseMirror p': {
          margin: 0,
        },
        '& .ProseMirror p.is-editor-empty:first-of-type::before': {
          content: 'attr(data-placeholder)',
          color: '#9e9e9e',
          float: 'left',
          height: 0,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', p: 0.5, borderBottom: '1px solid #eee', backgroundColor: '#e4dede' }}>
        <IconButton
          size="small"
          sx={{
            color: editor.isActive('bold') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            color: editor.isActive('italic') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            color: editor.isActive('underline') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            color: editor.isActive('link') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => {
            const url = window.prompt('URL do link:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon fontSize="small" />
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <IconButton
          size="small"
          sx={{
            color: editor.isActive('bulletList') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            color: editor.isActive('orderedList') ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" sx={{ color: 'rgba(0, 0, 0, 0.6)' }} onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          <FormatClearIcon fontSize="small" />
        </IconButton>
      </Box>


      <EditorContent editor={editor} />
    </Box>




  );
};

export default RichTextField;
