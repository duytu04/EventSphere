import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function OrganizerRoute({ children }: { children: JSX.Element }) {
  const { token, hasRole } = useAuth();
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return hasRole("ORGANIZER") ? children : <Navigate to="/forbidden" replace />;
}
