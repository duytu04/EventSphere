



// // src/pages/admin/AdminEvents.tsx
// import { useEffect, useState } from "react";
// import { fetchEvents, createEvent, Event } from "../../api/events";
// import { TextField, Button, Grid, Card, CardContent, Typography, Stack } from "@mui/material";

// // Hiển thị cho input type="datetime-local": 'YYYY-MM-DDTHH:mm'
// const toLocalInputValue = (d: Date) => {
//   const pad = (n: number) => String(n).padStart(2, "0");
//   const y = d.getFullYear();
//   const m = pad(d.getMonth() + 1);
//   const day = pad(d.getDate());
//   const h = pad(d.getHours());
//   const min = pad(d.getMinutes());
//   return `${y}-${m}-${day}T${h}:${min}`;
// };

// export default function AdminEvents(){
//   const nowLocal = toLocalInputValue(new Date());

//   const [items, setItems] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [form, setForm] = useState<Partial<Event>>({
//     name: "",
//     description: "",
//     location: "",
//     startTime: nowLocal,
//     endTime: nowLocal,
//     capacity: 100
//   });

//   const load = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await fetchEvents();
//       setItems(Array.isArray(data) ? data : []);
//     } catch (e: any) {
//       setError(e?.message ?? "Load events failed");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(()=>{ load(); }, []);

//   const submit = async (e:any) => {
//     e.preventDefault();
//     const payload: Event = {
//       name: form.name ?? "",
//       description: form.description ?? "",
//       location: form.location ?? "",
//       startTime: new Date(form.startTime as string).toISOString(),
//       endTime: new Date(form.endTime as string).toISOString(),
//       capacity: Number.isFinite(form.capacity as number) ? Number(form.capacity) : 0
//     };
//     await createEvent(payload);
//     await load();
//   };

//   const list: Event[] = Array.isArray(items) ? items : [];

//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12} md={5}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>Create Event</Typography>
//             <Stack component="form" gap={2} onSubmit={submit}>
//               <TextField
//                 label="Name"
//                 value={form.name ?? ""}
//                 onChange={e=>setForm({...form, name:e.target.value})}
//                 required
//               />
//               <TextField
//                 label="Description"
//                 value={form.description ?? ""}
//                 onChange={e=>setForm({...form, description:e.target.value})}
//                 multiline
//               />
//               <TextField
//                 label="Location"
//                 value={form.location ?? ""}
//                 onChange={e=>setForm({...form, location:e.target.value})}
//               />
//               <TextField
//                 label="Start"
//                 type="datetime-local"
//                 value={(form.startTime as string) ?? nowLocal}
//                 onChange={e=>setForm({...form, startTime:e.target.value})}
//                 required
//               />
//               <TextField
//                 label="End"
//                 type="datetime-local"
//                 value={(form.endTime as string) ?? nowLocal}
//                 onChange={e=>setForm({...form, endTime:e.target.value})}
//                 required
//               />
//               <TextField
//                 label="Capacity"
//                 type="number"
//                 value={form.capacity ?? 0}
//                 onChange={e=>setForm({...form, capacity: parseInt(e.target.value || "0", 10)})}
//               />
//               <Button variant="contained" type="submit">Create</Button>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} md={7}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>Events</Typography>

//             {loading && <Typography>Đang tải...</Typography>}
//             {error && <Typography color="error">{error}</Typography>}

//             <Stack gap={1}>
//               {list.map((ev) => {
//                 const key = (ev as any).id ?? (ev as any).eventId ?? ev.name;
//                 const start = ev.startTime ? new Date(ev.startTime) : null;
//                 const end = ev.endTime ? new Date(ev.endTime) : null;
//                 return (
//                   <Card key={String(key)} variant="outlined">
//                     <CardContent>
//                       <Typography variant="subtitle1">{ev.name}</Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {ev.location ?? "—"}{"  "}
//                         {start ? start.toLocaleString() : "—"}{"  "}
//                         {end ? end.toLocaleString() : "—"}
//                       </Typography>
//                     </CardContent>
//                   </Card>
//                 );
//               })}

//               {!loading && !error && list.length === 0 && (
//                 <Typography>No events</Typography>
//               )}
//             </Stack>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// }



// src/pages/admin/AdminEvents.tsx
import { useEffect, useState } from "react";
import {
  fetchAdminEvents,
  createAdminEvent,
  approveEvent,
  rejectEvent,
  EventResponse,
} from "../../api/events";
import {
  TextField, Button, Grid, Card, CardContent, Typography, Stack, Chip
} from "@mui/material";

const toLocalInputValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AdminEvents() {
  const nowLocal = toLocalInputValue(new Date());

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const [items, setItems] = useState<EventResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "GENERAL",
    location: "",
    startTime: nowLocal,
    endTime: nowLocal,
    capacity: 100,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminEvents({ q, status, page, size });
      setItems(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Load admin events failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, size, q, status]);

  const submit = async (e: any) => {
    e.preventDefault();
    await createAdminEvent({
      ...form,
      // gửi chuẩn LocalDateTime dạng "YYYY-MM-DDTHH:mm" cũng ok
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setPage(0);
    await load();
  };

  const handleApprove = async (id: number) => {
    await approveEvent(id);
    await load();
  };
  const handleReject = async (id: number) => {
    await rejectEvent(id);
    await load();
  };

  return (
    <Grid container spacing={2}>
      {/* Form tạo sự kiện */}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Create Event (Admin)</Typography>
            <Stack component="form" gap={2} onSubmit={submit}>
              <TextField label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
              <TextField label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} multiline/>
              <TextField label="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}/>
              <TextField label="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
              <TextField label="Start" type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} required/>
              <TextField label="End" type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} required/>
              <TextField label="Capacity" type="number" value={form.capacity} onChange={e=>setForm({...form, capacity: parseInt(e.target.value||"0",10)})}/>
              <Button variant="contained" type="submit">Create</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Danh sách + hành động */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Events (Admin)</Typography>

            <Stack direction="row" gap={1} sx={{ mb: 2 }}>
              <TextField size="small" label="Search" value={q} onChange={e=>{ setPage(0); setQ(e.target.value); }}/>
              <TextField size="small" label="Status (optional)" value={status ?? ""} placeholder="APPROVED / PENDING_APPROVAL / REJECTED"
                         onChange={e=>{ setPage(0); setStatus(e.target.value || undefined); }}/>
            </Stack>

            {loading && <Typography>Đang tải...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            <Stack gap={1}>
              {items.map(ev => {
                const start = ev.startTime ? new Date(ev.startTime) : null;
                const end = ev.endTime ? new Date(ev.endTime) : null;
                return (
                  <Card key={ev.id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <div>
                          <Typography variant="subtitle1">{ev.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ev.location ?? "—"} • {start ? start.toLocaleString() : "—"} → {end ? end.toLocaleString() : "—"}
                          </Typography>
                          <Typography variant="body2">Seats: {ev.seatsAvailable ?? 0}/{ev.capacity ?? 0}</Typography>
                        </div>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Chip label={ev.status ?? "UNKNOWN"} />
                          <Button size="small" variant="outlined" onClick={()=>handleApprove(ev.id)} disabled={ev.status==="APPROVED"}>Approve</Button>
                          <Button size="small" variant="outlined" color="warning" onClick={()=>handleReject(ev.id)} disabled={ev.status==="REJECTED"}>Reject</Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
              {!loading && !error && items.length===0 && <Typography>No events</Typography>}
            </Stack>

            <Stack direction="row" gap={1} sx={{ mt: 2 }}>
              <Button disabled={page<=0} onClick={()=>setPage(p=>p-1)}>Prev</Button>
              <Typography>Page {page+1} / {totalPages}</Typography>
              <Button disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
