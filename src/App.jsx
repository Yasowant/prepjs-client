import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Concepts from "./pages/Concepts.jsx";
import ConceptDetail from "./pages/ConceptDetail.jsx";
import Quiz from "./pages/Quiz.jsx";
import QuizReview from "./pages/QuizReview.jsx";
import Chat from "./pages/Chat.jsx";
import Playground from "./pages/Playground.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import Questions from "./pages/Questions.jsx";
import ReactLab from "./pages/ReactLab.jsx";
import Visualizer from "./pages/Visualizer.jsx";
import ApiDocs from "./pages/ApiDocs.jsx";
import Interview from "./pages/Interview.jsx";
import SearchPalette from "./components/SearchPalette.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { loading } = useAuth();

  // hide the splash screen once the app is ready (min 1.4s so it's seen)
  useEffect(() => {
    if (loading) return;
    const shownAt = window.__splashStart || Date.now();
    const remaining = Math.max(0, 1400 - (Date.now() - shownAt));
    const t = setTimeout(() => {
      const el = document.getElementById("splash");
      if (!el) return;
      el.classList.add("splash-hide");
      setTimeout(() => el.remove(), 650);
    }, remaining);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <>
      <Navbar />
      <SearchPalette />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:id" element={<ConceptDetail />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/react-lab" element={<ReactLab />} />
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="/api" element={<ApiDocs />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/questions" element={<Protected><Questions /></Protected>} />
        <Route path="/interview" element={<Protected><Interview /></Protected>} />
        <Route path="/quiz" element={<Protected><Quiz /></Protected>} />
        <Route path="/quiz/review/:id" element={<Protected><QuizReview /></Protected>} />
        <Route path="/chat" element={<Protected><Chat /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
