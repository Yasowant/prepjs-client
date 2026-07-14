import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

// crop-to-square + resize in the browser so uploads are tiny (~40KB)
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = URL.createObjectURL(file);
  });
}

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

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null);

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setAvatarMsg(null);
    if (!file.type.startsWith("image/"))
      return setAvatarMsg({ ok: false, text: "Please choose an image file (JPG/PNG)" });
    if (file.size > 8 * 1024 * 1024)
      return setAvatarMsg({ ok: false, text: "Image is too large (max 8MB)" });

    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      const d = await api("/auth/avatar", { method: "POST", auth: true, body: { image: dataUrl } });
      updateUser({ avatar: d.user.avatar });
      setAvatarMsg({ ok: true, text: "Photo updated ✓" });
    } catch (err) {
      setAvatarMsg({ ok: false, text: err.message });
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!confirm("Remove your profile photo?")) return;
    setUploading(true);
    try {
      await api("/auth/avatar", { method: "DELETE", auth: true });
      updateUser({ avatar: null });
      setAvatarMsg({ ok: true, text: "Photo removed" });
    } catch (err) {
      setAvatarMsg({ ok: false, text: err.message });
    } finally {
      setUploading(false);
    }
  }

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
        <div className="profile-avatar-wrap">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="profile-avatar profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{(user?.name?.[0] || "?").toUpperCase()}</div>
          )}
          <button
            className="avatar-edit"
            title="Change photo"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "⏳" : "📷"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onPickPhoto}
          />
        </div>
        <div className="profile-id">
          <h2>{user?.name}</h2>
          <span>{user?.email}</span>
          <span className="profile-joined">🗓 Member since {joined}</span>
          <div className="avatar-actions">
            <button className="avatar-link" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : user?.avatar ? "Change photo" : "Upload photo"}
            </button>
            {user?.avatar && (
              <button className="avatar-link danger" onClick={removePhoto} disabled={uploading}>
                Remove
              </button>
            )}
          </div>
          {avatarMsg && (
            <span className={`avatar-msg ${avatarMsg.ok ? "ok" : "bad"}`}>{avatarMsg.text}</span>
          )}
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
