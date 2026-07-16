import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const links = (
    <>
      <NavLink to="/concepts" onClick={close}>Concepts</NavLink>
      <NavLink to="/questions" onClick={close}>Q&A</NavLink>
      <NavLink to="/playground" onClick={close}>Playground</NavLink>
      <NavLink to="/react-lab" onClick={close}>React Lab</NavLink>
      <NavLink to="/visualizer" onClick={close}>Visualizer</NavLink>
      <NavLink to="/api" onClick={close}>Free API</NavLink>
      {user && <NavLink to="/interview" onClick={close}>Interview</NavLink>}
      {user && <NavLink to="/quiz" onClick={close}>Quiz</NavLink>}
      {user && <NavLink to="/chat" onClick={close}>AI Coach</NavLink>}
      {user && <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>}
    </>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={close}>
        <Logo size={30} /> Dev<span className="brand-accent">Prep</span>
      </Link>

      {/* desktop links */}
      <div className="nav-links">{links}</div>

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

      {/* mobile slide-down menu */}
      {menuOpen && (
        <div className="nav-mobile">
          {links}
          {user ? (
            <>
              <NavLink to="/profile" onClick={close}>Profile</NavLink>
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
