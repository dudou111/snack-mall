import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserInfo, UserRole } from "../types";

interface ProtectedRouteProps {
  user: UserInfo | null;
  allowRoles: UserRole[];
  children: ReactNode;
}

export default function ProtectedRoute({ user, allowRoles, children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
