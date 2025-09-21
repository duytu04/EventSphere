import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Avatar,
  IconButton,
  Alert,
  Skeleton,
  LinearProgress,
  Link,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import PeopleIcon from "@mui/icons-material/People";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import VerifiedIcon from "@mui/icons-material/Verified";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useSnackbar } from "notistack";

import api from "../../api/axiosClient";
import {
  fetchPublicEventById,
  EventResponse,
} from "../../features/events/eventsApi";

/* =========================================================
 * Types phụ cho đăng ký của riêng sự kiện
 * =======================================================*/
export type MyRegistration = {
  id: number;
  status: "REGISTERED" | "CANCELLED" | "WAITLISTED" | string;
  qrCode?: string;         // (tùy BE)
  checkedInAt?: string;    // (tùy BE)
  createdAt?: string;
};

/* =========================================================
 * API helpers (đa kênh, có fallback path)
 * =======================================================*/
async function fetchMyRegistrationForEvent(eventId: number): Promise<MyRegistration | null> {
  // Ưu tiên các path đặc thù nếu có, sau đó fallback query chung
  const tryPaths = [
    `/api/me/registrations/by-event/${eventId}`,
    `/api/me/registrations?eventId=${eventId}`,
  ];
  for (const p of tryPaths) {
    try {
      const { data } = await api.get(p);
      if (!data) continue;
      if (Array.isArray(data)) {
        return data[0] ?? null;
      }
      if (data.content && Array.isArray(data.content)) {
        return data.content[0] ?? null;
      }
      // object đơn
      if (data.id || data.status) return data as MyRegistration;
    } catch (e) {
      // bỏ qua và thử path khác
    }
  }
  return null;
}

async function createRegistration(eventId: number): Promise<MyRegistration> {
  // Chuẩn khuyến nghị: POST /api/registrations { eventId }
  const { data } = await api.post(`/api/registrations`, { eventId });
  return data as MyRegistration;
}

async function cancelRegistration(registrationId: number): Promise<void> {
  // Chuẩn khuyến nghị: DELETE /api/me/registrations/{id}
  await api.delete(`/api/me/registrations/${registrationId}`);
}

/* =========================================================
 * Helpers
 * =======================================================*/
function formatRange(start?: string, end?: string) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : undefined;
  const sameDay = !!e && s.toDateString() === e.toDateString();
  const f = (d: Date) => d.toLocaleString();
  if (!e) return f(s);
  return sameDay ? `${f(s)} – ${e.toLocaleTimeString()}` : `${f(s)} → ${f(e)}`;
}

function toIcs(ev: EventResponse) {
  // Tạo file ICS đơn giản
  const dt = (iso?: string) => (iso ? new Date(iso) : undefined);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const fmt = (d?: Date) =>
    d
      ? `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
          d.getUTCMinutes()
        )}${pad(d.getUTCSeconds())}Z`
      : "";
  const uid = `event-${ev.id}@eventsphere`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventSphere//Event//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    ev.startTime ? `DTSTART:${fmt(dt(ev.startTime))}` : "",
    ev.endTime ? `DTEND:${fmt(dt(ev.endTime))}` : "",
    `SUMMARY:${escapeIcs(ev.name ?? "Event")}`,
    ev.location ? `LOCATION:${escapeIcs(ev.location)}` : "",
    ev.description ? `DESCRIPTION:${escapeIcs(ev.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

function escapeIcs(s: string) {
  return s.replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

/* =========================================================
 * Component chính
 * =======================================================*/
export default function EventParticipantDashboard() {
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const eventId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ev, setEv] = useState<EventResponse | null>(null);
  const [myReg, setMyReg] = useState<MyRegistration | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const e = await fetchPublicEventById(eventId);
        const r = await fetchMyRegistrationForEvent(eventId);
        if (!mounted) return;
        setEv(e);
        setMyReg(r);
      } catch (e: any) {
        setError(e?.message ?? "Không tải được chi tiết sự kiện");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const isEnded = useMemo(() => (ev ? new Date(ev.endTime).getTime() < Date.now() : false), [ev]);
  const seatsLeft = ev?.seatsAvailable ?? 0;
  const cap = ev?.capacity ?? 0;
  const isRegistered = !!myReg && myReg.status !== "CANCELLED";
  const canRegister = !!ev && ev.status === "APPROVED" && !isEnded && !isRegistered && seatsLeft > 0;
  const canCancel = !!myReg && myReg.status === "REGISTERED" && !isEnded;

  const progress = useMemo(() => {
    if (!ev) return 0;
    const start = new Date(ev.startTime).getTime();
    const end = new Date(ev.endTime).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [ev]);

  const capacityUsage = useMemo(() => {
    if (!cap) return 0;
    // seatsAvailable là số ghế còn trống; đã dùng = cap - seatsAvailable
    return Math.round(((cap - seatsLeft) / cap) * 100);
  }, [cap, seatsLeft]);

  const doRegister = async () => {
    if (!ev) return;
    setActing(true);
    try {
      const r = await createRegistration(ev.id);
      setMyReg(r);
      enqueueSnackbar("Đã đăng ký tham dự", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message ?? "Đăng ký thất bại", { variant: "error" });
    } finally {
      setActing(false);
    }
  };

  const doCancel = async () => {
    if (!myReg) return;
    const ok = window.confirm("Huỷ đăng ký sự kiện này?");
    if (!ok) return;
    setActing(true);
    try {
      await cancelRegistration(myReg.id);
      setMyReg({ ...myReg, status: "CANCELLED" });
      enqueueSnackbar("Đã huỷ đăng ký", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message ?? "Huỷ không thành công", { variant: "error" });
    } finally {
      setActing(false);
    }
  };

  const handleShare = async () => {
    if (!ev) return;
    const url = window.location.href;
    const text = `${ev.name} — ${formatRange(ev.startTime, ev.endTime)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: ev.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        enqueueSnackbar("Đã copy link", { variant: "info" });
      }
    } catch {
      // bỏ qua
    }
  };

  const downloadIcs = () => {
    if (!ev) return;
    const blob = toIcs(ev);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(ev.name || "event").replace(/[^a-z0-9-_]+/gi, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="text" width={280} height={36} />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}><Skeleton variant="rounded" height={220} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rounded" height={220} /></Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>
        <Alert severity="error" icon={<ErrorOutlineIcon />}>{error}</Alert>
      </Box>
    );
  }

  if (!ev) return null;

  const mapsUrl = ev.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}` : undefined;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{ev.name}</Typography>
          <Typography variant="body2" color="text.secondary">Bảng điều khiển chi tiết sự kiện</Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>Chia sẻ</Button>
          <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={downloadIcs}>Thêm vào lịch</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* Left: Tổng quan & mô tả */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardHeader
              title={<Typography variant="h6">Tổng quan</Typography>}
              action={ev.status && <Chip size="small" label={ev.status} color={ev.status === "APPROVED" ? "success" : "default"} />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Stack gap={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CalendarMonthIcon fontSize="small" />
                      <Typography variant="body2"><b>Thời gian:</b> {formatRange(ev.startTime, ev.endTime)}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <PlaceIcon fontSize="small" />
                      <Typography variant="body2"><b>Địa điểm:</b> {ev.location || "—"} {mapsUrl && (
                        <Link href={mapsUrl} target="_blank" rel="noreferrer" sx={{ ml: 1 }}>
                          Mở bản đồ <OpenInNewIcon sx={{ fontSize: 14, ml: 0.25 }} />
                        </Link>
                      )}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" />
                      <Typography variant="body2"><b>Sức chứa:</b> {seatsLeft}/{cap} chỗ còn lại</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Avatar
                    variant="rounded"
                    src={ev.mainImageUrl}
                    sx={{ width: "100%", height: 120 }}
                  />
                </Grid>
              </Grid>

              {/* Tiến độ thời gian diễn ra */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Tiến độ sự kiện</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5, borderRadius: 2 }} />
              </Box>

              {/* Mô tả */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Mô tả</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {ev.description?.trim() || "(Chưa có mô tả)"}
              </Typography>
            </CardContent>
          </Card>

          {/* Lịch sử/Thông báo - placeholder để bạn nối API sau */}
          <Card sx={{ borderRadius: 3, mt: 2 }}>
            <CardHeader title={<Typography variant="h6">Thông báo & cập nhật</Typography>} />
            <Divider />
            <CardContent>
              <Alert severity="info">TODO: Nối API thông báo/bài viết liên quan sự kiện.</Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Panel đăng ký của tôi */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader title={<Typography variant="h6">Đăng ký của tôi</Typography>} />
            <Divider />
            <CardContent>
              <Stack gap={1.25}>
                {isRegistered ? (
                  <Chip icon={<VerifiedIcon />} color="success" label={`Trạng thái: ${myReg?.status}`} />
                ) : (
                  <Chip color="default" label={`Trạng thái: Chưa đăng ký`} />
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">Tỷ lệ lấp đầy</Typography>
                  <LinearProgress variant="determinate" value={capacityUsage} sx={{ mt: 0.5, borderRadius: 2 }} />
                </Box>

                <Stack direction="row" gap={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!canRegister || acting}
                    onClick={doRegister}
                  >
                    Đăng ký tham dự
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    disabled={!canCancel || acting}
                    onClick={doCancel}
                  >
                    Huỷ đăng ký
                  </Button>
                </Stack>

                {/* Vé/QR nếu BE cung cấp */}
                {myReg?.qrCode ? (
                  <Button
                    startIcon={<QrCode2Icon />}
                    variant="outlined"
                    component={RouterLink}
                    to={`/dashboard/registrations/${myReg.id}/ticket`}
                  >
                    Xem vé / QR
                  </Button>
                ) : (
                  isRegistered && (
                    <Alert severity="info">Bạn đã đăng ký. Vé/QR sẽ hiển thị tại đây nếu có.</Alert>
                  )
                )}

                <Divider />
                <Stack direction="row" gap={1} justifyContent="space-between">
                  <Button startIcon={<ContentCopyIcon />} onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    enqueueSnackbar("Đã copy liên kết sự kiện", { variant: "info" });
                  }}>Copy link</Button>
                  {mapsUrl && (
                    <Button startIcon={<OpenInNewIcon />} component={Link} href={mapsUrl} target="_blank" rel="noreferrer">
                      Mở bản đồ
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
