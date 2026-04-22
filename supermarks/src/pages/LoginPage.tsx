import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";
import type { AuthPayload } from "../types";

interface LoginPageProps {
  onLoginSuccess: (payload: AuthPayload) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectHint = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await authApi.login({ username, password });
      onLoginSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-stage">
      <div className="auth-frame">
        <section className="auth-showcase" aria-labelledby="login-showcase-title">
          <p className="auth-kicker">SUPERMARKS</p>
          <h1 id="login-showcase-title" className="auth-display">
            零食补给站
          </h1>
          <p className="auth-lede">一个入口，自动识别用户与商家身份，把购物、上架和履约带回同一条动线。</p>

          <div className="auth-shelf" aria-label="平台能力">
            <span>用户选购</span>
            <span>商家履约</span>
            <span>订单同步</span>
          </div>

          <div className="auth-window-card">
            <span className="auth-price-tag">OPEN</span>
            <div>
              <strong>24H Snack Mall</strong>
              <p>登录后按角色进入对应工作台。</p>
            </div>
          </div>

          {redirectHint ? (
            <p className="auth-notice">你需要先登录才能访问：{redirectHint}</p>
          ) : null}
        </section>

        <section className="auth-panel" aria-labelledby="login-form-title">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <p className="kicker">MEMBER GATE</p>
              <h2 id="login-form-title">进入工作台</h2>
              <p className="muted">输入账号密码，系统会为你打开正确的入口。</p>
            </div>

            <label className="field-label" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              required
            />

            <label className="field-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              required
            />

            {error ? <p className="error-text auth-error">{error}</p> : null}

            <button disabled={submitting} className="primary-btn auth-submit" type="submit">
              {submitting ? "登录中..." : "登录"}
            </button>

            <p className="auth-footer">
              没有账号？ <Link to="/register">去注册</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
