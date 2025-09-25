

// src/pages/admin/AdminEvents.tsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  fetchAdminEvents,
  createAdminEvent,
  approveEvent,
  rejectEvent,
  EventResponse,
} from "../../features/events/eventsApi";
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import AdminEventDetailDrawer from "./AdminEventDetailDrawer";
import { useSnackbar } from "notistack";
import EmptyState from "../../components/common/EmptyState";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

const toLocalInputValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

type AdminStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED";

export default function AdminEvents() {
  const navigate = useNavigate();
  const nowLocal = toLocalInputValue(new Date());
  const { enqueueSnackbar } = useSnackbar();

  // ref để focus vào ô Name khi ấn "Create event"
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // ======= Query & pagination =======
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // debounce search
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 400);
    return () => clearTimeout(t);
  }, [qInput]);

  const [status, setStatus] = useState<AdminStatus | "ALL" | "">("");

  // ======= Data =======
  const [items, setItems] = useState<EventResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // alerts
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // ======= Create form =======
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "GENERAL",
    location: "",
    startTime: nowLocal,
    endTime: nowLocal,
    capacity: 100,
    mainImageUrl: "", // NEW: ảnh chính
  });

  // ====== Drawer chi tiết ======
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openDetail = useCallback((id: number) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const closeDetail = () => {
    setDrawerOpen(false);
    setSelectedId(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appliedStatus =
        status === "ALL" || status === "" ? undefined : (status as AdminStatus);
      const res = await fetchAdminEvents({ q, status: appliedStatus, page, size });
      setItems(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Load admin events failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [q, status, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setInfo(null);
    try {
      const payload = {
        ...form,
        capacity: Number.isFinite(form.capacity) ? form.capacity : 0,
        mainImageUrl: form.mainImageUrl?.trim() || undefined, // NEW
      };
      await createAdminEvent(payload);
      setInfo("Tạo sự kiện thành công.");
      enqueueSnackbar("Tạo sự kiện thành công", { variant: "success" });
      setPage(0);
      await load();
      setForm((old) => ({
        ...old,
        name: "",
        description: "",
        mainImageUrl: "", // reset ảnh sau khi tạo
      }));
    } catch (e: any) {
      setError(e?.message ?? "Tạo sự kiện thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: number) => {
    setError(null);
    try {
      await approveEvent(id);
      enqueueSnackbar("Approve thành công", { variant: "success" });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Approve thất bại");
    }
  };

  const handleReject = async (id: number) => {
    setError(null);
    try {
      await rejectEvent(id);
      enqueueSnackbar("Reject thành công", { variant: "warning" });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Reject thất bại");
    }
  };

  const statusColor = (s?: string) =>
    s === "APPROVED"
      ? "success"
      : s === "REJECTED"
      ? "warning"
      : s === "PENDING_APPROVAL"
      ? "default"
      : "default";

  const headerActions = useMemo(
    () => (
      <Stack direction="row" gap={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={qInput}
          onChange={(e) => {
            setPage(0);
            setQInput(e.target.value);
          }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            label="Status"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as any);
            }}
          >
            <MenuItem value="">(none)</MenuItem>
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="PENDING_APPROVAL">PENDING_APPROVAL</MenuItem>
            <MenuItem value="APPROVED">APPROVED</MenuItem>
            <MenuItem value="REJECTED">REJECTED</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    ),
    [qInput, status]
  );

  return (
    <Grid container spacing={2}>
      {/* Form tạo sự kiện */}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Event (Admin)
            </Typography>

            {info && (
              <Alert sx={{ mb: 2 }} severity="success" onClose={() => setInfo(null)}>
                {info}
              </Alert>
            )}
            {error && (
              <Alert sx={{ mb: 2 }} severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Stack component="form" gap={2} onSubmit={submit}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                inputRef={nameInputRef}
                required
              />
              <Stack gap={1}>
                <Typography variant="subtitle2">Description</Typography>
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Soạn nội dung sự kiện với đầy đủ định dạng..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["blockquote", "code-block"],
                      ["link", "image"],
                      [{ align: [] }],
                      ["clean"],
                    ],
                  }}
                />
                {form.description?.trim() && (
                  <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: "action.hover" }}>
                    <Typography variant="caption" color="text.secondary">Preview</Typography>
                    <Box
                      sx={{ '& img': { maxWidth: '100%', borderRadius: 1 }, '& ul, & ol': { pl: 3 } }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
                    />
                  </Box>
                )}
              </Stack>
              <TextField
                label="Main image URL"
                placeholder="https://..."
                value={form.mainImageUrl}
                onChange={(e) => setForm({ ...form, mainImageUrl: e.target.value })}
              />
              {form.mainImageUrl?.trim() && (
                <Box sx={{ mt: -1 }}>
                  <img
                    src={form.mainImageUrl}
                    alt="preview"
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                    onError={(ev) => ((ev.currentTarget.style.display = "none"))}
                  />
                </Box>
              )}
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <TextField
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <TextField
                label="Start"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
              <TextField
                label="End"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
              <TextField
                label="Capacity"
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: parseInt(e.target.value || "0", 10),
                  })
                }
              />
              <Button variant="contained" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Danh sách + hành động */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Events (Admin)
            </Typography>

            {headerActions}

            {loading && (
              <Stack gap={1}>
                {[1, 2, 3].map((i) => (
                  <Card key={i} variant="outlined">
                    <CardContent>
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                      <Skeleton width="30%" />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {!loading && error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <Stack gap={1}>
                {items.length === 0 ? (
                  <EmptyState
                    title="No events"
                    hint="Hãy tạo sự kiện mới hoặc đổi bộ lọc."
                    actionLabel="Create event"
                    onAction={() => {
                      nameInputRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      nameInputRef.current?.focus();
                    }}
                  />
                ) : (
                  items.map((ev) => {
                    const start = ev.startTime ? new Date(ev.startTime) : null;
                    const end = ev.endTime ? new Date(ev.endTime) : null;
                    return (
                      <Card
                        key={ev.id}
                        variant="outlined"
                        sx={{ cursor: "pointer" }}
                        onClick={() => openDetail(ev.id)}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={1}
                          >
                            <Stack direction="row" gap={2} alignItems="flex-start">
                              {ev.mainImageUrl ? (
                                <img
                                  src={ev.mainImageUrl}
                                  alt=""
                                  width={72}
                                  height={48}
                                  style={{ objectFit: "cover", borderRadius: 8 }}
                                  onError={(ev2) =>
                                    ((ev2.currentTarget.style.display = "none"))
                                  }
                                />
                              ) : null}
                              <div>
                                <Stack direction="row" gap={1} alignItems="center">
                                  <Typography variant="subtitle1">{ev.name}</Typography>
                                  <Chip
                                    size="small"
                                    label={ev.status ?? "UNKNOWN"}
                                    color={statusColor(ev.status) as any}
                                    variant="outlined"
                                  />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {ev.location ?? "—"} •{" "}
                                  {start ? start.toLocaleString() : "—"} →{" "}
                                  {end ? end.toLocaleString() : "—"}
                                </Typography>
                                <Typography variant="body2">
                                  Seats: {ev.seatsAvailable ?? 0}/{ev.capacity ?? 0}
                                </Typography>
                              </div>
                            </Stack>

                            <Stack
                              direction="row"
                              gap={1}
                              alignItems="center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip title="Open page">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/events/${ev.id}`)}
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit (Organizer)">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/organizer/events/${ev.id}/edit`)
                                  }
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleApprove(ev.id)}
                                disabled={ev.status === "APPROVED"}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => handleReject(ev.id)}
                                disabled={ev.status === "REJECTED"}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </Stack>
            )}

            <Stack direction="row" gap={1} sx={{ mt: 2 }} alignItems="center">
              <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Typography>
                Page {page + 1} / {totalPages}
              </Typography>
              <Button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Drawer chi tiết */}
      <AdminEventDetailDrawer
        open={drawerOpen}
        eventId={selectedId}
        onClose={closeDetail}
        onApproved={async () => {
          enqueueSnackbar("Approve thành công", { variant: "success" });
          await load();
        }}
        onRejected={async () => {
          enqueueSnackbar("Reject thành công", { variant: "warning" });
          await load();
        }}
        navigateToPage={(id) => navigate(`/admin/events/${id}`)}
        navigateToEdit={(id) => navigate(`/organizer/events/${id}/edit`)}
      />
    </Grid>
  );
}
