

// src/pages/admin/AdminEventDetailDrawer.tsx
import { useEffect, useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";

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
  s === "APPROVED"
    ? "success"
    : s === "REJECTED"
    ? "warning"
    : "default";

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
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!open || !eventId) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetchAdminEventById(eventId);
        if (mounted) setItem(res);
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
      await approveEvent(item.id);
      setItem({ ...item, status: "APPROVED" });
      onApproved?.(item.id);
      enqueueSnackbar("Approved!", { variant: "success" });
    } finally {
      setActing(false);
    }
  };

  const doReject = async () => {
    if (!item) return;
    setActing(true);
    try {
      await rejectEvent(item.id);
      setItem({ ...item, status: "REJECTED" });
      onRejected?.(item.id);
      enqueueSnackbar("Rejected!", { variant: "warning" });
    } finally {
      setActing(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: "100vw", sm: 520, md: 640 },
          p: 2,
          boxSizing: "border-box",
        }}
        role="presentation"
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Event Detail</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Registrations" />
          <Tab label="Feedback" />
        </Tabs>

        {/* Loading */}
        {loading && (
          <Stack gap={1}>
            <Skeleton width="60%" />
            <Skeleton width="40%" />
            <Skeleton height={120} />
          </Stack>
        )}

        {/* Error */}
        {!loading && err && <Alert severity="error">{err}</Alert>}

        {/* Content */}
        {!loading && !err && item && (
          <>
            {tab === 0 && (
              <Stack gap={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{item.name}</Typography>
                  <Chip
                    label={item.status ?? "UNKNOWN"}
                    color={statusColor(item.status) as any}
                    variant="outlined"
                  />
                </Stack>

                <Stack gap={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Địa điểm: <strong>{item.location ?? "—"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian:{" "}
                    <strong>
                      {item.startTime ? new Date(item.startTime).toLocaleString() : "—"}
                    </strong>{" "}
                    →{" "}
                    <strong>
                      {item.endTime ? new Date(item.endTime).toLocaleString() : "—"}
                    </strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh mục: <strong>{item.category ?? "—"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seats: <strong>{item.seatsAvailable ?? 0}/{item.capacity ?? 0}</strong>
                  </Typography>
                </Stack>

                <Divider />
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {item.description?.trim() || "No description"}
                </Typography>

                <Divider />
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button
                    onClick={() => navigateToPage?.(item.id)}
                    startIcon={<OpenInNewIcon />}
                  >
                    Open page
                  </Button>
                  <Button
                    onClick={() => navigateToEdit?.(item.id)}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
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
                </Stack>
              </Stack>
            )}

            {tab === 1 && (
              <Stack gap={1}>
                <Typography variant="subtitle2">Registrations</Typography>
                <Alert severity="info">TODO: Nối API registrations và hiển thị bảng.</Alert>
              </Stack>
            )}

            {tab === 2 && (
              <Stack gap={1}>
                <Typography variant="subtitle2">Feedback</Typography>
                <Alert severity="info">TODO: Nối API feedback và hiển thị danh sách đánh giá.</Alert>
              </Stack>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}
