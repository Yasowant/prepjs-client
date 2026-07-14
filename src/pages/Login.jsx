import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotVerified(false);
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      if (err.code === "EMAIL_NOT_VERIFIED" || err.message.toLowerCase().includes("verify"))
        setNotVerified(true);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResent(false);
    await api("/auth/resend-verification", { method: "POST", body: { email: form.email } });
    setResent(true);
  }

  return (
    <AuthLayout>
      <form className="auth-card fancy" onSubmit={handleSubmit}>
        <h2>Welcome back 👋</h2>
        <p className="auth-sub">Your concepts, streaks and AI coach are waiting.</p>

        {error && <div className="alert">{error}</div>}
        {notVerified && (
          <button type="button" className="btn btn-outline" onClick={resend}>
            📧 Resend verification email
          </button>
        )}
        {resent && <div className="alert success">Verification email sent — check your inbox!</div>}

        <label>
          Email
          <div className="input-wrap">
            <span className="input-icon">✉️</span>
            <input type="email" required placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </label>

        <label>
          Password
          <div className="input-wrap">
            <span className="input-icon">🔑</span>
            <input type={showPass ? "text" : "password"} required placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Logging in…" : "Login →"}
        </button>

        <p className="auth-switch">
          <Link to="/forgot">Forgot password?</Link>
        </p>
        <p className="auth-switch">
          New here? <Link to="/register">Create a free account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
