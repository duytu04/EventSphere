import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Stack, TextField, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchPublicEvents, EventResponse } from "../../features/events/eventsApi";

export default function EventsListPage(){
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<EventResponse[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPublicEvents({ q: debouncedQ, page: 0, size: 12 });
        if (mounted) setItems(res.content);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [debouncedQ]);

  return (
    <Stack sx={{ px:2, py:2 }} gap={2}>
      <TextField label="Search events" value={q} onChange={e=>setQ(e.target.value)} size="small" />
      <Grid container spacing={2}>
        {loading && Array.from({length:6}).map((_,i)=>(
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card variant="outlined"><CardContent>
              <Skeleton width="80%"/><Skeleton width="60%"/><Skeleton width="40%"/>
            </CardContent></Card>
          </Grid>
        ))}
        {!loading && items.map(ev=>(
          <Grid item xs={12} sm={6} md={4} key={ev.id}>
            <Card variant="outlined" sx={{ cursor:"pointer", height:"100%" }} onClick={()=>navigate(`/events/${ev.id}`)}>
              <CardContent>
                <Typography variant="subtitle1">{ev.name}</Typography>
                <Typography variant="body2" color="text.secondary">{ev.location ?? "—"}</Typography>
                <Typography variant="body2">
                  {ev.startTime ? new Date(ev.startTime).toLocaleString() : "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!loading && items.length===0 && (
          <Grid item xs={12}><Typography>Không có sự kiện phù hợp.</Typography></Grid>
        )}
      </Grid>
    </Stack>
  );
}
