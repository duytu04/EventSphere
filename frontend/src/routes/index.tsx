import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import AdminLayout from "../layout/AdminLayout";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AppRoutes(){
  return (
    <Routes>
      <Route element={<PublicLayout/>}>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/forbidden" element={<ForbiddenPage/>}/>
      </Route>
      <Route path="/admin" element={
        <ProtectedRoute><AdminRoute><AdminLayout/></AdminRoute></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard/>}/>
      </Route>
      <Route path="*" element={<div style={{padding:24}}>404</div>} />
    </Routes>
  );
}
