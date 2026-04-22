import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserInfo } from "../types";

interface AppLayoutProps {
  user: UserInfo;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppLayout({ user, onLogout, children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1 className="brand-title">SNACK MALL</h1>
          <p className="brand-sub">三角色业务工作台</p>
        </div>
        <div className="topbar-meta">
          <span className="role-badge">{user.role === "merchant" ? "商家" : "用户"}</span>
          <span className="username">{user.username}</span>
          <button className="ghost-btn" onClick={onLogout}>
            退出登录
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidenav">
          {user.role === "user" && (
            <>
              <Link className={location.pathname === "/user" ? "nav-link active" : "nav-link"} to="/user">
                商品与下单
              </Link>
              <Link className={location.pathname === "/user/orders" ? "nav-link active" : "nav-link"} to="/user/orders">
                我的订单
              </Link>
            </>
          )}

          {user.role === "merchant" && (
            <Link className={location.pathname === "/merchant" ? "nav-link active" : "nav-link"} to="/merchant">
              商品上传与履约
            </Link>
          )}
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
