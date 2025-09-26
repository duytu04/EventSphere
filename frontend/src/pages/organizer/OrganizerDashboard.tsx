import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Alert,
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
import { EventResponse, fetchOrganizerEvents } from "../../features/events/eventsApi";

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

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Đang bán",
  PENDING_APPROVAL: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  DRAFT: "Nháp",
  LIVE: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

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
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEventPreview | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchOrganizerEvents({ page: 0, size: 20 })
      .then((res) => {
        if (!active) return;
        setEvents(res.content ?? []);
        setError(null);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error(err);
        setError(err?.message ?? "Không thể tải dữ liệu sự kiện");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const approvedCount = events.filter((item) => (item.status ?? "").toUpperCase() === "APPROVED").length;
    const seatsRemaining = events.reduce((sum, item) => sum + (item.seatsAvailable ?? 0), 0);
    const attendees = events.reduce((sum, item) => {
      const capacity = item.capacity ?? 0;
      const seatsAvail = item.seatsAvailable ?? 0;
      const counted = item.attendeesCount ?? capacity - seatsAvail;
      return sum + Math.max(0, counted ?? 0);
    }, 0);
    const approvalRatio = totalEvents === 0 ? 0 : Math.round((approvedCount / totalEvents) * 100);

    return [
      {
        label: "Sự kiện đã duyệt",
        value: approvedCount,
        delta: `${approvalRatio}%`,
        deltaTone: "up" as const,
        helper: totalEvents ? `trên ${totalEvents} sự kiện` : "chưa có dữ liệu",
        icon: EventAvailableRoundedIcon,
      },
      {
        label: "Vé còn lại",
        value: seatsRemaining,
        delta: "—",
        deltaTone: "up" as const,
        helper: "khả dụng",
        icon: LocalActivityRoundedIcon,
      },
      {
        label: "Khách đã đăng ký",
        value: attendees,
        delta: "—",
        deltaTone: "up" as const,
        helper: "tổng cập nhật",
        icon: PeopleAltRoundedIcon,
      },
    ];
  }, [events]);

  const groupedEvents = useMemo(() => {
    const live: OrganizerEventPreview[] = [];
    const upcoming: OrganizerEventPreview[] = [];
    const preparing: OrganizerEventPreview[] = [];

    if (events.length === 0) {
      return { live, upcoming, preparing };
    }

    const buildPreview = (item: EventResponse): OrganizerEventPreview => {
      const capacity = item.capacity ?? 0;
      const seatsAvail = item.seatsAvailable ?? 0;
      const counted = item.attendeesCount ?? capacity - seatsAvail;
      const ticketsSold = Math.max(0, counted ?? 0);
      const resolvedCapacity = capacity > 0 ? capacity : ticketsSold + seatsAvail;
      const statusKey = (item.status ?? "").toUpperCase();

      return {
        id: String(item.id ?? ""),
        name: item.name ?? "—",
        startDate: item.startTime ?? "",
        endDate: item.endTime ?? "",
        location: item.location ?? "Chưa cập nhật",
        status: STATUS_LABELS[statusKey] ?? item.status ?? "—",
        ticketsSold,
        capacity: resolvedCapacity || ticketsSold,
        category: item.category ?? undefined,
        image: item.mainImageUrl ?? undefined,
        description: item.description ?? undefined,
      };
    };

    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds

    const sortByStart = (list: OrganizerEventPreview[]) =>
      list.sort((a, b) => {
        const aTime = a.startDate ? Date.parse(a.startDate) : Number.MAX_SAFE_INTEGER;
        const bTime = b.startDate ? Date.parse(b.startDate) : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

    events.forEach((item) => {
      const preview = buildPreview(item);
      const startMs = item.startTime ? Date.parse(item.startTime) : Number.NaN;
      const endMs = item.endTime ? Date.parse(item.endTime) : startMs;
      const statusKey = (item.status ?? "").toUpperCase();
      const withinTimeRange = !Number.isNaN(startMs) && !Number.isNaN(endMs);

      if (withinTimeRange && startMs <= now && now <= endMs) {
        live.push(preview);
        return;
      }

      // Show events that are upcoming OR ended within the last 3 days
      if (!Number.isNaN(startMs) && startMs >= threeDaysAgo) {
        upcoming.push(preview);
        return;
      }

      if (statusKey === "PENDING_APPROVAL" || statusKey === "DRAFT") {
        preparing.push(preview);
        return;
      }

      preparing.push(preview);
    });

    return {
      live: sortByStart(live),
      upcoming: sortByStart(upcoming),
      preparing: sortByStart(preparing),
    };
  }, [events]);

  const eventSections = useMemo(
    () => [
      {
        key: "live",
        title: "Đang diễn ra",
        description: "Các sự kiện đang được mở và diễn ra trong thời gian thực",
        items: groupedEvents.live,
        empty: "Không có sự kiện nào đang diễn ra.",
      },
      {
        key: "upcoming",
        title: "Sắp diễn ra",
        description: "Những sự kiện đã duyệt và chuẩn bị bắt đầu",
        items: groupedEvents.upcoming,
        empty: "Không có sự kiện nào sắp diễn ra.",
      },
      {
        key: "preparing",
        title: "Chuẩn bị",
        description: "Sự kiện đang chờ duyệt hoặc lên kế hoạch",
        items: groupedEvents.preparing,
        empty: "Không có sự kiện nào đang ở trạng thái chuẩn bị.",
      },
    ],
    [groupedEvents]
  );

  const renderEventRow = (event: OrganizerEventPreview) => {
    const percent = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;
    const progress = Math.min(100, Math.max(0, percent));
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
            <Chip
              label={event.status}
              size="small"
              color={chipColor as any}
              variant={chipColor === "default" ? "outlined" : "filled"}
            />
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
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}
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
                title="Sự kiện theo trạng thái"
                subheader="Theo dõi sự kiện đang diễn ra, sắp diễn ra và trong giai đoạn chuẩn bị"
                action={
                  <Button
                    size="small"
                    endIcon={<EditCalendarRoundedIcon />}
                    sx={{ textTransform: "none" }}
                    component={Link}
                    to="/organizer/events"
                  >
                    Quản lý lịch
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ px: { xs: 2.5, md: 3.5 } }}>
                {loading ? (
                  <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                    <LinearProgress sx={{ width: "100%" }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu sự kiện...
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    {eventSections.map((section) => (
                      <Box key={section.key}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1.5}
                          sx={{ mb: 2 }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {section.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {section.description}
                            </Typography>
                          </Box>
                          <Chip label={`${section.items.length}`} size="small" variant="outlined" />
                        </Stack>

                        {section.items.length > 0 ? (
                          <Stack spacing={3} divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}>
                            {section.items.map((event) => renderEventRow(event))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {section.empty}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
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
