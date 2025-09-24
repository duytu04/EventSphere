import { useMemo, useState } from "react";
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

const MOCK_EVENTS = [
  {
    id: "EVT-2301",
    name: "Tech Innovators Summit",
    status: "active" as const,
    startTime: "2025-09-28T08:30:00",
    venue: "Trung tâm Hội nghị GEM",
    ticketsSold: 420,
    capacity: 560,
  },
  {
    id: "EVT-2302",
    name: "Workshop: Thiết kế trải nghiệm",
    status: "draft" as const,
    startTime: "2025-10-02T13:30:00",
    venue: "Dreamplex 195 Điện Biên Phủ",
    ticketsSold: 120,
    capacity: 220,
  },
  {
    id: "EVT-2303",
    name: "Music & Art Night",
    status: "active" as const,
    startTime: "2025-10-05T19:00:00",
    venue: "Saigon Outcast",
    ticketsSold: 380,
    capacity: 420,
  },
  {
    id: "EVT-2304",
    name: "Startup Funding 101",
    status: "archived" as const,
    startTime: "2025-08-12T18:00:00",
    venue: "CirCO Coworking",
    ticketsSold: 240,
    capacity: 260,
  },
];

const statusChips: Record<string, { label: string; color: "default" | "primary" | "success" | "warning" }> = {
  active: { label: "Đang bán", color: "success" },
  draft: { label: "Nháp", color: "warning" },
  archived: { label: "Đã lưu trữ", color: "default" },
};

export default function EventsManage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((ev) => {
      const matchStatus = statusFilter === "all" || ev.status === statusFilter;
      const matchSearch = !search || ev.name.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [statusFilter, search]);

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
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang bán</MenuItem>
                <MenuItem value="draft">Nháp</MenuItem>
                <MenuItem value="archived">Đã lưu trữ</MenuItem>
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
            <Typography variant="body2">Hiển thị {filteredEvents.length} sự kiện</Typography>
          </Stack>
        </CardContent>
      </Card>

      {view === "grid" ? (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const statusMeta = statusChips[event.status];
            const progress = Math.round((event.ticketsSold / event.capacity) * 100);
            return (
              <Grid key={event.id} item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={statusMeta.label}
                            color={statusMeta.color}
                            variant={statusMeta.color === "default" ? "outlined" : "filled"}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {event.id}
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                          {event.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.venue}
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
                        onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                      >
                        Tuỳ chỉnh
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<QrCodeScannerRoundedIcon fontSize="small" />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => navigate(`/organizer/attendance?event=${event.id}`)}
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
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Stack divider={<Divider />}>
              {filteredEvents.map((event) => {
                const statusMeta = statusChips[event.status];
                const progress = Math.round((event.ticketsSold / event.capacity) * 100);
                return (
                  <Box key={event.id} sx={{ px: 3, py: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <Box sx={{ flexBasis: { xs: "100%", md: "30%" } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={statusMeta.label}
                          color={statusMeta.color}
                          variant={statusMeta.color === "default" ? "outlined" : "filled"}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.id}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {event.name}
                      </Typography>
                    </Box>

                    <Stack spacing={0.5} sx={{ flexBasis: { xs: "100%", md: "25%" } }}>
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
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
                      <Button size="small" onClick={() => navigate(`/organizer/events/${event.id}/edit`)}>
                        Tuỳ chỉnh
                      </Button>
                      <Button size="small" onClick={() => navigate(`/organizer/attendance?event=${event.id}`)}>
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



