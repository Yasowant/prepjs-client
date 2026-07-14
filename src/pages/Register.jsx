import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const strength =
    form.password.length >= 10 ? "strong" : form.password.length >= 6 ? "okay" : "weak";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setBusy(true);
    try {
      await api("/auth/register", { method: "POST", body: form });
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
          <div style={{ fontSize: "3.2rem" }}>📬</div>
          <h2>Check your inbox!</h2>
          <p className="auth-sub" style={{ marginTop: 0 }}>
            We sent a verification link to <strong>{form.email}</strong>.<br />
            Click it, then log in and everything unlocks. ⚡
          </p>
          <Link to="/login" className="btn btn-primary btn-block">Go to Login</Link>
          <p className="auth-switch">Didn't get it? Check spam, or resend from the login page.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card fancy" onSubmit={handleSubmit}>
        <h2>Create your account 🚀</h2>
        <p className="auth-sub">Free forever — unlock all concepts, quizzes & the AI coach.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Name
          <div className="input-wrap">
            <span className="input-icon">👤</span>
            <input required placeholder="Your name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        </label>

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
            <input type={showPass ? "text" : "password"} required minLength={6}
              placeholder="min. 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {form.password && (
            <div className={`pass-strength ${strength}`}>
              <div className="pass-bar" />
              <span>{strength === "strong" ? "Strong 💪" : strength === "okay" ? "Okay 👍" : "Too short"}</span>
            </div>
          )}
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating…" : "Create Free Account →"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
