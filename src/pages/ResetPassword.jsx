import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    setBusy(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: { token, password: form.password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-card fancy" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3.2rem" }}>😕</div>
          <h2>Invalid link</h2>
          <p className="auth-sub" style={{ marginTop: 0 }}>No reset token found. Request a new link.</p>
          <Link to="/forgot" className="btn btn-primary btn-block">Request Reset Link</Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="auth-card fancy" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3.2rem" }}>🎉</div>
          <h2>Password updated!</h2>
          <p className="auth-sub" style={{ marginTop: 0 }}>Log in with your new password and get back to prepping.</p>
          <Link to="/login" className="btn btn-primary btn-block">Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card fancy" onSubmit={handleSubmit}>
        <h2>Choose a new password 🔐</h2>
        <p className="auth-sub">Make it at least 6 characters — longer is stronger.</p>
        {error && <div className="alert">{error}</div>}
        <label>
          New password
          <div className="input-wrap">
            <span className="input-icon">🔑</span>
            <input type={showPass ? "text" : "password"} required minLength={6}
              placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </label>
        <label>
          Confirm password
          <div className="input-wrap">
            <span className="input-icon">🔁</span>
            <input type={showPass ? "text" : "password"} required minLength={6}
              placeholder="••••••••" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Updating…" : "Update Password →"}
        </button>
      </form>
    </AuthLayout>
  );
}
