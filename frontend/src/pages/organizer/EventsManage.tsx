import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Alert,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import OfflineBoltRoundedIcon from "@mui/icons-material/OfflineBoltRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useNavigate } from "react-router-dom";
import { EventResponse, fetchOrganizerEvents } from "../../features/events/eventsApi";

const STATUS_META: Record<string, { label: string; color: "default" | "primary" | "success" | "warning" | "error" }> = {
  APPROVED: { label: "Đang bán", color: "success" },
  PENDING_APPROVAL: { label: "Chờ duyệt", color: "warning" },
  REJECTED: { label: "Từ chối", color: "error" },
  DRAFT: { label: "Nháp", color: "default" },
  LIVE: { label: "Đang diễn ra", color: "primary" },
  COMPLETED: { label: "Hoàn thành", color: "default" },
  CANCELLED: { label: "Đã hủy", color: "error" },
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "APPROVED", label: "Đang bán" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "DRAFT", label: "Nháp" },
  { value: "REJECTED", label: "Từ chối" },
];

export default function EventsManage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => setQuery(search.trim()), 400);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const status = statusFilter === "ALL" ? undefined : statusFilter;
    fetchOrganizerEvents({ q: query || undefined, status, page: 0, size: 12 })
      .then((res) => {
        if (!active) return;
        setEvents(res.content ?? []);
        setTotalElements(res.totalElements ?? (res.content?.length ?? 0));
        setError(null);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error(err);
        setEvents([]);
        setTotalElements(0);
        setError(err?.message ?? "Không thể tải danh sách sự kiện");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [statusFilter, query]);

  const viewEvents = useMemo(() => {
    return events.map((ev) => {
      const capacity = ev.capacity ?? 0;
      const seatsAvail = ev.seatsAvailable ?? 0;
      const counted = ev.attendeesCount ?? capacity - seatsAvail;
      const ticketsSold = Math.max(0, counted ?? 0);
      const resolvedCapacity = capacity > 0 ? capacity : ticketsSold + seatsAvail;
      const statusCode = (ev.status ?? "").toUpperCase();
      const meta = STATUS_META[statusCode] ?? { label: statusCode || "—", color: "default" as const };

      return {
        id: ev.id ?? 0,
        displayId: ev.id != null ? `#${ev.id}` : "—",
        name: ev.name ?? "—",
        location: ev.location ?? "Chưa cập nhật",
        startTime: ev.startTime ?? "",
        ticketsSold,
        capacity: resolvedCapacity || ticketsSold,
        statusCode,
        statusMeta: meta,
        original: ev,
      };
    });
  }, [events]);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên sự kiện, mã, địa điểm..."
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
              <TextField
                select
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <ToggleButtonGroup
                exclusive
                size="small"
                value={view}
                onChange={(_, val) => val && setView(val)}
                sx={{ borderRadius: 2 }}
              >
                <ToggleButton value="grid">Thẻ</ToggleButton>
                <ToggleButton value="list">Danh sách</ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="Tuỳ chọn lọc nâng cao">
                <IconButton color="primary" sx={{ borderRadius: 2, border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)}` }}>
                  <FilterAltRoundedIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/organizer/events/new")}
                sx={{ borderRadius: 2 }}
              >
                Tạo sự kiện
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={2} alignItems="center" color="text.secondary">
            <CalendarMonthRoundedIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {loading ? "Đang tải sự kiện..." : `Hiển thị ${totalElements} sự kiện`}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      {view === "grid" ? (
        loading ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <LinearProgress sx={{ width: "100%", maxWidth: 360 }} />
            <Typography variant="body2" color="text.secondary">
              Đang tải sự kiện...
            </Typography>
          </Stack>
        ) : viewEvents.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có sự kiện nào phù hợp bộ lọc.
              </Typography>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/organizer/events/new")} sx={{ borderRadius: 2 }}>
                Tạo sự kiện mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {viewEvents.map((event) => {
              const statusMeta = event.statusMeta;
              const progressRaw = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;
              const progress = Math.min(100, Math.max(0, progressRaw));
              const eventId = event.original.id ?? event.id;

              return (
                <Grid key={`${eventId}-${event.displayId}`} item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={statusMeta.label}
                              color={statusMeta.color as any}
                              variant={statusMeta.color === "default" ? "outlined" : "filled"}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {event.displayId}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                            {event.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>

                        <IconButton size="small">
                          <MoreVertRoundedIcon />
                        </IconButton>
                      </Stack>

                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1.2} alignItems="center" color="text.secondary">
                          <LiveTvRoundedIcon fontSize="small" />
                          <Typography variant="body2">{formatDate(event.startTime)}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ height: 8, borderRadius: 999, bgcolor: (t) => alpha(t.palette.primary.main, 0.08) }}
                        />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {event.ticketsSold}/{event.capacity} vé • {progress}%
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<OfflineBoltRoundedIcon fontSize="small" />}
                          sx={{ borderRadius: 2 }}
                          onClick={() => navigate(`/organizer/events/${eventId}/edit`)}
                        >
                          Tuỳ chỉnh
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<QrCodeScannerRoundedIcon fontSize="small" />}
                          sx={{ borderRadius: 2 }}
                          onClick={() => navigate(`/organizer/attendance?event=${eventId}`)}
                        >
                          Điểm danh
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      ) : loading ? (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <LinearProgress sx={{ width: "100%", maxWidth: 360 }} />
          <Typography variant="body2" color="text.secondary">
            Đang tải sự kiện...
          </Typography>
        </Stack>
      ) : viewEvents.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Chưa có sự kiện nào phù hợp bộ lọc.
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/organizer/events/new")} sx={{ borderRadius: 2 }}>
              Tạo sự kiện mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Stack divider={<Divider />}>
              {viewEvents.map((event) => {
                const statusMeta = event.statusMeta;
                const progressRaw = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;
                const progress = Math.min(100, Math.max(0, progressRaw));
                const eventId = event.original.id ?? event.id;

                return (
                  <Box key={`${eventId}-${event.displayId}`} sx={{ px: 3, py: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <Box sx={{ flexBasis: { xs: "100%", md: "30%" } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={statusMeta.label}
                          color={statusMeta.color as any}
                          variant={statusMeta.color === "default" ? "outlined" : "filled"}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.displayId}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {event.name}
                      </Typography>
                    </Box>

                    <Stack spacing={0.5} sx={{ flexBasis: { xs: "100%", md: "25%" } }}>
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.startTime)}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.75} sx={{ flexBasis: { xs: "100%", md: "20%" } }}>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 999 }} />
                      <Typography variant="caption" color="text.secondary">
                        {event.ticketsSold}/{event.capacity} vé ({progress}%)
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
                      <Button size="small" onClick={() => navigate(`/organizer/events/${eventId}/edit`)}>
                        Tuỳ chỉnh
                      </Button>
                      <Button size="small" onClick={() => navigate(`/organizer/attendance?event=${eventId}`)}>
                        Điểm danh
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}



