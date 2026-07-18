import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { setSEO } from "../utils/seo.js";

export default function ConceptDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [concept, setConcept] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [noteState, setNoteState] = useState("idle"); // idle | saving | saved
  const noteTimer = useRef(null);

  useEffect(() => {
    setConcept(null);
    setError("");
    setNote("");
    setNoteState("idle");
    api(`/concepts/${id}`, { auth: Boolean(user) })
      .then(setConcept)
      .catch((e) => setError(e.message));
    if (user) {
      api("/progress", { auth: true })
        .then((d) => setStatus(d.entries.find((e) => e.conceptId === id)?.status ?? null))
        .catch(() => {});
      api(`/notes/${id}`, { auth: true })
        .then((d) => setNote(d.text))
        .catch(() => {});
    }
  }, [id, user]);

  function onNoteChange(text) {
    setNote(text);
    setNoteState("saving");
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      api(`/notes/${id}`, { method: "PUT", auth: true, body: { text } })
        .then(() => {
          setNoteState("saved");
          setTimeout(() => setNoteState("idle"), 1500);
        })
        .catch(() => setNoteState("idle"));
    }, 1000);
  }

  // per-concept SEO — each concept is its own Google landing page
  useEffect(() => {
    if (!concept) return;
    setSEO({
      title: `${concept.title} — Interview Questions & Explanation | DevPrep`,
      description: concept.explanation,
      path: `/concepts/${id}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: `${concept.title} — JavaScript/React Interview Preparation`,
        description: String(concept.explanation || "").slice(0, 200),
        url: `https://devprep.esscentra.in/concepts/${id}`,
        author: { "@type": "Person", name: "Yasowant Nayak" },
        publisher: { "@type": "Organization", name: "DevPrep" },
        proficiencyLevel: concept.level,
      },
    });
  }, [concept, id]);

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
        <h2>🎯 Interview Questions{concept.qaLocked ? ` (${concept.questionCount})` : ""}</h2>
        {concept.qaLocked ? (
          <div className="qa-locked">
            <p>
              🔒 <strong>{concept.questionCount} interview questions & answers</strong> on{" "}
              {concept.title} are waiting — exactly how interviewers ask them, with model
              answers. Free account, no card needed.
            </p>
            <div className="lock-actions">
              <Link to="/register" className="btn btn-primary">Unlock free — see the answers</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </div>
          </div>
        ) : (
          concept.questions.map((qa, i) => (
            <details className="qa" key={i}>
              <summary>{qa.q}</summary>
              <p>{qa.a}</p>
            </details>
          ))
        )}
      </section>

      {user && (
        <section className="detail-section">
          <h2>
            📝 My notes{" "}
            <span className="note-state">
              {noteState === "saving" ? "saving…" : noteState === "saved" ? "✓ saved" : ""}
            </span>
          </h2>
          <textarea
            className="note-box"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={`Your own notes on ${concept.title} — tricks, mnemonics, interview stories. Auto-saves to your account.`}
          />
        </section>
      )}
    </div>
  );
}
