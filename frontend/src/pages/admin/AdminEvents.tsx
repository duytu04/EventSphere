import { useEffect, useState } from "react";
import { fetchEvents, createEvent, Event } from "../../api/events";
import { TextField, Button, Grid, Card, CardContent, Typography, Stack } from "@mui/material";

export default function AdminEvents(){
  const [items, setItems] = useState<Event[]>([]);
  const [form, setForm] = useState<Event>({
    name: "", description: "", location: "",
    startTime: new Date().toISOString().slice(0,16),
    endTime: new Date().toISOString().slice(0,16),
    capacity: 100
  });

  const load = async () => setItems(await fetchEvents());
  useEffect(()=>{ load(); }, []);

  const submit = async (e:any) => {
    e.preventDefault();
    const payload = { ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString()
    };
    await createEvent(payload);
    await load();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Create Event</Typography>
            <Stack component="form" gap={2} onSubmit={submit}>
              <TextField label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
              <TextField label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} multiline/>
              <TextField label="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
              <TextField label="Start" type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} required/>
              <TextField label="End" type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} required/>
              <TextField label="Capacity" type="number" value={form.capacity ?? 0} onChange={e=>setForm({...form, capacity:parseInt(e.target.value||"0")})}/>
              <Button variant="contained" type="submit">Create</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Events</Typography>
            <Stack gap={1}>
              {items.map(ev=>(
                <Card key={ev.id}><CardContent>
                  <Typography variant="subtitle1">{ev.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ev.location}  {new Date(ev.startTime).toLocaleString()}  {new Date(ev.endTime).toLocaleString()}
                  </Typography>
                </CardContent></Card>
              ))}
              {items.length===0 && <Typography>No events</Typography>}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
