import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email } });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="auth-card fancy" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3.2rem" }}>🔑</div>
          <h2>Check your inbox</h2>
          <p className="auth-sub" style={{ marginTop: 0 }}>
            If <strong>{email}</strong> is registered, a password reset link is on its way.
            The link expires in 1 hour.
          </p>
          <Link to="/login" className="btn btn-primary btn-block">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card fancy" onSubmit={handleSubmit}>
        <h2>Forgot password? 🤔</h2>
        <p className="auth-sub">Happens to the best of us. Enter your email and we'll send a reset link.</p>
        {error && <div className="alert">{error}</div>}
        <label>
          Email
          <div className="input-wrap">
            <span className="input-icon">✉️</span>
            <input type="email" required placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Sending…" : "Send Reset Link →"}
        </button>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
