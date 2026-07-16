import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <Logo size={30} /> Dev<span className="brand-accent">Prep</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/concepts">Concepts</NavLink>
        <NavLink to="/questions">Q&A</NavLink>
        <NavLink to="/playground">Playground</NavLink>
        <NavLink to="/react-lab">React Lab</NavLink>
        <NavLink to="/visualizer">Visualizer</NavLink>
        <NavLink to="/api">Free API</NavLink>
        {user && <NavLink to="/quiz">Quiz</NavLink>}
        {user && <NavLink to="/chat">AI Coach</NavLink>}
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </div>
      <div className="nav-auth">
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/profile" className="nav-user-link" title="Your profile">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="nav-avatar nav-avatar-img" />
              ) : (
                <span className="nav-avatar">{user.name[0].toUpperCase()}</span>
              )}
              <span className="nav-user">{user.name.split(" ")[0]}</span>
            </Link>
            <button className="btn btn-ghost" onClick={() => { logout(); navigate("/"); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
