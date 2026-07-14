import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ConceptDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [concept, setConcept] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [lockedInfo, setLockedInfo] = useState(null);

  useEffect(() => {
    setConcept(null);
    setLockedInfo(null);
    setError("");
    api(`/concepts/${id}`, { auth: Boolean(user) })
      .then(setConcept)
      .catch((e) => {
        if (e.code === "LOGIN_REQUIRED") setLockedInfo(e.data);
        else setError(e.message);
      });
    if (user) {
      api("/progress", { auth: true })
        .then((d) => setStatus(d.entries.find((e) => e.conceptId === id)?.status ?? null))
        .catch(() => {});
    }
  }, [id, user]);

  async function updateStatus(next) {
    if (!user) return;
    if (status === next) {
      await api(`/progress/${id}`, { method: "DELETE", auth: true });
      setStatus(null);
    } else {
      await api(`/progress/${id}`, { method: "PUT", auth: true, body: { status: next } });
      setStatus(next);
    }
  }

  if (lockedInfo) {
    return (
      <div className="page">
        <Link to="/concepts" className="back-link">← All concepts</Link>
        <div className="lock-screen">
          <div className="lock-glow" />
          <div className="lock-icon">🔒</div>
          <span className={`level-badge ${lockedInfo.level}`}>{lockedInfo.level}</span>
          <h1>{lockedInfo.title}</h1>
          <p className="lock-msg">
            This concept is locked. Create a <strong>free account</strong> to unlock
            all 76+ concepts, quizzes, progress tracking and the AI coach.
          </p>
          <div className="lock-preview">
            <div className="lock-line" style={{ width: "92%" }} />
            <div className="lock-line" style={{ width: "80%" }} />
            <div className="lock-line" style={{ width: "86%" }} />
            <div className="lock-line short" style={{ width: "55%" }} />
          </div>
          <div className="lock-actions">
            <Link to="/login" className="btn btn-primary btn-lg">Login to Unlock</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create Free Account</Link>
          </div>
          <p className="lock-hint">✨ Free forever — just verify your email.</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!concept) return <div className="page-loader">Loading…</div>;

  return (
    <div className="page detail">
      <Link to="/concepts" className="back-link">← All concepts</Link>

      <div className="detail-header">
        <span className={`level-badge ${concept.level}`}>{concept.level}</span>
        <h1>{concept.title}</h1>
        {user && (
          <div className="detail-actions">
            <button
              className={`btn ${status === "completed" ? "btn-primary" : "btn-outline"}`}
              onClick={() => updateStatus("completed")}
            >
              {status === "completed" ? "✓ Completed" : "Mark Complete"}
            </button>
            <button
              className={`btn ${status === "bookmarked" ? "btn-primary" : "btn-outline"}`}
              onClick={() => updateStatus("bookmarked")}
            >
              {status === "bookmarked" ? "🔖 Bookmarked" : "Bookmark"}
            </button>
          </div>
        )}
      </div>

      <section className="detail-section">
        <h2>💡 Explanation</h2>
        <p className="explanation">{concept.explanation}</p>
      </section>

      <section className="detail-section">
        <h2>👨‍💻 Code Example</h2>
        <pre className="code-block"><code>{concept.code}</code></pre>
      </section>

      <section className="detail-section">
        <h2>🎯 Interview Questions</h2>
        {concept.questions.map((qa, i) => (
          <details className="qa" key={i}>
            <summary>{qa.q}</summary>
            <p>{qa.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
