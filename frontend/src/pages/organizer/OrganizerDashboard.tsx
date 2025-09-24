import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import OrganizerEventDetailDrawer, { OrganizerEventPreview } from "./OrganizerEventDetailDrawer";

const metrics = [
  {
    label: "Sự kiện đang hoạt động",
    value: 12,
    delta: "+18%",
    deltaTone: "up" as const,
    helper: "so với tháng trước",
    icon: EventAvailableRoundedIcon,
  },
  {
    label: "Vé còn lại",
    value: 246,
    delta: "-9%",
    deltaTone: "down" as const,
    helper: "cần đẩy truyền thông",
    icon: LocalActivityRoundedIcon,
  },
  {
    label: "Khách tham dự dự kiến",
    value: 1380,
    delta: "+6%",
    deltaTone: "up" as const,
    helper: "trend 30 ngày",
    icon: PeopleAltRoundedIcon,
  },
];

const upcomingEvents: OrganizerEventPreview[] = [
  {
    id: "2301",
    name: "Tech Innovators Summit",
    startDate: "2025-09-28T08:30:00",
    endDate: "2025-09-28T17:30:00",
    location: "Trung tâm Hội nghị GEM",
    status: "Đang bán vé",
    ticketsSold: 420,
    capacity: 560,
    category: "Công nghệ & Startup",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop",
    description: "Ngày hội quy tụ các nhà sáng lập, nhà đầu tư và chuyên gia đổi mới sáng tạo với hơn 20 phiên thảo luận chuyên sâu.",
  },
  {
    id: "2302",
    name: "Workshop: Thiết kế trải nghiệm",
    startDate: "2025-10-02T13:30:00",
    endDate: "2025-10-02T17:00:00",
    location: "Dreamplex 195 Điện Biên Phủ",
    status: "Chuẩn bị",
    ticketsSold: 120,
    capacity: 220,
    category: "Design & UX",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop",
    description: "Workshop thực hành dành cho đội ngũ thiết kế sản phẩm với mentor từ các startup tăng trưởng nhanh.",
  },
  {
    id: "2303",
    name: "Music & Art Night",
    startDate: "2025-10-05T19:00:00",
    endDate: "2025-10-05T22:30:00",
    location: "Saigon Outcast",
    status: "Gần kín chỗ",
    ticketsSold: 380,
    capacity: 420,
    category: "Âm nhạc & Nghệ thuật",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop",
    description: "Đêm nghệ thuật trải nghiệm âm thanh và ánh sáng kết hợp trưng bày tác phẩm từ các nghệ sĩ trẻ.",
  },
];

const spotlightActions = [
  {
    label: "Tạo sự kiện mới",
    description: "Khởi tạo sự kiện chỉ với vài bước.",
    icon: AddRoundedIcon,
    cta: "Bắt đầu",
    href: "/organizer/events/new",
  },
  {
    label: "Điều chỉnh lịch trình",
    description: "Quản lý timeline, phiên và diễn giả.",
    icon: EditCalendarRoundedIcon,
    cta: "Quản lý",
    href: "/organizer/events",
  },
  {
    label: "Insight bán vé",
    description: "Theo dõi doanh thu và hiệu suất kênh.",
    icon: InsightsRoundedIcon,
    cta: "Xem báo cáo",
    href: "/organizer/events",
  },
];

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function OrganizerDashboard() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEventPreview | null>(null);

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(
                  theme.palette.primary.light,
                  0.35
                )})`,
                color: theme.palette.getContrastText(theme.palette.primary.dark),
              }}
            >
              <CardContent sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={{ xs: 3, md: 5 }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
                      Organizer workspace
                    </Typography>
                    <Typography variant={isSmall ? "h5" : "h4"} fontWeight={700} sx={{ mt: 1 }}>
                      Xin chào, đội ngũ EventSphere Organizer
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1.5, maxWidth: 520, opacity: 0.85 }}>
                      Theo dõi tiến độ sự kiện, quản lý tác vụ và cập nhật nhanh với dashboard được thiết kế dành riêng cho
                      nhà tổ chức.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
                      <Button
                        component={Link}
                        to="/organizer/events/new"
                        variant="contained"
                        color="inherit"
                        startIcon={<AddRoundedIcon />}
                        sx={{ color: theme.palette.primary.main, borderRadius: 2 }}
                      >
                        Tạo sự kiện mới
                      </Button>
                      <Button
                        component={Link}
                        to="/organizer/events"
                        variant="outlined"
                        color="inherit"
                        startIcon={<EditCalendarRoundedIcon />}
                        sx={{
                          borderRadius: 2,
                          borderColor: alpha(theme.palette.common.white, 0.6),
                          color: "inherit",
                          '&:hover': {
                            borderColor: theme.palette.common.white,
                            backgroundColor: alpha(theme.palette.common.white, 0.08),
                          },
                        }}
                      >
                        Xem danh sách sự kiện
                      </Button>
                    </Stack>
                  </Box>

                  <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
                    {metrics.map((item) => {
                      const Icon = item.icon;
                      const trendColor =
                        item.deltaTone === "up" ? theme.palette.success.main : theme.palette.warning.main;
                      const TrendIcon = item.deltaTone === "up" ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;

                      return (
                        <Card
                          key={item.label}
                          sx={{
                            minWidth: 220,
                            borderRadius: 3,
                            boxShadow: "none",
                            backgroundColor: alpha(theme.palette.common.white, 0.16),
                          }}
                        >
                          <CardContent>
                            <Stack spacing={1.25}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Icon fontSize="small" />
                                <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                                  {item.label}
                                </Typography>
                              </Stack>
                              <Typography variant="h4" fontWeight={700}>
                                {item.value.toLocaleString("vi-VN")}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: trendColor }}>
                                <TrendIcon fontSize="small" />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {item.delta}
                                </Typography>
                                <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                                  {item.helper}
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader
                title="Sự kiện sắp tới"
                subheader="Theo dõi tốc độ bán vé và tình trạng chuẩn bị"
                action={
                  <Button size="small" endIcon={<EditCalendarRoundedIcon />} sx={{ textTransform: "none" }} component={Link} to="/organizer/events">
                    Quản lý lịch
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ px: { xs: 2.5, md: 3.5 } }}>
                <Stack spacing={3} divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}>
                  {upcomingEvents.map((event) => {
                    const progress = Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100));
                    const chipColor = progress >= 85 ? "success" : progress >= 60 ? "primary" : "default";
                    return (
                      <Stack
                        key={event.id}
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2.5}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Stack spacing={0.5} sx={{ minWidth: 220 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {event.name}
                          </Typography>
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" color="text.secondary">
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <AccessTimeRoundedIcon fontSize="small" />
                              <Typography variant="body2">{formatDateTime(event.startDate)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <LocationOnRoundedIcon fontSize="small" />
                              <Typography variant="body2">{event.location}</Typography>
                            </Stack>
                          </Stack>
                        </Stack>

                        <Box sx={{ flexGrow: 1, minWidth: 180 }}>
                          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 999 }} />
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                            <Typography variant="caption" color="text.secondary">
                              {event.ticketsSold}/{event.capacity} vé • {progress}%
                            </Typography>
                            <Chip label={event.status} size="small" color={chipColor as any} variant={chipColor === "default" ? "outlined" : "filled"} />
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            sx={{ textTransform: "none" }}
                            component={Link}
                            to={`/organizer/events/${event.id}/edit`}
                          >
                            Chỉnh sửa
                          </Button>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardHeader title="Quick spotlight" subheader="Các thao tác được dùng nhiều nhất" />
              <Divider />
              <CardContent>
                <Stack spacing={2.5}>
                  {spotlightActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Stack key={action.label} direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {action.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={action.href}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          {action.cta}
                        </Button>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <OrganizerEventDetailDrawer open={Boolean(selectedEvent)} event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </Box>
  );
}
