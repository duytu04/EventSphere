import { useMemo, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { fetchMyRegistrations, getRegistrationSummary, type Registration, type RegistrationSummary } from "../../features/registrations/registrationsApi";
import QRCodeViewer from "../../components/common/QRCodeViewer";
import api from "../../api/axiosClient";

type FilterStatus = "ALL" | "CONFIRMED" | "ATTENDED" | "CANCELLED" | "WAITLISTED";

// Helper functions
function getStatusInfo(status: string) {
  switch (status) {
    case "CONFIRMED":
      return { label: "Đã đăng ký", color: "primary" as const };
    case "ATTENDED":
      return { label: "Đã tham dự", color: "success" as const };
    case "CANCELLED":
      return { label: "Đã huỷ", color: "error" as const };
    case "WAITLISTED":
      return { label: "Đang chờ", color: "warning" as const };
    default:
      return { label: status, color: "default" as const };
  }
}

function formatRange(start?: string, end?: string) {
  if (!start) return "—";
  try {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : undefined;
    const formatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!endDate) return formatter.format(startDate);
    const sameDay = startDate.toDateString() === endDate.toDateString();
    if (sameDay) {
      const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formatter.format(startDate)} – ${timeFormatter.format(endDate)}`;
    }
    return `${formatter.format(startDate)} → ${formatter.format(endDate)}`;
  } catch {
    return start;
  }
}

function MyRegistrations() {
  const theme = useTheme();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [summary, setSummary] = useState<RegistrationSummary>({ total: 0, confirmed: 0, attended: 0, cancelled: 0, waitlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [qrViewerOpen, setQrViewerOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [regs, summ] = await Promise.all([
          fetchMyRegistrations(),
          getRegistrationSummary()
        ]);
        setRegistrations(regs);
        setSummary(summ);
      } catch (err: any) {
        setError(err?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    if (filter === "ALL") return registrations;
    return registrations.filter(reg => reg.status === filter);
  }, [registrations, filter]);

  const handleViewQR = (registration: Registration) => {
    setSelectedRegistration(registration);
    setQrViewerOpen(true);
  };

  const handleCloseQR = () => {
    setQrViewerOpen(false);
    setSelectedRegistration(null);
  };

  const handleCancelRegistration = async (registrationId: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn huỷ đăng ký sự kiện này?");
    if (!confirmed) return;

    setCancellingId(registrationId);
    try {
      await api.delete(`/api/me/registrations/${registrationId}`);
      
      // Reload data
      const [regs, summ] = await Promise.all([
        fetchMyRegistrations(),
        getRegistrationSummary()
      ]);
      setRegistrations(regs);
      setSummary(summ);
      
      alert("Đã huỷ đăng ký thành công!");
    } catch (error: any) {
      console.error("Cancel registration failed:", error);
      alert(error?.response?.data?.message || "Huỷ đăng ký thất bại");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: { xs: 4, md: 6 }, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Đăng ký của tôi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Theo dõi toàn bộ sự kiện bạn đã đăng ký, xem vé điện tử và cập nhật trạng thái tham dự.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="overline" sx={{ opacity: 0.7 }}>
                      Tổng cộng
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {summary.total} đăng ký
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                      <Chip 
                        label={`${summary.attended} đã tham dự`} 
                        color="success" 
                        size="small"
                        onClick={() => setFilter("ATTENDED")}
                        sx={{ cursor: "pointer" }}
                      />
                      <Chip 
                        label={`${summary.confirmed} đã đăng ký`} 
                        color="primary" 
                        size="small"
                        onClick={() => setFilter("CONFIRMED")}
                        sx={{ cursor: "pointer" }}
                      />
                      {summary.waitlisted > 0 && (
                        <Chip 
                          label={`${summary.waitlisted} đang chờ`} 
                          color="warning" 
                          size="small"
                          onClick={() => setFilter("WAITLISTED")}
                          sx={{ cursor: "pointer" }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Lọc theo trạng thái
                    </Typography>
                    <ToggleButtonGroup
                      value={filter}
                      exclusive
                      onChange={(_, value) => value && setFilter(value)}
                      size="small"
                    >
                      <ToggleButton value="ALL">Tất cả</ToggleButton>
                      <ToggleButton value="CONFIRMED">Đã đăng ký</ToggleButton>
                      <ToggleButton value="ATTENDED">Đã tham dự</ToggleButton>
                      <ToggleButton value="CANCELLED">Đã huỷ</ToggleButton>
                      <ToggleButton value="WAITLISTED">Đang chờ</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {filteredRegistrations.map((reg) => {
              const statusInfo = getStatusInfo(reg.status);
              return (
                <Grid key={reg.id} item xs={12} md={8}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={2.5}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                          <Stack direction="row" spacing={1.5}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 54,
                                height: 54,
                                borderRadius: 2,
                                background: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                              }}
                            >
                              {reg.eventName.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {reg.eventName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID đăng ký: {reg.id}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            variant={statusInfo.color === "default" ? "outlined" : "filled"}
                            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                          />
                        </Stack>

                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1.5} color="text.secondary" flexWrap="wrap">
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <CalendarMonthRoundedIcon fontSize="small" />
                              <Typography variant="body2">{formatRange(reg.eventStartTime, reg.eventEndTime)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <PlaceRoundedIcon fontSize="small" />
                              <Typography variant="body2">{reg.eventLocation}</Typography>
                            </Stack>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Đăng ký lúc: {new Date(reg.registeredAt).toLocaleString("vi-VN")}
                          </Typography>
                        </Stack>

                        <Divider flexItem sx={{ borderStyle: "dashed" }} />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          {reg.status === "CONFIRMED" && (
                            <>
                              <Tooltip title="Xem vé điện tử và mã QR" placement="top" arrow>
                                <Button
                                  variant="contained"
                                  startIcon={<QrCode2Icon fontSize="small" />}
                                  onClick={() => handleViewQR(reg)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Xem vé điện tử
                                </Button>
                              </Tooltip>
                              <Tooltip title="Huỷ đăng ký sự kiện" placement="top" arrow>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  disabled={cancellingId === reg.id}
                                  onClick={() => handleCancelRegistration(reg.id)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  {cancellingId === reg.id ? "Đang huỷ..." : "Huỷ đăng ký"}
                                </Button>
                              </Tooltip>
                            </>
                          )}
                          
                          {reg.status === "ATTENDED" && (
                            <Tooltip title="Xem lại sự kiện đã tham dự" placement="top" arrow>
                              <Button
                                variant="outlined"
                                startIcon={<LocalActivityRoundedIcon fontSize="small" />}
                                component={RouterLink}
                                to={`/events/${reg.eventId}`}
                                sx={{ borderRadius: 2 }}
                              >
                                Xem lại sự kiện
                              </Button>
                            </Tooltip>
                          )}

                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton
                            component={RouterLink}
                            to={`/events/${reg.eventId}`}
                            color="primary"
                            sx={{ borderRadius: 2 }}
                            title="Mở trang sự kiện"
                          >
                            <OpenInNewRoundedIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Container>

      {/* QR Code Viewer */}
      {selectedRegistration && (
        <QRCodeViewer
          open={qrViewerOpen}
          onClose={handleCloseQR}
          registrationId={selectedRegistration.id}
          eventName={selectedRegistration.eventName}
          eventImageUrl={selectedRegistration.eventImageUrl}
        />
      )}
    </Box>
  );
}

export default MyRegistrations;
