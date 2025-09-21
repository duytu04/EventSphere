import { Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EventCard({ ev }:{ ev: any }){
  const navigate = useNavigate();
  return (
    <Card variant="outlined" sx={{ cursor:"pointer" }} onClick={()=>navigate(`/events/${ev.id}`)}>
      <CardContent>
        <Typography variant="subtitle1">{ev.name}</Typography>
        <Typography variant="body2" color="text.secondary">{ev.location ?? "—"}</Typography>
      </CardContent>
    </Card>
  );
}
