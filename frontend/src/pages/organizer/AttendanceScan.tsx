import { useMemo, useState, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QrScanner from "qr-scanner";
import { markAttendance, fetchAttendanceLogs, AttendanceLog, AttendanceStats } from "../../features/attendance/attendanceApi";
import { fetchOrganizerEvents } from "../../features/events/eventsApi";

// Removed mock data - will use real API data

const statusAppearance = {
  success: { label: "Đã vào", color: "success" as const, icon: CheckCircleRoundedIcon },
  pending: { label: "Chờ xác minh", color: "warning" as const, icon: PendingRoundedIcon },
  error: { label: "Không hợp lệ", color: "error" as const, icon: ErrorOutlineRoundedIcon },
};

export default function AttendanceScan() {
  const theme = useTheme();
  const [events, setEvents] = useState<Array<{id: number, name: string}>>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [lastScan, setLastScan] = useState<{
    attendee: string;
    status: keyof typeof statusAppearance;
  } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventInfo = useMemo(() => events.find((e) => e.id === selectedEvent), [events, selectedEvent]);

  // Load events and attendance data
  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadAttendanceData(selectedEvent);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetchOrganizerEvents({ page: 0, size: 50 });
      const eventList = response.content?.map(event => ({
        id: event.id,
        name: event.name || event.title || "Unnamed Event"
      })) || [];
      setEvents(eventList);
      if (eventList.length > 0 && !selectedEvent) {
        setSelectedEvent(eventList[0].id);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async (eventId: number) => {
    try {
      const logs = await fetchAttendanceLogs(Number(eventId), 0, 20);
      setAttendanceLogs(logs.content || []);
      // Calculate stats from logs
      const totalCheckedIn = logs.content?.length || 0;
      setStats({
        totalCheckedIn,
        totalRegistered: 0, // This would need to come from registration API
        totalErrors: 0
      });
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };

  const handleManualCheck = async () => {
    if (!manualCode || !selectedEvent) {
      console.error('Missing manualCode or selectedEvent:', { manualCode, selectedEvent });
      return;
    }
    
    try {
      setLoading(true);
      console.log('Manual check for:', manualCode, 'event:', selectedEvent);
      
      // Check if input is email format
      const isEmail = manualCode.includes('@') && manualCode.includes('.');
      console.log('Is email format:', isEmail);
      
      let response;
      if (isEmail) {
        // For email, backend will handle email lookup
        console.log('Sending email for lookup:', manualCode);
        response = await markAttendance({
          eventId: Number(selectedEvent),
          qrToken: manualCode // Email will be detected and processed
        });
        setLastScan({ attendee: `Email: ${manualCode}`, status: "success" });
      } else {
        // For QR token
        console.log('Sending QR token:', manualCode);
        response = await markAttendance({
          eventId: Number(selectedEvent),
          qrToken: manualCode
        });
        setLastScan({ attendee: `Mã: ${manualCode}`, status: "success" });
      }
      
      console.log('Manual attendance marked successfully:', response);
    setManualCode("");
      // Reload attendance data
      loadAttendanceData(selectedEvent);
    } catch (error: any) {
      console.error('Failed to mark manual attendance:', error);
      console.error('Error details:', error.response?.data);
      let errorMessage = 'Không thể xác nhận check-in.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLastScan({ 
        attendee: `Mã: ${manualCode}`, 
        status: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      setScanning(true);
      
      if (!videoRef.current) {
        setCameraError('Video element not found');
        setScanning(false);
        return;
      }

      // Check if QR scanner is supported
      if (!QrScanner.hasCamera()) {
        setCameraError('Camera not found on this device');
        setScanning(false);
        return;
      }

      console.log('Starting camera...');
      
      // Try to get camera access first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        console.log('Camera access granted, setting up video...');
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Create QR scanner instance
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data);
            handleQRScan(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
          }
        );

        await qrScannerRef.current.start();
        console.log('QR Scanner started successfully');
        setCameraOpen(true);
        setScanning(false);
      } catch (cameraError: any) {
        console.error('Camera access error:', cameraError);
        throw cameraError;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera và thử lại.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy camera trên thiết bị.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Trình duyệt không hỗ trợ truy cập camera. Vui lòng sử dụng Chrome hoặc Firefox.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
      }
      
      setCameraError(errorMessage);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setCameraOpen(false);
    setScanning(false);
    setCameraError(null);
  };

  const handleQRScan = async (qrCode: string) => {
    if (!selectedEvent) {
      console.error('No event selected');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Processing QR code:', qrCode, 'for event:', selectedEvent);
      
      // Check if QR code is email format
      const isEmail = qrCode.includes('@') && qrCode.includes('.');
      console.log('Is email format:', isEmail);
      
      let response;
      if (isEmail) {
        // For email, backend will handle email lookup
        console.log('Sending email for lookup:', qrCode);
        response = await markAttendance({
          eventId: Number(selectedEvent),
          qrToken: qrCode // Email will be detected and processed
        });
        setLastScan({ attendee: `Email: ${qrCode}`, status: "success" });
      } else {
        // For QR token
        console.log('Sending QR token:', qrCode);
        response = await markAttendance({
          eventId: Number(selectedEvent),
          qrToken: qrCode
        });
        setLastScan({ attendee: `QR: ${qrCode}`, status: "success" });
      }
      
      console.log('Attendance marked successfully:', response);
      stopCamera();
      // Reload attendance data
      loadAttendanceData(selectedEvent);
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      console.error('Error details:', error.response?.data);
      let errorMessage = 'Không thể xác nhận check-in.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLastScan({ 
        attendee: `QR: ${qrCode}`, 
        status: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // File upload functions
  const handleFileUpload = () => {
    setFileUploadOpen(true);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEvent) {
      console.error('Missing file or selectedEvent:', { file: file?.name, selectedEvent });
      return;
    }
    
    try {
      setLoading(true);
      console.log('Scanning file:', file.name, file.type, 'for event:', selectedEvent);
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Scan QR code from file
      console.log('Starting QR scan from file...');
      
      try {
        // Try direct file scanning first
        console.log('Trying direct file scan...');
        const result = await QrScanner.scanImage(file);
        
        console.log('QR scan result:', result);
        
        if (result) {
          console.log('QR code found in file, processing...');
          await handleQRScan(result);
        } else {
          console.log('No QR code found in file');
          setLastScan({ 
            attendee: `File: ${file.name}`, 
            status: "error" 
          });
        }
      } catch (directError) {
        console.log('Direct scan failed, trying with FileReader...', directError);
        
        // Fallback: Create a FileReader to read the file
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        console.log('File data loaded, scanning QR...');
        const result = await QrScanner.scanImage(fileData);
        
        console.log('QR scan result:', result);
        
        if (result) {
          console.log('QR code found in file, processing...');
          await handleQRScan(result);
        } else {
          console.log('No QR code found in file');
          setLastScan({ 
            attendee: `File: ${file.name}`, 
            status: "error" 
          });
        }
      }
      setFileUploadOpen(false);
    } catch (error: any) {
      console.error('Failed to scan QR from file:', error);
      let errorMessage = 'Không thể quét QR code từ file.';
      
      if (error.message.includes('No QR code found')) {
        errorMessage = 'Không tìm thấy QR code trong file.';
      } else if (error.message.includes('File must be an image')) {
        errorMessage = 'File phải là ảnh (JPG, PNG, etc.).';
      }
      
      setLastScan({ 
        attendee: `File: ${file.name}`, 
        status: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardHeader
              title="Quét mã QR Check-in"
              subheader={eventInfo?.name}
              action={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TextField
                    select
                    size="small"
                    value={selectedEvent || ""}
                    onChange={(e) => setSelectedEvent(Number(e.target.value))}
                    sx={{ minWidth: 220 }}
                    label="Sự kiện"
                    disabled={loading}
                  >
                    {events.map((ev) => (
                      <MenuItem key={ev.id} value={ev.id}>
                        {ev.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Tooltip title="Đặt lại phiên quét">
                    <IconButton color="primary" sx={{ borderRadius: 2 }}>
                      <RefreshRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.4)}`,
                  padding: { xs: 3, md: 4 },
                  textAlign: "center",
                  background: (t) => alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.05 : 0.12),
                }}
              >
                <QrCodeScannerRoundedIcon sx={{ fontSize: 56, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                  Hướng camera quét mã QR trên vé của khách
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mt: 1 }}>
                  Hệ thống sẽ tự động ghi nhận thời gian check-in và trạng thái vé. Nếu không thể quét, bạn có thể nhập mã
                  bằng tay bên dưới.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }} justifyContent="center">
                  <Button 
                    variant="contained" 
                    startIcon={<CameraAltRoundedIcon />} 
                    sx={{ borderRadius: 2 }}
                    onClick={startCamera}
                    disabled={scanning}
                  >
                    {scanning ? "Đang mở camera..." : "Mở camera quét"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<UploadFileRoundedIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={handleFileUpload}
                  >
                    Tải QR mẫu
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Nhập mã vé thủ công
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="Nhập mã QR hoặc email người đăng ký"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Có thể nhập mã QR hoặc email của người đăng ký để xác nhận"
                  />
                  <Button variant="contained" sx={{ borderRadius: 2 }} onClick={handleManualCheck}>
                    Xác nhận
                  </Button>
                </Stack>
                {lastScan ? (
                  <Box
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      bgcolor: alpha(theme.palette[statusAppearance[lastScan.status].color].main, 0.12),
                      color: theme.palette[statusAppearance[lastScan.status].color].main,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {lastScan.attendee}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Trạng thái: {statusAppearance[lastScan.status].label}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Tổng quan nhanh" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  {[
                    { 
                      label: "Đã check-in", 
                      value: stats?.totalCheckedIn || 0, 
                      color: theme.palette.success.main 
                    },
                    { 
                      label: "Chưa tới", 
                      value: (stats?.totalRegistered || 0) - (stats?.totalCheckedIn || 0), 
                      color: theme.palette.warning.main 
                    },
                    { 
                      label: "Lỗi/Trùng", 
                      value: stats?.totalErrors || 0, 
                      color: theme.palette.error.main 
                    },
                  ].map((item) => (
                    <Grid key={item.label} item xs={12} sm={4}>
                      <Box
                        sx={{
                          borderRadius: 2,
                          px: 2.5,
                          py: 2,
                          bgcolor: alpha(item.color, 0.12),
                          color: item.color,
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Lịch sử check-in" subheader="Cập nhật realtime" />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : attendanceLogs.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có lịch sử check-in nào
                    </Typography>
                  </Box>
                ) : (
                <List sx={{ py: 0 }}>
                    {attendanceLogs.map((log, idx) => {
                      const status = "success"; // All logs are successful check-ins
                      const statusMeta = statusAppearance[status];
                    const StatusIcon = statusMeta.icon;
                    const mainColor = theme.palette[statusMeta.color].main;
                      const markedAt = new Date(log.markedAt);
                      const timeStr = markedAt.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      
                    return (
                        <Box key={`${log.id}-${idx}`}>
                        <ListItem sx={{ alignItems: "flex-start", px: 3, py: 2.25 }}>
                          <ListItemAvatar>
                            <Chip
                              icon={<StatusIcon fontSize="small" />}
                              label={statusMeta.label}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: alpha(mainColor, 0.1),
                                color: mainColor,
                                fontWeight: 600,
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {log.attendeeName || `User ${log.userId}`}
                                </Typography>
                                  {log.attendeeEmail && (
                                <Typography variant="caption" color="text.secondary">
                                      {log.attendeeEmail}
                                </Typography>
                                  )}
                              </Stack>
                            }
                            secondary={
                              <Stack direction="row" spacing={2} sx={{ mt: 0.75 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Thời gian: {timeStr}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Phương thức: {log.method}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                          {idx < attendanceLogs.length - 1 && <Divider component="li" />}
                      </Box>
                    );
                  })}
                </List>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Camera Dialog */}
      <Dialog 
        open={cameraOpen} 
        onClose={stopCamera} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Quét mã QR của người đăng ký
            </Typography>
            <IconButton onClick={stopCamera} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            {cameraError ? (
              <Alert severity="error" sx={{ width: "100%" }}>
                {cameraError}
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "background.paper"
                  }}
                >
                  <video
                    ref={videoRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    playsInline
                    muted
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 200,
                      height: 200,
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      opacity: 0.7
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Hướng camera vào mã QR trên vé của người đăng ký để quét tự động
                </Typography>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={stopCamera} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog 
        open={fileUploadOpen} 
        onClose={() => setFileUploadOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Tải lên file QR của người đăng ký
            </Typography>
            <IconButton onClick={() => setFileUploadOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: "100%",
                height: 200,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
              onClick={handleFileUpload}
            >
              <UploadFileRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Nhấn để chọn file QR của người đăng ký
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hỗ trợ: JPG, PNG, PDF
              </Typography>
            </Box>
            {loading && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Đang quét QR code...
                </Typography>
              </Stack>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              aria-label="Upload QR code file"
              style={{ display: "none" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileUploadOpen(false)} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}
