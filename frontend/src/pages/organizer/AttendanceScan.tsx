import { useMemo, useState } from "react";
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
} from "@mui/material";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const EVENTS = [
  { id: "EVT-2301", name: "Tech Innovators Summit" },
  { id: "EVT-2303", name: "Music & Art Night" },
  { id: "EVT-2304", name: "Startup Funding 101" },
];

const MOCK_LOGS = [
  {
    attendee: "Trần Thanh Bình",
    email: "binh.tran@example.com",
    time: "08:15",
    ticketType: "VIP",
    status: "success" as const,
  },
  {
    attendee: "Nguyễn Hoài Phong",
    email: "phong.nguyen@example.com",
    time: "08:22",
    ticketType: "Standard",
    status: "success" as const,
  },
  {
    attendee: "Lê Minh Châu",
    email: "chau.le@example.com",
    time: "08:40",
    ticketType: "Standard",
    status: "pending" as const,
  },
  {
    attendee: "Huỳnh Gia Hân",
    email: "han.huynh@example.com",
    time: "08:44",
    ticketType: "Early Bird",
    status: "error" as const,
  },
];

const statusAppearance = {
  success: { label: "Đã vào", color: "success" as const, icon: CheckCircleRoundedIcon },
  pending: { label: "Chờ xác minh", color: "warning" as const, icon: PendingRoundedIcon },
  error: { label: "Không hợp lệ", color: "error" as const, icon: ErrorOutlineRoundedIcon },
};

export default function AttendanceScan() {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0].id);
  const [manualCode, setManualCode] = useState("");
  const [lastScan, setLastScan] = useState<{
    attendee: string;
    status: keyof typeof statusAppearance;
  } | null>(null);

  const eventInfo = useMemo(() => EVENTS.find((e) => e.id === selectedEvent), [selectedEvent]);

  const handleManualCheck = () => {
    if (!manualCode) return;
    const fakeStatus = manualCode.endsWith("5") ? "pending" : manualCode.endsWith("9") ? "error" : "success";
    setLastScan({ attendee: `Mã ${manualCode}`, status: fakeStatus });
    setManualCode("");
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardHeader
              title="Quét mã Check-in"
              subheader={eventInfo?.name}
              action={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TextField
                    select
                    size="small"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    sx={{ minWidth: 220 }}
                    label="Sự kiện"
                  >
                    {EVENTS.map((ev) => (
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
                  <Button variant="contained" startIcon={<CameraAltRoundedIcon />} sx={{ borderRadius: 2 }}>
                    Mở camera quét
                  </Button>
                  <Button variant="outlined" sx={{ borderRadius: 2 }}>
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
                    placeholder="Nhập mã hoặc email"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
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
                    { label: "Đã check-in", value: 268, color: theme.palette.success.main },
                    { label: "Chưa tới", value: 140, color: theme.palette.warning.main },
                    { label: "Lỗi/Trùng", value: 3, color: theme.palette.error.main },
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
                <List sx={{ py: 0 }}>
                  {MOCK_LOGS.map((log, idx) => {
                    const statusMeta = statusAppearance[log.status];
                    const StatusIcon = statusMeta.icon;
                    const mainColor = theme.palette[statusMeta.color].main;
                    return (
                      <Box key={`${log.attendee}-${idx}`}>
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
                                  {log.attendee}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.email}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Stack direction="row" spacing={2} sx={{ mt: 0.75 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Thời gian: {log.time}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Loại vé: {log.ticketType}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                        {idx < MOCK_LOGS.length - 1 && <Divider component="li" />}
                      </Box>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
