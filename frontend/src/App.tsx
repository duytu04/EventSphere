import { Box, CssBaseline } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import EventsListPage from "./pages/events/EventsListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import AdminRoute from "./routes/AdminRoute";
import OrganizerRoute from "./routes/OrganizerRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import OrganizerLayout from "./layout/OrganizerLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import ParticipantLayout from "./layout/ParticipantLayout";
import MyRegistrations from "./pages/dashboard/MyRegistrations";
import MyCertificates from "./pages/dashboard/MyCertificates";
import MyMedia from "./pages/dashboard/MyMedia";
import ParticipantDashboard from "./pages/dashboard/ParticipantDashboard";
import EventsManage from "./pages/organizer/EventsManage";
import EventEditor from "./pages/organizer/EventEditor";
import AttendanceScan from "./pages/organizer/AttendanceScan";
import ColorModeProvider from "./theme/theme";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

export default function App() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/admin") || location.pathname.startsWith("/organizer") || location.pathname.startsWith("/dashboard");

  return (
    <ColorModeProvider>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "background.default" }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forbidden" element={<ForbiddenPage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route
              path="admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="organizers" element={<AdminOrganizers />} />
            </Route>
            <Route
              path="dashboard/*"
              element={
                <ProtectedRoute>
                  <ParticipantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MyRegistrations />} />
              <Route path="registrations" element={<MyRegistrations />} />
              <Route path="events/:id" element={<ParticipantDashboard />} />
              <Route path="certificates" element={<MyCertificates />} />
              <Route path="media" element={<MyMedia />} />
            </Route>
            <Route
              path="organizer/*"
              element={
                <OrganizerRoute>
                  <OrganizerLayout />
                </OrganizerRoute>
              }
            >
              <Route index element={<OrganizerDashboard />} />
              <Route path="events" element={<EventsManage />} />
              <Route path="events/new" element={<EventEditor />} />
              <Route path="events/:id/edit" element={<EventEditor />} />
              <Route path="attendance" element={<AttendanceScan />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        {!hideFooter && <Footer />}
      </Box>
    </ColorModeProvider>
  );
}





