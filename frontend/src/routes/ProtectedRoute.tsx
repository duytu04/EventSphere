import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth(); const loc = useLocation();
  return token ? children : <Navigate to="/login" replace state={{ from: loc }} />;
}
