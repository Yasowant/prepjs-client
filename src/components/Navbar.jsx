import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function Dropdown({ label, paths, children }) {
  const location = useLocation();
  const active = paths.some((p) => location.pathname.startsWith(p));
  return (
    <div className={`nav-drop ${active ? "active" : ""}`}>
      <button className="nav-drop-btn" type="button">
        {label} <span className="nav-caret">▾</span>
      </button>
      <div className="nav-drop-menu">{children}</div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={close}>
        <Logo size={30} /> Dev<span className="brand-accent">Prep</span>
      </Link>

      {/* desktop links — grouped */}
      <div className="nav-links">
        <Dropdown label="Learn" paths={["/concepts", "/questions", "/quiz"]}>
          <NavLink to="/concepts">📚 Concepts</NavLink>
          <NavLink to="/questions">❓ Interview Q&A</NavLink>
          {user && <NavLink to="/quiz">📝 Quiz</NavLink>}
        </Dropdown>
        <Dropdown label="Practice" paths={["/playground", "/react-lab", "/visualizer", "/interview"]}>
          <NavLink to="/playground">💻 Playground</NavLink>
          <NavLink to="/react-lab">⚛️ React Lab</NavLink>
          <NavLink to="/visualizer">⏳ Visualizer</NavLink>
          {user && <NavLink to="/interview">🎤 Mock Interview</NavLink>}
        </Dropdown>
        <NavLink to="/api">Free API</NavLink>
        {user && <NavLink to="/chat">AI Coach</NavLink>}
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </div>

      <div className="nav-auth">
        <button
          className="nav-search-btn"
          title="Search (Ctrl+K)"
          onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
        >
          🔍 <kbd>Ctrl K</kbd>
        </button>
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/profile" className="nav-user-link" title="Your profile" onClick={close}>
              {user.avatar ? (
                <img src={user.avatar} alt="" className="nav-avatar nav-avatar-img" />
              ) : (
                <span className="nav-avatar">{user.name[0].toUpperCase()}</span>
              )}
              <span className="nav-user">{user.name.split(" ")[0]}</span>
            </Link>
            <button className="btn btn-ghost nav-logout" onClick={() => { logout(); close(); navigate("/"); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost nav-login" onClick={close}>Login</Link>
            <Link to="/register" className="btn btn-primary nav-register" onClick={close}>Get Started</Link>
          </>
        )}
        {/* burger — mobile only */}
        <button
          className="nav-burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile slide-down menu — flat list */}
      {menuOpen && (
        <div className="nav-mobile">
          <span className="nav-mobile-group">Learn</span>
          <NavLink to="/concepts" onClick={close}>📚 Concepts</NavLink>
          <NavLink to="/questions" onClick={close}>❓ Interview Q&A</NavLink>
          {user && <NavLink to="/quiz" onClick={close}>📝 Quiz</NavLink>}
          <span className="nav-mobile-group">Practice</span>
          <NavLink to="/playground" onClick={close}>💻 Playground</NavLink>
          <NavLink to="/react-lab" onClick={close}>⚛️ React Lab</NavLink>
          <NavLink to="/visualizer" onClick={close}>⏳ Visualizer</NavLink>
          {user && <NavLink to="/interview" onClick={close}>🎤 Mock Interview</NavLink>}
          <span className="nav-mobile-group">More</span>
          <NavLink to="/api" onClick={close}>🔌 Free API</NavLink>
          {user && <NavLink to="/chat" onClick={close}>🤖 AI Coach</NavLink>}
          {user && <NavLink to="/dashboard" onClick={close}>📊 Dashboard</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile" onClick={close}>👤 Profile</NavLink>
              <button className="btn btn-outline" onClick={() => { logout(); close(); navigate("/"); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-primary" onClick={close}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
