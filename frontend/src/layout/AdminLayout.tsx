


import { Outlet, Link, useLocation } from "react-router-dom";
import { Container, Tabs, Tab, Box } from "@mui/material";

export default function AdminLayout(){
  const { pathname } = useLocation();
  // xác định tab theo URL: /admin (dashboard) hoặc /admin/events
  const current = pathname.endsWith("/events") ? "events" : "dashboard";

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Tabs value={current}>
          <Tab value="dashboard" label="Dashboard" component={Link} to="/admin" />
          <Tab value="events"    label="Events"    component={Link} to="/admin/events" />
        </Tabs>
      </Box>

      {/* Đây là nơi render route con được khai báo ở App.tsx */}
      <Outlet/>
    </Container>
  );
}
