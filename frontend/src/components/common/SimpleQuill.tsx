import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Typography, Paper, TextField } from '@mui/material';

export default function SimpleQuill() {
  const [value, setValue] = useState('');

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Simple Quill Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Value: {value || '(empty)'}
        </Typography>
      </Box>

      <Box sx={{ 
        '& .ql-container': { 
          border: '1px solid #ccc',
          borderRadius: '4px'
        },
        '& .ql-editor': { 
          minHeight: '100px',
          fontSize: '14px'
        }
      }}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          placeholder="Type here..."
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Alternative Text Input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />
      </Box>
    </Paper>
  );
}

