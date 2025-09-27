import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { fetchNotifications } from '../../features/admin/adminNotificationsApi';

interface EventEditRequest {
  id: number;
  eventId: number;
  eventName: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  originalData: string;
  requestedData: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  processedById: number | null;
  processedByName: string | null;
}

export default function EventEditRequests() {
  const [requests, setRequests] = useState<EventEditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EventEditRequest | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processStatus, setProcessStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const loadRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await fetchEventEditRequests();
      // setRequests(response);
      
      // Mock data for now
      setRequests([]);
    } catch (error: any) {
      console.error('Failed to load edit requests:', error);
      enqueueSnackbar('Không thể tải danh sách yêu cầu chỉnh sửa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleProcessRequest = (request: EventEditRequest) => {
    setSelectedRequest(request);
    setProcessStatus('APPROVED');
    setAdminNotes('');
    setProcessDialogOpen(true);
  };

  const handleProcessSubmit = async () => {
    if (!selectedRequest) return;

    try {
      // TODO: Implement actual API call
      // await processEventEditRequest(selectedRequest.id, processStatus, adminNotes);
      
      enqueueSnackbar(
        `Đã ${processStatus === 'APPROVED' ? 'duyệt' : 'từ chối'} yêu cầu chỉnh sửa`,
        { variant: 'success' }
      );
      
      setProcessDialogOpen(false);
      loadRequests();
    } catch (error: any) {
      console.error('Failed to process request:', error);
      enqueueSnackbar('Không thể xử lý yêu cầu', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Yêu cầu chỉnh sửa sự kiện
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Làm mới">
            <IconButton onClick={loadRequests} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sự kiện</TableCell>
                  <TableCell>Người yêu cầu</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width="40%" /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Không có yêu cầu chỉnh sửa nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Khi có yêu cầu chỉnh sửa sự kiện, chúng sẽ xuất hiện ở đây
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sự kiện</TableCell>
                  <TableCell>Người yêu cầu</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {request.eventName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {request.eventId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.requesterName || request.requesterEmail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.requesterEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(request.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleProcessRequest(request)}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setProcessStatus('REJECTED');
                                handleProcessRequest(request);
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Process Request Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {processStatus === 'APPROVED' ? 'Duyệt' : 'Từ chối'} yêu cầu chỉnh sửa
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Sự kiện:</strong> {selectedRequest.eventName}
                </Typography>
                <Typography variant="body2">
                  <strong>Người yêu cầu:</strong> {selectedRequest.requesterName || selectedRequest.requesterEmail}
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={processStatus}
                  onChange={(e) => setProcessStatus(e.target.value as 'APPROVED' | 'REJECTED')}
                  label="Trạng thái"
                >
                  <MenuItem value="APPROVED">Duyệt</MenuItem>
                  <MenuItem value="REJECTED">Từ chối</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Ghi chú của admin"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleProcessSubmit}
            variant="contained"
            color={processStatus === 'APPROVED' ? 'success' : 'error'}
          >
            {processStatus === 'APPROVED' ? 'Duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

