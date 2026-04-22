import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import type { RegisterPayload } from "../api/auth";

const initialForm: RegisterPayload = {
  username: "",
  password: "",
  confirmPassword: "",
  tel: "",
  email: "",
  role: "user"
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateForm<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await authApi.register({
        ...form,
        tel: form.tel || undefined,
        email: form.email || undefined
      });
      window.alert("注册成功，请登录");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-stage">
      <div className="auth-frame">
        <section className="auth-showcase" aria-labelledby="register-showcase-title">
          <p className="auth-kicker">SUPERMARKS</p>
          <h1 id="register-showcase-title" className="auth-display">
            开一间线上零食铺
          </h1>
          <p className="auth-lede">从下单到履约，用户和商家都从同一个门头进入，系统会按身份分流。</p>

          <div className="auth-role-grid" aria-label="可注册身份">
            <div className={form.role === "user" ? "auth-role-card active" : "auth-role-card"}>
              <span>USER</span>
              <strong>普通用户</strong>
              <p>浏览零食、提交订单、追踪状态。</p>
            </div>
            <div className={form.role === "merchant" ? "auth-role-card active" : "auth-role-card"}>
              <span>MERCHANT</span>
              <strong>商家账号</strong>
              <p>上传商品、查看订单、处理履约。</p>
            </div>
          </div>

          <div className="auth-shelf" aria-label="开户注册步骤">
            <span>选择身份</span>
            <span>填写资料</span>
            <span>进入门店</span>
          </div>
        </section>

        <section className="auth-panel" aria-labelledby="register-form-title">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <p className="kicker">CREATE ACCOUNT</p>
              <h2 id="register-form-title">开通新账号</h2>
              <p className="muted">选择你的入口身份，再补充基础资料。</p>
            </div>

            <div className="auth-select-block">
              <label className="field-label" htmlFor="role">
                身份
              </label>
              <select id="role" className="input" value={form.role} onChange={(e) => updateForm("role", e.target.value as "user" | "merchant")}>
                <option value="user">用户</option>
                <option value="merchant">商家</option>
              </select>
            </div>

            <label className="field-label" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              className="input"
              value={form.username}
              onChange={(e) => updateForm("username", e.target.value)}
              required
            />

            <label className="field-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              required
            />

            <label className="field-label" htmlFor="confirmPassword">
              确认密码
            </label>
            <input
              id="confirmPassword"
              className="input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateForm("confirmPassword", e.target.value)}
              required
            />

            <label className="field-label" htmlFor="tel">
              手机号（可选）
            </label>
            <input id="tel" className="input" value={form.tel} onChange={(e) => updateForm("tel", e.target.value)} />

            <label className="field-label" htmlFor="email">
              邮箱（可选）
            </label>
            <input id="email" className="input" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />

            {error ? <p className="error-text auth-error">{error}</p> : null}

            <button className="primary-btn auth-submit" type="submit" disabled={submitting}>
              {submitting ? "提交中..." : "注册"}
            </button>

            <p className="auth-footer">
              已有账号？ <Link to="/login">返回登录</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
