// src/pages/events/EventDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchPublicEventById,
  fetchAdminEventById,
  approveEvent,
  rejectEvent,
  EventResponse,
} from "../../features/events/eventsApi";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import useAuth from "../../features/auth/useAuth";

function fmt(dt?: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function statusColor(status?: string):
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING_APPROVAL":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = useMemo(() => Number(id), [id]);

  const location = useLocation();
  const isAdminContext = location.pathname.startsWith("/admin");

  const navigate = useNavigate();
  const { hasAnyRole, isAuthenticated } = useAuth();

  const [item, setItem] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState<boolean>(false);

  const canAdmin = hasAnyRole(["ADMIN"]);
  const canEdit = hasAnyRole(["ORGANIZER", "ADMIN"]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!eventId || isNaN(eventId)) {
        setErr("ID sự kiện không hợp lệ");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = isAdminContext
          ? await fetchAdminEventById(eventId)
          : await fetchPublicEventById(eventId);
        if (mounted) setItem(data);
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
  }, [eventId, isAdminContext]);

  const doApprove = async () => {
    if (!item) return;
    setActing(true);
    try {
      await approveEvent(item.id);
      // refresh
      const fresh = isAdminContext
        ? await fetchAdminEventById(item.id)
        : await fetchPublicEventById(item.id);
      setItem(fresh);
    } finally {
      setActing(false);
    }
  };

  const doReject = async () => {
    if (!item) return;
    setActing(true);
    try {
      await rejectEvent(item.id);
      const fresh = isAdminContext
        ? await fetchAdminEventById(item.id)
        : await fetchPublicEventById(item.id);
      setItem(fresh);
    } finally {
      setActing(false);
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 2, px: 2 }}>
      <Grid item xs={12} md={10} lg={8}>
        <Card>
          <CardContent>
            {loading && <Typography>Đang tải chi tiết…</Typography>}
            {!loading && err && (
              <Typography color="error">{err}</Typography>
            )}
            {!loading && !err && item && (
              <Stack gap={2}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                  <Typography variant="h5" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.status ?? "UNKNOWN"}
                    color={statusColor(item.status)}
                    variant="outlined"
                  />
                </Stack>

                <Divider />

                {/* Meta */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa điểm: <strong>{item.location ?? "—"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian: <strong>{fmt(item.startTime)}</strong> →{" "}
                    <strong>{fmt(item.endTime)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh mục: <strong>{item.category ?? "—"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chỗ ngồi:{" "}
                    <strong>
                      {item.seatsAvailable ?? 0}/{item.capacity ?? 0}
                    </strong>
                  </Typography>
                </Box>

                <Divider />

                {/* Description */}
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {item.description?.trim() || "Không có mô tả."}
                </Typography>

                {/* Actions */}
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {/* Public/participant: có thể thêm nút Đăng ký sau (tuỳ API) */}
                  {canEdit && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/organizer/events/${item.id}/edit`)}
                    >
                      Edit (Organizer)
                    </Button>
                  )}
                  {isAdminContext && canAdmin && (
                    <>
                      <Button
                        variant="contained"
                        disabled={acting || item.status === "APPROVED"}
                        onClick={doApprove}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        disabled={acting || item.status === "REJECTED"}
                        onClick={doReject}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {!isAuthenticated && (
                    <Button
                      variant="text"
                      onClick={() => navigate("/login")}
                    >
                      Đăng nhập để thao tác
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
