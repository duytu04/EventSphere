



// src/pages/admin/AdminEventDetailDrawer.tsx
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminEventById,
  approveEvent,
  rejectEvent,
  EventResponse,
} from "../../features/events/eventsApi";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Grid,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import PhotoIcon from "@mui/icons-material/Photo";
import { useSnackbar } from "notistack";

// (1) Nếu bạn chưa cài, chạy: npm i dompurify @types/dompurify
import DOMPurify from "dompurify";

// (2) NHẬP DASHBOARD NGƯỜI THAM DỰ
// đường dẫn từ pages/admin -> pages/dashboard
import ParticipantDashboard from "../dashboard/ParticipantDashboard";

type Props = {
  open: boolean;
  eventId: number | null;
  onClose: () => void;
  onApproved?: (id: number) => void;
  onRejected?: (id: number) => void;
  navigateToPage?: (id: number) => void;
  navigateToEdit?: (id: number) => void;
};

const statusColor = (s?: string) =>
  s === "APPROVED" ? "success" : s === "REJECTED" ? "warning" : "default";

function pickTitle(e: any) {
  return e?.name ?? e?.title ?? `Event #${e?.id ?? ""}`;
}
function pickVenue(e: any) {
  return e?.location ?? e?.venue ?? "—";
}
function pickMainImage(e: any) {
  return e?.mainImageUrl ?? e?.imageUrl ?? e?.coverUrl ?? null;
}
function pickGallery(e: any): string[] {
  const g = e?.gallery ?? e?.images ?? e?.imageUrls ?? e?.media ?? [];
  return Array.isArray(g) ? g.filter(Boolean) : [];
}
function fmt(dt?: string) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}
function safeHtml(html?: string) {
  if (!html) return "";
  return DOMPurify.sanitize(html);
}

export default function AdminEventDetailDrawer({
  open,
  eventId,
  onClose,
  onApproved,
  onRejected,
  navigateToPage,
  navigateToEdit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<EventResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!open || !eventId) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetchAdminEventById(eventId);
        if (mounted) {
          setItem(res);
          const hero = pickMainImage(res);
          const gallery = pickGallery(res);
          setPreview(hero ?? gallery[0] ?? null);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Không tải được chi tiết sự kiện");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [open, eventId]);

  const doApprove = async () => {
    if (!item) return;
    setActing(true);
    try {
      await approveEvent((item as any).id);
      const next = { ...(item as any), status: "APPROVED" };
      setItem(next);
      onApproved?.((item as any).id);
      enqueueSnackbar("Approved!", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Approve failed", { variant: "error" });
    } finally {
      setActing(false);
    }
  };

  const doReject = async () => {
    if (!item) return;
    setActing(true);
    try {
      await rejectEvent((item as any).id);
      const next = { ...(item as any), status: "REJECTED" };
      setItem(next);
      onRejected?.((item as any).id);
      enqueueSnackbar("Rejected!", { variant: "warning" });
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Reject failed", { variant: "error" });
    } finally {
      setActing(false);
    }
  };

  const hasHtmlContent = useMemo(() => {
    const html = (item as any)?.contentHtml ?? (item as any)?.descriptionHtml;
    return typeof html === "string" && html.trim().length > 0;
  }, [item]);
  const contentHtml = useMemo(() => {
    const raw =
      (item as any)?.contentHtml ??
      (item as any)?.descriptionHtml ??
      null;
    return raw ? safeHtml(raw) : null;
  }, [item]);
  const contentText = useMemo(() => {
    const txt = (item as any)?.description ?? (item as any)?.content ?? "";
    return typeof txt === "string" ? txt.trim() : "";
  }, [item]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        // (3) NỚI RỘNG DRAWER & CHO PHÉP SCROLL NỘI DUNG
        sx={{
          width: { xs: "100vw", md: 1000, lg: 1200 },
          p: 2,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
        }}
        role="presentation"
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Event Detail</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          {/* (4) Đổi tên tab cho rõ nghĩa */}
          <Tab label="Participants" />
          <Tab label="Feedback" />
        </Tabs>

        {/* Loading */}
        {loading && (
          <Stack gap={1}>
            <Skeleton variant="rectangular" height={180} />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
            <Skeleton height={120} />
          </Stack>
        )}

        {/* Error */}
        {!loading && err && <Alert severity="error">{err}</Alert>}

        {/* Content */}
        {!loading && !err && item && (
          <Box sx={{ overflow: "auto", pr: 1 }}>
            {/* ========== OVERVIEW ========== */}
            {tab === 0 && (
              <Stack gap={2}>
                <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
                  {preview ? (
                    <img
                      src={preview}
                      alt="event cover"
                      style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ aspectRatio: "16/9", bgcolor: "action.hover" }}>
                      <PhotoIcon />
                      <Typography variant="caption" color="text.secondary">No image</Typography>
                    </Stack>
                  )}
                </Paper>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{pickTitle(item)}</Typography>
                  <Chip
                    label={(item as any).status ?? "UNKNOWN"}
                    color={statusColor((item as any).status) as any}
                    variant="outlined"
                  />
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}><Meta label="Địa điểm" value={pickVenue(item)} /></Grid>
                  <Grid item xs={12} sm={6}><Meta label="Danh mục" value={(item as any)?.category ?? "—"} /></Grid>
                  <Grid item xs={12} sm={6}><Meta label="Bắt đầu" value={fmt((item as any)?.startTime)} /></Grid>
                  <Grid item xs={12} sm={6}><Meta label="Kết thúc" value={fmt((item as any)?.endTime)} /></Grid>
                  <Grid item xs={12} sm={6}>
                    <Meta
                      label="Seats"
                      value={`${(item as any)?.seatsAvailable ?? (item as any)?.seatsAvail ?? 0} / ${(item as any)?.capacity ?? (item as any)?.totalSeats ?? 0}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Meta label="Organizer" value={(item as any)?.organizerName ?? (item as any)?.organizerEmail ?? "—"} />
                  </Grid>
                  {(item as any)?.price != null && (
                    <Grid item xs={12} sm={6}><Meta label="Price" value={(item as any).price} /></Grid>
                  )}
                  {(item as any)?.version != null && (
                    <Grid item xs={12} sm={6}><Meta label="Version" value={(item as any).version} /></Grid>
                  )}
                </Grid>

                <Divider />

                <Typography variant="subtitle2">Nội dung</Typography>
                {hasHtmlContent ? (
                  <Box
                    sx={{
                      "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
                      "& h1, & h2, & h3": { mt: 2 },
                      "& p": { mb: 1.2 },
                    }}
                    dangerouslySetInnerHTML={{ __html: contentHtml! }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {contentText || "No description"}
                  </Typography>
                )}

                <Divider />

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button onClick={() => navigateToPage?.((item as any).id)} startIcon={<OpenInNewIcon />}>
                    Open page
                  </Button>
                  <Button onClick={() => navigateToEdit?.((item as any).id)} startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button variant="contained" disabled={acting || (item as any).status === "APPROVED"} onClick={doApprove}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="warning" disabled={acting || (item as any).status === "REJECTED"} onClick={doReject}>
                    Reject
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* ========== PARTICIPANTS (thay cho Registrations) ========== */}
            {tab === 1 && (
              // Bọc 1 lớp để triệt padding & cho full-width cảm giác “toàn bộ UI”
              <Box sx={{ p: 0, m: 0 }}>
                <ParticipantDashboard eventId={(item as any).id ?? eventId ?? null} />
              </Box>
            )}

            {/* ========== FEEDBACK ========== */}
            {tab === 2 && (
              <Stack gap={1}>
                <Typography variant="subtitle2">Feedback</Typography>
                <Alert severity="info">TODO: Nối API feedback và hiển thị danh sách đánh giá.</Alert>
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

function Meta({ label, value }: { label: string; value: any }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value ?? "—"}</Typography>
    </Stack>
  );
}

