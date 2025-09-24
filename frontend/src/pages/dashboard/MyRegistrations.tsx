import { useMemo } from "react";
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
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CHECKED_IN" | "CANCELLED";

type Registration = {
  id: string;
  eventName: string;
  eventSlug: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: RegistrationStatus;
  ticketLabel: string;
  badgeColor: "default" | "primary" | "success" | "warning" | "error";
  badgeText: string;
  actions: Array<{
    label: string;
    icon: React.ReactNode;
    href?: string;
    to?: string;
    tooltip: string;
  }>;
};

const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: "REG-10293",
    eventName: "Tech Innovators Summit 2025",
    eventSlug: "tech-innovators-summit-2025",
    location: "Trung tâm Hội nghị GEM",
    startDate: "2025-10-12T08:30:00",
    endDate: "2025-10-12T17:30:00",
    status: "REGISTERED",
    ticketLabel: "Vé tham dự chính thức",
    badgeColor: "primary",
    badgeText: "Đã đăng ký",
    actions: [
      {
        label: "Xem vé điện tử",
        icon: <ConfirmationNumberRoundedIcon fontSize="small" />,
        to: "/dashboard/registrations/REG-10293/ticket",
        tooltip: "Mở vé và mã QR của bạn",
      },
      {
        label: "Tải PDF vé",
        icon: <PictureAsPdfRoundedIcon fontSize="small" />,
        href: "#",
        tooltip: "Tải về vé ở định dạng PDF",
      },
    ],
  },
  {
    id: "REG-10211",
    eventName: "Workshop: Thiết kế trải nghiệm người dùng",
    eventSlug: "ux-immersive-workshop",
    location: "Dreamplex 195 Điện Biên Phủ",
    startDate: "2025-11-02T13:30:00",
    status: "WAITLISTED",
    ticketLabel: "Danh sách chờ - Slot 08",
    badgeColor: "warning",
    badgeText: "Đang chờ xác nhận",
    actions: [
      {
        label: "Xem chi tiết sự kiện",
        icon: <OpenInNewRoundedIcon fontSize="small" />,
        to: "/events/ux-immersive-workshop",
        tooltip: "Mở landing page sự kiện",
      },
    ],
  },
  {
    id: "REG-10104",
    eventName: "Music & Art Night",
    eventSlug: "music-art-night",
    location: "Saigon Outcast",
    startDate: "2025-09-25T19:00:00",
    status: "CHECKED_IN",
    ticketLabel: "Đã check-in",
    badgeColor: "success",
    badgeText: "Đã tham dự",
    actions: [
      {
        label: "Xem lại highlight",
        icon: <LocalActivityRoundedIcon fontSize="small" />,
        href: "#",
        tooltip: "Xem media & ghi chú của chương trình",
      },
    ],
  },
];

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
  const summary = useMemo(() => {
    const total = MOCK_REGISTRATIONS.length;
    const checkedIn = MOCK_REGISTRATIONS.filter((r) => r.status === "CHECKED_IN").length;
    const waiting = MOCK_REGISTRATIONS.filter((r) => r.status === "WAITLISTED").length;
    return {
      total,
      checkedIn,
      waiting,
    };
  }, []);

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Đăng ký của tôi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Theo dõi toàn bộ sự kiện bạn đã đăng ký, tải vé và cập nhật trạng thái tham dự.
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
                    <Stack direction="row" spacing={1.5}>
                      <Chip label={`${summary.checkedIn} đã tham dự`} color="success" size="small" />
                      {summary.waiting ? (
                        <Chip label={`${summary.waiting} đang chờ`} color="warning" size="small" />
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {MOCK_REGISTRATIONS.map((reg) => (
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
                          label={reg.badgeText}
                          color={reg.badgeColor}
                          variant={reg.badgeColor === "default" ? "outlined" : "filled"}
                          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                        />
                      </Stack>

                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} color="text.secondary" flexWrap="wrap">
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <CalendarMonthRoundedIcon fontSize="small" />
                            <Typography variant="body2">{formatRange(reg.startDate, reg.endDate)}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <PlaceRoundedIcon fontSize="small" />
                            <Typography variant="body2">{reg.location}</Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {reg.ticketLabel}
                        </Typography>
                      </Stack>

                      <Divider flexItem sx={{ borderStyle: "dashed" }} />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        {reg.actions.map((action) => (
                          <Tooltip key={action.label} title={action.tooltip} placement="top" arrow>
                            <Button
                              variant={action.label.includes("vé") ? "contained" : "outlined"}
                              startIcon={action.icon}
                              component={action.to ? RouterLink : "button"}
                              to={action.to}
                              href={action.href}
                              target={action.href ? "_blank" : undefined}
                              rel={action.href ? "noreferrer" : undefined}
                              sx={{ borderRadius: 2 }}
                            >
                              {action.label}
                            </Button>
                          </Tooltip>
                        ))}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton
                          component={RouterLink}
                          to={`/events/${reg.eventSlug}`}
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
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default MyRegistrations;
