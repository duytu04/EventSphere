import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Alert,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export default function EventEditRequestDemo() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState<string>('');
  const [requestedData, setRequestedData] = useState<string>('');

  const handleCreateEditRequest = async () => {
    if (!eventId || !requestedData) {
      enqueueSnackbar('Vui lòng nhập đầy đủ thông tin', { variant: 'error' });
      return;
    }

    try {
      // TODO: Gọi API tạo EventEditRequest
      const response = await fetch(`/api/events/${eventId}/edit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          requestedData: JSON.parse(requestedData)
        }),
      });

      if (response.ok) {
        enqueueSnackbar('Tạo yêu cầu chỉnh sửa thành công', { variant: 'success' });
        navigate('/organizer/events');
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Có lỗi xảy ra', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi tạo yêu cầu', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardHeader 
          title="Demo: Tạo Yêu Cầu Chỉnh Sửa Sự Kiện"
          subheader="Test tính năng EventEditRequest"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong>
                <br />1. Nhập ID sự kiện đã được APPROVED
                <br />2. Nhập dữ liệu muốn chỉnh sửa (JSON format)
                <br />3. Nhấn "Tạo Yêu Cầu" để gửi cho Admin
              </Typography>
            </Alert>

            <TextField
              label="Event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Nhập ID sự kiện"
              fullWidth
            />

            <TextField
              label="Requested Data (JSON)"
              value={requestedData}
              onChange={(e) => setRequestedData(e.target.value)}
              placeholder='{"title": "Tên sự kiện mới", "description": "Mô tả mới"}'
              multiline
              rows={4}
              fullWidth
            />

            <Divider />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleCreateEditRequest}
                disabled={!eventId || !requestedData}
              >
                Tạo Yêu Cầu
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/organizer/events')}
              >
                Quay Lại
              </Button>
            </Stack>

            <Box>
              <Typography variant="h6" gutterBottom>
                Test Cases:
              </Typography>
              <Stack spacing={1}>
                <Chip 
                  label="✅ Sự kiện DRAFT: Có thể sửa trực tiếp" 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label="✅ Sự kiện PENDING: Có thể sửa trực tiếp" 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label="❌ Sự kiện APPROVED: Phải tạo yêu cầu" 
                  color="error" 
                  size="small" 
                />
                <Chip 
                  label="✅ Admin: Có thể sửa mọi sự kiện" 
                  color="info" 
                  size="small" 
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

