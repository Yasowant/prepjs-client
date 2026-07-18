import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const SECTIONS = [
  {
    name: "Learn",
    items: [
      ["📚", "Concepts", "/concepts"],
      ["❓", "Q&A", "/questions"],
      ["🃏", "Flashcards", "/flashcards"],
      ["📝", "Quiz", "/quiz"],
    ],
  },
  {
    name: "Practice",
    items: [
      ["💻", "Playground", "/playground"],
      ["⚛️", "React Lab", "/react-lab"],
      ["⏳", "Visualizer", "/visualizer"],
      ["🎤", "Mock Interview", "/interview"],
    ],
  },
  {
    name: "More",
    items: [
      ["🔌", "Free API", "/api"],
      ["🤖", "AI Coach", "/chat"],
      ["🏆", "Leaderboard", "/leaderboard"],
      ["📊", "Dashboard", "/dashboard"],
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false); // mobile drawer
  const [gamify, setGamify] = useState(null);

  useEffect(() => {
    if (!user) return;
    api("/gamify/me", { auth: true }).then(setGamify).catch(() => {});
  }, [user]);

  // navbar burger (mobile) toggles the drawer
  useEffect(() => {
    const h = () => setOpen((o) => !o);
    window.addEventListener("toggle-sidebar", h);
    return () => window.removeEventListener("toggle-sidebar", h);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      {open && <div className="sb-backdrop" onClick={close} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-top">
          <Link to="/" className="sb-brand" onClick={close} title="DevPrep">
            <Logo size={28} />
            <span className="sb-label">Dev<span className="brand-accent">Prep</span></span>
          </Link>
          <button
            className="sb-collapse-btn"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <button
          className="sb-link sb-search"
          onClick={() => { close(); window.dispatchEvent(new CustomEvent("open-search")); }}
          title="Search (Ctrl+K)"
        >
          <span className="sb-icon">🔍</span>
          <span className="sb-label">Search</span>
          <kbd className="sb-kbd sb-label">Ctrl K</kbd>
        </button>

        <nav className="sb-nav">
          {SECTIONS.map((sec) => (
            <div key={sec.name}>
              <div className="sb-section">{sec.name}</div>
              {sec.items.map(([icon, label, to]) => (
                <NavLink key={to} to={to} className="sb-link" onClick={close} title={label}>
                  <span className="sb-icon">{icon}</span>
                  <span className="sb-label">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-foot">
          {gamify && (
            <Link
              to="/dashboard"
              className="sb-mini"
              onClick={close}
              title={`🔥 ${gamify.streak}-day streak · Level ${gamify.level} · ${gamify.xp} XP`}
            >
              <span className={gamify.streak > 0 ? "" : "sb-flame-off"}>🔥 {gamify.streak}</span>
              <span className="sb-label">⭐ Lv {gamify.level}</span>
            </Link>
          )}
          <NavLink to="/profile" className="sb-link" onClick={close} title="Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="sb-avatar" />
            ) : (
              <span className="sb-icon">👤</span>
            )}
            <span className="sb-label">{user?.name?.split(" ")[0] || "Profile"}</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
