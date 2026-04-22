import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { authApi } from "./api/auth";
import { clearAuth, getToken, getUser, saveAuth } from "./auth/authStore";
import type { AuthPayload, UserInfo } from "./types";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserHomePage from "./pages/UserHomePage";
import UserOrdersPage from "./pages/UserOrdersPage";
import MerchantDashboard from "./pages/MerchantDashboard";

function resolveHome(user: UserInfo | null): string {
  if (!user) return "/login";
  if (user.role === "merchant") return "/merchant";
  if (user.role === "user") return "/user";
  return "/admin-hint";
}

function AdminHint() {
  return (
    <div className="auth-card">
      <h2>管理员入口说明</h2>
      <p>管理员请使用 react-oa 管理端处理订单追踪与退款审核。</p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>(() => getToken());
  const [user, setUser] = useState<UserInfo | null>(() => getUser());
  const [checking, setChecking] = useState<boolean>(Boolean(getToken()));

  useEffect(() => {
    async function bootstrapAuth() {
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const current = await authApi.checkLogin();
        setUser(current);
      } catch {
        clearAuth();
        setToken("");
        setUser(null);
      } finally {
        setChecking(false);
      }
    }

    bootstrapAuth();
  }, [token]);

  const homePath = useMemo(() => resolveHome(user), [user]);

  const handleLogin = (payload: AuthPayload) => {
    saveAuth(payload);
    setToken(payload.token);
    setUser(payload.userInfo);
    navigate(resolveHome(payload.userInfo));
  };

  const handleLogout = () => {
    clearAuth();
    setToken("");
    setUser(null);
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="center-screen">
        <div className="loader">正在校验登录状态...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/user"
        element={
          <ProtectedRoute user={user} allowRoles={["user"]}>
            <AppLayout user={user as UserInfo} onLogout={handleLogout}>
              <UserHomePage user={user as UserInfo} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/orders"
        element={
          <ProtectedRoute user={user} allowRoles={["user"]}>
            <AppLayout user={user as UserInfo} onLogout={handleLogout}>
              <UserOrdersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/merchant"
        element={
          <ProtectedRoute user={user} allowRoles={["merchant"]}>
            <AppLayout user={user as UserInfo} onLogout={handleLogout}>
              <MerchantDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/admin-hint" element={<AdminHint />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
