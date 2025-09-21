


import { useEffect, useMemo, useState, Fragment, isValidElement } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  Switch,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// ---- Types ----
export type Role = "ADMIN" | "ORGANIZER" | "USER";
export type EventStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED" | "DRAFT";
type TimeRange = "today" | "7d" | "30d" | "all";

interface Kpis {
  usersTotal: number;
  usersByRole: Record<Role, number>;
  eventsTotal: number;
  eventsByStatus: Record<EventStatus, number>;
  registrationsTotal: number;
  attendanceTotal: number;
  capacityUtilizationPct: number;
}
interface PendingEventSummary {
  id: number;
  name: string;
  organizerName: string;
  startTime: string; // ISO
  capacity: number;
}
interface RecentRegistration {
  id: number;
  eventId: number;
  eventName: string;
  studentEmail: string;
  registeredOn: string; // ISO
}
interface CapacityHotspot {
  eventId: number;
  eventName: string;
  capacity: number;
  seatsAvailable: number;
}
interface AdminMetricsDto {
  kpis: Kpis;
  pendingEvents: PendingEventSummary[];
  recentRegistrations: RecentRegistration[];
  capacityHotspots: CapacityHotspot[];
  lastUpdated: string; // ISO
}

// ---- Config ----
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:6868";
const METRICS_URL = `${API_BASE}/api/admin/metrics`;
const APPROVE_URL = (id: number) => `${API_BASE}/api/admin/events/${id}/approve`;
const REJECT_URL = (id: number) => `${API_BASE}/api/admin/events/${id}/reject`;

// ---- Helpers ----
const nf = new Intl.NumberFormat();
const pct = (n: number, d: number) => (!d ? 0 : Math.max(0, Math.min(100, Number.isFinite((n / d) * 100) ? (n / d) * 100 : 0)));
function formatDateTime(iso: string) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
      <Typography variant="h3" aria-hidden>🧭</Typography>
      <Typography variant="subtitle1" sx={{ mt: 1 }}>{title}</Typography>
      {desc && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{desc}</Typography>}
    </Box>
  );
}

// ---- Data Hook ----
function useAdminMetrics() {
  const [data, setData] = useState<AdminMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(METRICS_URL, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = (await res.json()) as AdminMetricsDto;
      setData(json);
    } catch (e: any) {
      console.warn("/api/admin/metrics failed — using demo payload.", e);
      const demo: AdminMetricsDto = {
        kpis: {
          usersTotal: 421,
          usersByRole: { ADMIN: 2, ORGANIZER: 19, USER: 400 },
          eventsTotal: 58,
          eventsByStatus: { APPROVED: 36, PENDING_APPROVAL: 8, REJECTED: 3, DRAFT: 11 },
          registrationsTotal: 1320,
          attendanceTotal: 987,
          capacityUtilizationPct: 73,
        },
        pendingEvents: [
          { id: 101, name: "AI Day 2025", organizerName: "Khoa CNTT", startTime: new Date().toISOString(), capacity: 250 },
          { id: 102, name: "Hội thảo An toàn thông tin", organizerName: "Trung tâm ATTT", startTime: new Date().toISOString(), capacity: 150 },
          { id: 103, name: "Robotics Challenge", organizerName: "CLB Robotics", startTime: new Date().toISOString(), capacity: 90 },
        ],
        recentRegistrations: [
          { id: 1, eventId: 31, eventName: "Tech Talk", studentEmail: "sv001@univ.edu", registeredOn: new Date().toISOString() },
          { id: 2, eventId: 42, eventName: "Web3 Intro", studentEmail: "sv045@univ.edu", registeredOn: new Date().toISOString() },
          { id: 3, eventId: 17, eventName: "AI Day 2025", studentEmail: "sv210@univ.edu", registeredOn: new Date().toISOString() },
        ],
        capacityHotspots: [
          { eventId: 31, eventName: "Tech Talk", capacity: 100, seatsAvailable: 4 },
          { eventId: 42, eventName: "Web3 Intro", capacity: 80, seatsAvailable: 2 },
          { eventId: 55, eventName: "CTF Campus", capacity: 120, seatsAvailable: 11 },
        ],
        lastUpdated: new Date().toISOString(),
      };
      setData(demo);
      setError(e?.message ?? "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);
  return { data, loading, error, refetch: fetchMetrics };
}

// ---- Small UI widgets ----
function KpiCard({
  title,
  value,
  icon,
  subtitle,
  progress,
  alert,
}: {
  title: string;
  value: React.ReactNode; // cho phép Skeleton/JSX -> tránh bọc Typography khi là Skeleton
  icon?: JSX.Element;
  subtitle?: string;
  progress?: number; // 0..100
  alert?: "success" | "warning" | "error";
}) {
  const isPrimitive = typeof value === "number" || typeof value === "string";
  return (
    <Card
      sx={{
        height: "100%",
        p: 0.5,
        background: (theme) =>
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0))"
            : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>

            {isPrimitive ? (
              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {typeof value === "number" ? nf.format(value as number) : (value as string)}
              </Typography>
            ) : (
              <Box sx={{ mt: 0.5 }}>{value}</Box>
            )}

            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && <Box aria-hidden>{icon}</Box>}
        </Stack>

        {typeof progress === "number" && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
        )}

        {alert && (
          <Box sx={{ mt: 1 }}>
            {alert === "success" && <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Ổn định" />}
            {alert === "warning" && <Chip size="small" color="warning" variant="outlined" icon={<WarningAmberIcon />} label="Cần chú ý" />}
            {alert === "error" && <Chip size="small" color="error" variant="outlined" icon={<DoDisturbIcon />} label="Lỗi" />}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function Section({ title, action, children }: { title: string; action?: JSX.Element; children: JSX.Element }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----
export default function AdminDashboard() {
  const { data, loading, error, refetch } = useAdminMetrics();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshSec, setRefreshSec] = useState<number>(30);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  // Đảm bảo portal của Snackbar gắn vào #root (tránh removeChild race khi unmount)
  const portalContainer = (typeof document !== "undefined" && document.getElementById("root")) || undefined;

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => refetch(), refreshSec * 1000);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshSec, refetch]);

  const roleBreakdown = useMemo(() => {
    const r = data?.kpis.usersByRole;
    const total = data?.kpis.usersTotal ?? 0;
    return [
      { label: "Admin", val: r?.ADMIN ?? 0, pct: pct(r?.ADMIN ?? 0, total) },
      { label: "Organizer", val: r?.ORGANIZER ?? 0, pct: pct(r?.ORGANIZER ?? 0, total) },
      { label: "User", val: r?.USER ?? 0, pct: pct(r?.USER ?? 0, total) },
    ];
  }, [data]);

  const statusBreakdown = useMemo(() => {
    const s = data?.kpis.eventsByStatus;
    const total = data?.kpis.eventsTotal ?? 0;
    const rows: { label: string; key: EventStatus }[] = [
      { label: "Approved", key: "APPROVED" },
      { label: "Pending", key: "PENDING_APPROVAL" },
      { label: "Rejected", key: "REJECTED" },
      { label: "Draft", key: "DRAFT" },
    ];
    return rows.map((r) => ({ label: r.label, val: s?.[r.key] ?? 0, pct: pct(s?.[r.key] ?? 0, total) }));
  }, [data]);

  // Quick Approve/Reject
  const approve = async (id: number) => {
    try {
      setBusyId(id);
      const res = await fetch(APPROVE_URL(id), { method: "POST" });
      if (!res.ok) throw new Error("Approve failed");
      setSnack({ open: true, msg: `Đã duyệt sự kiện #${id}`, severity: "success" });
      refetch();
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Không thể duyệt sự kiện. Kiểm tra server logs.", severity: "error" });
    } finally {
      setBusyId(null);
    }
  };
  const reject = async (id: number) => {
    try {
      setBusyId(id);
      const res = await fetch(REJECT_URL(id), { method: "POST" });
      if (!res.ok) throw new Error("Reject failed");
      setSnack({ open: true, msg: `Đã từ chối sự kiện #${id}`, severity: "success" });
      refetch();
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Không thể từ chối sự kiện. Kiểm tra server logs.", severity: "error" });
    } finally {
      setBusyId(null);
    }
  };

  // Top toolbar
  const Controls = (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Tooltip title="Tự động làm mới" disablePortal>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Switch
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              inputProps={{ "aria-label": "auto refresh toggle" }}
            />
            <Typography variant="body2">Auto</Typography>
          </Stack>
        </Tooltip>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel id="refresh-interval">Khoảng</InputLabel>
          <Select
            labelId="refresh-interval"
            label="Khoảng"
            value={refreshSec}
            onChange={(e) => setRefreshSec(Number(e.target.value))}
            MenuProps={{ disablePortal: true, keepMounted: true }}
          >
            <MenuItem value={15}>15s</MenuItem>
            <MenuItem value={30}>30s</MenuItem>
            <MenuItem value={60}>60s</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="time-range">Khoảng thời gian</InputLabel>
          <Select
            labelId="time-range"
            label="Khoảng thời gian"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            MenuProps={{ disablePortal: true, keepMounted: true }}
          >
            <MenuItem value="today">Hôm nay</MenuItem>
            <MenuItem value="7d">7 ngày</MenuItem>
            <MenuItem value="30d">30 ngày</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "space-between", md: "flex-end" }}>
        <Tooltip title="Tải xuống báo cáo CSV (stub)" disablePortal>
          <span>
            <IconButton aria-label="export" disabled={loading}>
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Cấu hình (stub)" disablePortal>
          <IconButton aria-label="settings">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Làm mới" disablePortal>
          <IconButton onClick={refetch} aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Bảng điều khiển Quản trị
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.lastUpdated && <Fragment> | Cập nhật: {formatDateTime(data.lastUpdated)}</Fragment>}
          </Typography>
        </Box>
        {Controls}
      </Stack>

      {/* KPI Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Tooltip
            title={`ADMIN ${roleBreakdown[0]?.val}, ORGANIZER ${roleBreakdown[1]?.val}, USER ${roleBreakdown[2]?.val}`}
            disablePortal
          >
            <Box>
              <KpiCard
                title="Users"
                value={loading ? <Skeleton width={60} /> : (data?.kpis.usersTotal ?? 0)}
                icon={<PeopleIcon fontSize="large" />}
                subtitle={
                  loading
                    ? undefined
                    : roleBreakdown.map((r) => `${r.label}: ${nf.format(r.val)} (${r.pct.toFixed(0)}%)`).join(" • ")
                }
                alert="success"
              />
            </Box>
          </Tooltip>
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            title="Events"
            value={loading ? <Skeleton width={60} /> : (data?.kpis.eventsTotal ?? 0)}
            icon={<EventIcon fontSize="large" />}
            subtitle={
              loading
                ? undefined
                : statusBreakdown
                    .filter((r) => r.val > 0)
                    .map((r) => `${r.label}: ${nf.format(r.val)}`)
                    .join(" • ")
            }
            alert={data && (data.kpis.eventsByStatus.PENDING_APPROVAL > 0 ? "warning" : "success")}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            title="Registrations"
            value={loading ? <Skeleton width={80} /> : (data?.kpis.registrationsTotal ?? 0)}
            icon={<HowToRegIcon fontSize="large" />}
            subtitle="Tổng lượt đăng ký hợp lệ"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            title="Attendance"
            value={loading ? <Skeleton width={60} /> : (data?.kpis.attendanceTotal ?? 0)}
            icon={<FactCheckIcon fontSize="large" />}
            subtitle="Đã điểm danh (present)"
            progress={loading ? 0 : (data?.kpis.capacityUtilizationPct ?? 0)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Pending approvals */}
        <Grid item xs={12} md={6}>
          <Section
            title="Sự kiện chờ phê duyệt"
            action={
              <Chip
                color="warning"
                icon={<PendingActionsIcon />}
                label={loading ? "…" : `${data?.kpis.eventsByStatus.PENDING_APPROVAL ?? 0} pending`}
                variant="outlined"
              />
            }
          >
            {loading ? (
              <List>
                {[1, 2, 3].map((i) => (
                  <ListItem key={i} divider>
                    <ListItemText primary={<Skeleton width="40%" />} secondary={<Skeleton width="30%" />} />
                  </ListItem>
                ))}
              </List>
            ) : data?.pendingEvents?.length ? (
              <List>
                {data.pendingEvents.map((e) => (
                  <ListItem
                    key={e.id}
                    divider
                    alignItems="flex-start"
                    onClick={() => navigate(`/admin/events/${e.id}`)}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={(ev) => { ev.stopPropagation(); approve(e.id); }}
                          disabled={busyId === e.id}
                          startIcon={<CheckCircleIcon />}
                        >
                          {busyId === e.id ? "Đang duyệt…" : "Duyệt"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={(ev) => { ev.stopPropagation(); reject(e.id); }}
                          disabled={busyId === e.id}
                          startIcon={<DoDisturbIcon />}
                        >
                          {busyId === e.id ? "Đang xử lý…" : "Từ chối"}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ fontWeight: 600 }}>{e.name}</Typography>
                          <Chip label={`#${e.id}`} size="small" />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Tổ chức: {e.organizerName} • Bắt đầu: {formatDateTime(e.startTime)} • Sức chứa: {nf.format(e.capacity)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState title="Không có sự kiện nào đang chờ." desc="Khi có đề xuất mới, danh sách sẽ cập nhật tự động." />
            )}
          </Section>
        </Grid>

        {/* Capacity hotspots */}
        <Grid item xs={12} md={6}>
          <Section title="Sự kiện sắp kín chỗ (hotspots)">
            {loading ? (
              <Table size="small" aria-label="capacity-hotspots-loading">
                <TableHead>
                  <TableRow>
                    <TableCell>Sự kiện</TableCell>
                    <TableCell align="right">Sức chứa</TableCell>
                    <TableCell align="right">Còn trống</TableCell>
                    <TableCell align="right">Lấp đầy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width="60%" /></TableCell>
                      <TableCell align="right"><Skeleton width={40} /></TableCell>
                      <TableCell align="right"><Skeleton width={40} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : data?.capacityHotspots?.length ? (
              <Table size="small" aria-label="capacity-hotspots" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Sự kiện</TableCell>
                    <TableCell align="right">Sức chứa</TableCell>
                    <TableCell align="right">Còn trống</TableCell>
                    <TableCell align="right">Lấp đầy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.capacityHotspots.map((h) => {
                    const filled = h.capacity - h.seatsAvailable;
                    const fillPct = pct(filled, h.capacity);
                    return (
                      <TableRow
                        key={h.eventId}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/events/${h.eventId}`)}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 600 }}>{h.eventName}</Typography>
                            <Chip size="small" label={`#${h.eventId}`} />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{nf.format(h.capacity)}</TableCell>
                        <TableCell align="right">{nf.format(h.seatsAvailable)}</TableCell>
                        <TableCell align="right" width={180}>
                          <Stack>
                            <LinearProgress variant="determinate" value={fillPct} />
                            <Typography variant="caption" color="text.secondary" align="right">
                              {fillPct.toFixed(0)}%
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Chưa có hotspot." desc="Khi sự kiện gần kín chỗ, bạn sẽ thấy tại đây." />
            )}
          </Section>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Recent registrations */}
        <Grid item xs={12} md={7}>
          <Section title="Đăng ký gần đây">
            {loading ? (
              <List>
                {[1, 2, 3, 4, 5].map((i) => (
                  <ListItem divider key={i}>
                    <ListItemText primary={<Skeleton width="40%" />} secondary={<Skeleton width="30%" />} />
                  </ListItem>
                ))}
              </List>
            ) : data?.recentRegistrations?.length ? (
              <List>
                {data.recentRegistrations.map((r) => (
                  <ListItem
                    key={r.id}
                    divider
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/events/${r.eventId}`)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontWeight: 600 }}>{r.eventName}</Typography>
                          <Chip size="small" label={`#${r.eventId}`} />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {r.studentEmail} • {formatDateTime(r.registeredOn)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState title="Chưa có đăng ký mới." />
            )}
          </Section>
        </Grid>

        {/* Quick actions */}
        <Grid item xs={12} md={5}>
          <Section title="Thao tác nhanh" action={<Chip icon={<AutoAwesomeIcon />} label="Gợi ý" size="small" />}>
            <Stack spacing={1}>
              <Button variant="contained" href="/admin/events">Tạo sự kiện mới</Button>
              <Button variant="outlined" href="/admin/events?status=PENDING_APPROVAL">Xem tất cả sự kiện chờ duyệt</Button>
              <Button variant="outlined" href="/admin/users">Quản lý người dùng</Button>
              <Button variant="outlined" href="/admin/reports">Báo cáo & Xuất dữ liệu</Button>
            </Stack>
          </Section>
        </Grid>
      </Grid>

      {/* Error surface (non-blocking because we fallback to demo) */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning" variant="outlined">
            Không tải được metrics từ API: {error}. Đang hiển thị dữ liệu demo.
          </Alert>
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        container={portalContainer}
        TransitionProps={{ appear: false }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
