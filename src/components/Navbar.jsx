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
        <Logo size={30} /> Prep<span className="brand-accent">JS</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/concepts">Concepts</NavLink>
        <NavLink to="/playground">Playground</NavLink>
        {user && <NavLink to="/quiz">Quiz</NavLink>}
        {user && <NavLink to="/chat">AI Coach</NavLink>}
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </div>
      <div className="nav-auth">
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/profile" className="nav-user-link" title="Your profile">
              <span className="nav-avatar">{user.name[0].toUpperCase()}</span>
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
