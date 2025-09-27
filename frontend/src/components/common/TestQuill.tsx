import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Typography, Paper } from '@mui/material';

export default function TestQuill() {
  const [value, setValue] = useState('');

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
  }), []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test ReactQuill Component
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Current value: {value || '(empty)'}
        </Typography>
      </Box>

      <Box sx={{ '& .ql-editor': { minHeight: '100px' } }}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          placeholder="Type something here..."
          modules={modules}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Preview:
        </Typography>
        <Box
          sx={{ '& img': { maxWidth: '100%' }, '& ul, & ol': { pl: 3 } }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </Box>
    </Paper>
  );
}
