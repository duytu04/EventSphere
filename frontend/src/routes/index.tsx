import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import AdminLayout from "../layout/AdminLayout";
import HomePage from "../pages/home/HomePage";
import AboutPage from "../pages/about/AboutPage";
import EventsListPage from "../pages/events/EventsListPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import OrganizerRoute from "./OrganizerRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TestAdminUsers from "../pages/admin/TestAdminUsers";
import EventEditRequests from "../pages/admin/EventEditRequests";
import EventEditRequestDemo from "../pages/organizer/EventEditRequestDemo";

export default function AppRoutes(){
  return (
    <Routes>
      <Route element={<PublicLayout/>}>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/events" element={<EventsListPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/forbidden" element={<ForbiddenPage/>}/>
      </Route>
      <Route path="/admin" element={
        <ProtectedRoute><AdminRoute><AdminLayout/></AdminRoute></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard/>}/>
        <Route path="test-users" element={<TestAdminUsers/>}/>
        <Route path="edit-requests" element={<EventEditRequests/>}/>
      </Route>
      <Route path="/organizer/events/:id/edit-request" element={
        <ProtectedRoute><OrganizerRoute><EventEditRequestDemo/></OrganizerRoute></ProtectedRoute>
      }/>
      <Route path="*" element={<div style={{padding:24}}>404</div>} />
    </Routes>
  );
}
