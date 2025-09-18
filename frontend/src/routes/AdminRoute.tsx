// import { Navigate } from "react-router-dom";
// import { useAuth } from "../features/auth/useAuth";
// export default function AdminRoute({ children }: { children: JSX.Element }) {
//   const { token, hasRole } = useAuth();
//   if (!token) return <Navigate to="/login" replace />;
//   return hasRole("ADMIN") ? children : <Navigate to="/forbidden" replace />;
// }


import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { token, hasRole } = useAuth();
  const loc = useLocation();

  if (!token) {
    // chuyển tới /login và nhớ vị trí cũ
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return hasRole("ADMIN") ? children : <Navigate to="/forbidden" replace />;
}
