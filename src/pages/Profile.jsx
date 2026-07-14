import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizCount, setQuizCount] = useState(0);

  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState(null);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/auth/me", { auth: true }).then((d) => {
      setMe(d.user);
      setName(d.user.name);
    }).catch(() => {});
    api("/progress", { auth: true }).then((d) => setStats(d.stats)).catch(() => {});
    api("/quiz/results/history", { auth: true }).then((h) => setQuizCount(h.length)).catch(() => {});
  }, []);

  async function saveName(e) {
    e.preventDefault();
    setNameMsg(null);
    try {
      const d = await api("/auth/me", { method: "PATCH", auth: true, body: { name } });
      updateUser({ name: d.user.name });
      setNameMsg({ ok: true, text: "Name updated ✓" });
    } catch (err) {
      setNameMsg({ ok: false, text: err.message });
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next.length < 6) return setPwMsg({ ok: false, text: "New password must be at least 6 characters" });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: "Passwords don't match" });
    setBusy(true);
    try {
      const d = await api("/auth/change-password", {
        method: "POST", auth: true,
        body: { currentPassword: pw.current, newPassword: pw.next },
      });
      setPwMsg({ ok: true, text: d.message });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const joined = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "—";

  return (
    <div className="page profile-page">
      <h1>Profile</h1>
      <p className="page-sub">Manage your account and see your journey.</p>

      {/* identity card */}
      <div className="profile-card">
        <div className="profile-avatar">{(user?.name?.[0] || "?").toUpperCase()}</div>
        <div className="profile-id">
          <h2>{user?.name}</h2>
          <span>{user?.email}</span>
          <span className="profile-joined">🗓 Member since {joined}</span>
        </div>
        <div className="profile-mini-stats">
          <div><strong>{stats ? `${stats.percent}%` : "—"}</strong><span>completed</span></div>
          <div><strong>{stats?.completed ?? "—"}</strong><span>concepts</span></div>
          <div><strong>{quizCount}</strong><span>quizzes</span></div>
        </div>
      </div>

      <div className="profile-grid">
        {/* edit name */}
        <form className="profile-section" onSubmit={saveName}>
          <h3>✏️ Display name</h3>
          {nameMsg && <div className={`alert ${nameMsg.ok ? "success" : ""}`}>{nameMsg.text}</div>}
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
          </label>
          <button className="btn btn-primary" disabled={name === user?.name}>Save name</button>
        </form>

        {/* change password */}
        <form className="profile-section" onSubmit={changePassword}>
          <h3>🔐 Change password</h3>
          {pwMsg && <div className={`alert ${pwMsg.ok ? "success" : ""}`}>{pwMsg.text}</div>}
          <label>
            Current password
            <input type="password" required value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </label>
          <label>
            New password
            <input type="password" required minLength={6} value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </label>
          <label>
            Confirm new password
            <input type="password" required minLength={6} value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Updating…" : "Change password"}
          </button>
        </form>
      </div>

      <div className="profile-links">
        <Link to="/dashboard" className="btn btn-outline">📊 Dashboard</Link>
        <Link to="/concepts" className="btn btn-outline">📚 Continue learning</Link>
      </div>
    </div>
  );
}
