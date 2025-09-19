

// // src/pages/admin/AdminEvents.tsx
// import { useEffect, useState } from "react";
// import {
//   fetchAdminEvents,
//   createAdminEvent,
//   approveEvent,
//   rejectEvent,
//   EventResponse,
// } from "../../features/events/eventsApi";
// import {
//   TextField, Button, Grid, Card, CardContent, Typography, Stack, Chip
// } from "@mui/material";

// const toLocalInputValue = (d: Date) => {
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// };

// export default function AdminEvents() {
//   const nowLocal = toLocalInputValue(new Date());

//   const [page, setPage] = useState(0);
//   const [size] = useState(10);
//   const [q, setQ] = useState("");
//   const [status, setStatus] = useState<string | undefined>(undefined);

//   const [items, setItems] = useState<EventResponse[]>([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     category: "GENERAL",
//     location: "",
//     startTime: nowLocal,
//     endTime: nowLocal,
//     capacity: 100,
//   });

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetchAdminEvents({ q, status, page, size });
//       setItems(res.content);
//       setTotalPages(res.totalPages);
//     } catch (e: any) {
//       setError(e?.message ?? "Load admin events failed");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, size, q, status]);

//   const submit = async (e: any) => {
//     e.preventDefault();
//     await createAdminEvent({
//       ...form,
//       // gửi chuẩn LocalDateTime dạng "YYYY-MM-DDTHH:mm" cũng ok
//       startTime: form.startTime,
//       endTime: form.endTime,
//     });
//     setPage(0);
//     await load();
//   };

//   const handleApprove = async (id: number) => {
//     await approveEvent(id);
//     await load();
//   };
//   const handleReject = async (id: number) => {
//     await rejectEvent(id);
//     await load();
//   };

//   return (
//     <Grid container spacing={2}>
//       {/* Form tạo sự kiện */}
//       <Grid item xs={12} md={5}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>Create Event (Admin)</Typography>
//             <Stack component="form" gap={2} onSubmit={submit}>
//               <TextField label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
//               <TextField label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} multiline/>
//               <TextField label="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}/>
//               <TextField label="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
//               <TextField label="Start" type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} required/>
//               <TextField label="End" type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} required/>
//               <TextField label="Capacity" type="number" value={form.capacity} onChange={e=>setForm({...form, capacity: parseInt(e.target.value||"0",10)})}/>
//               <Button variant="contained" type="submit">Create</Button>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Grid>

//       {/* Danh sách + hành động */}
//       <Grid item xs={12} md={7}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>All Events (Admin)</Typography>

//             <Stack direction="row" gap={1} sx={{ mb: 2 }}>
//               <TextField size="small" label="Search" value={q} onChange={e=>{ setPage(0); setQ(e.target.value); }}/>
//               <TextField size="small" label="Status (optional)" value={status ?? ""} placeholder="APPROVED / PENDING_APPROVAL / REJECTED"
//                          onChange={e=>{ setPage(0); setStatus(e.target.value || undefined); }}/>
//             </Stack>

//             {loading && <Typography>Đang tải...</Typography>}
//             {error && <Typography color="error">{error}</Typography>}

//             <Stack gap={1}>
//               {items.map(ev => {
//                 const start = ev.startTime ? new Date(ev.startTime) : null;
//                 const end = ev.endTime ? new Date(ev.endTime) : null;
//                 return (
//                   <Card key={ev.id} variant="outlined">
//                     <CardContent>
//                       <Stack direction="row" justifyContent="space-between" alignItems="center">
//                         <div>
//                           <Typography variant="subtitle1">{ev.name}</Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {ev.location ?? "—"} • {start ? start.toLocaleString() : "—"} → {end ? end.toLocaleString() : "—"}
//                           </Typography>
//                           <Typography variant="body2">Seats: {ev.seatsAvailable ?? 0}/{ev.capacity ?? 0}</Typography>
//                         </div>
//                         <Stack direction="row" gap={1} alignItems="center">
//                           <Chip label={ev.status ?? "UNKNOWN"} />
//                           <Button size="small" variant="outlined" onClick={()=>handleApprove(ev.id)} disabled={ev.status==="APPROVED"}>Approve</Button>
//                           <Button size="small" variant="outlined" color="warning" onClick={()=>handleReject(ev.id)} disabled={ev.status==="REJECTED"}>Reject</Button>
//                         </Stack>
//                       </Stack>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//               {!loading && !error && items.length===0 && <Typography>No events</Typography>}
//             </Stack>

//             <Stack direction="row" gap={1} sx={{ mt: 2 }}>
//               <Button disabled={page<=0} onClick={()=>setPage(p=>p-1)}>Prev</Button>
//               <Typography>Page {page+1} / {totalPages}</Typography>
//               <Button disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// }

// src/pages/admin/AdminEvents.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import AdminEventDetailDrawer from "./AdminEventDetailDrawer";

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
      };
      await createAdminEvent(payload);
      setInfo("Tạo sự kiện thành công.");
      setPage(0);
      await load();
      setForm((old) => ({ ...old, name: "", description: "" }));
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
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Approve thất bại");
    }
  };

  const handleReject = async (id: number) => {
    setError(null);
    try {
      await rejectEvent(id);
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
                required
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                multiline
              />
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
                {items.map((ev) => {
                  const start = ev.startTime ? new Date(ev.startTime) : null;
                  const end = ev.endTime ? new Date(ev.endTime) : null;
                  return (
                    <Card
                      key={ev.id}
                      variant="outlined"
                      sx={{ cursor: "pointer" }}
                      onClick={() => openDetail(ev.id)} // 👈 mở Drawer chi tiết
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={1}
                        >
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

                          <Stack
                            direction="row"
                            gap={1}
                            alignItems="center"
                            onClick={(e) => e.stopPropagation()} // không mở Drawer khi bấm nút
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
                })}
                {items.length === 0 && <Typography>No events</Typography>}
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
          await load();
        }}
        onRejected={async () => {
          await load();
        }}
        navigateToPage={(id) => navigate(`/admin/events/${id}`)}
        navigateToEdit={(id) => navigate(`/organizer/events/${id}/edit`)}
      />
    </Grid>
  );
}
