import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function AdminDashboard(){
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Card><CardContent><Typography variant="h6">Users</Typography><Typography></Typography></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent><Typography variant="h6">Events</Typography><Typography></Typography></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent><Typography variant="h6">Registrations</Typography><Typography></Typography></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent><Typography variant="h6">Attendance</Typography><Typography></Typography></CardContent></Card>
      </Grid>
    </Grid>
  );
}
