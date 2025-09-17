import { Outlet, Routes, Route, Link, Navigate } from "react-router-dom";
import { Container, Tabs, Tab, Box } from "@mui/material";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AdminLayout(){
  return (
    <Container sx={{py:3}}>
      <Box sx={{mb:2}}>
        <Tabs value={0}>
          <Tab label="Dashboard" component={Link} to="." />
        </Tabs>
      </Box>
      <Routes>
        <Route index element={<AdminDashboard/>} />
        <Route path="*" element={<Navigate to="." replace/>} />
      </Routes>
      <Outlet/>
    </Container>
  );
}
