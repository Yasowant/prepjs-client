import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Quiz() {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/quiz/categories").then(setCategories).catch(() => {});
  }, []);

  async function start(cat) {
    setActive(cat);
    setAnswers({});
    setResult(null);
    setQuestions(await api(`/quiz/${cat}`, { auth: true }));
  }

  async function submit() {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const ok = confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""} — they will be counted as wrong. Submit anyway?`
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      setResult(await api(`/quiz/${active}/submit`, { method: "POST", auth: true, body: { answers } }));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!active) {
    return (
      <div className="page">
        <h1>Quizzes</h1>
        <p className="page-sub">Pick a category and test yourself.</p>
        <div className="quiz-cat-grid">
          {categories.map((c) => (
            <button key={c.id} className="quiz-cat-card" onClick={() => start(c.id)}>
              <h3>{c.id}</h3>
              <span>{c.count} questions</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="page">
        <h1>Result: {result.score}/{result.total} ({pct}%)</h1>
        <p className="page-sub">{pct >= 80 ? "🔥 Interview ready!" : pct >= 50 ? "👍 Good — review the misses." : "📖 Revisit this topic and retry."}</p>
        {result.review.map((r) => (
          <div key={r.id} className={`review-card ${r.correct ? "ok" : "bad"}`}>
            <p className="review-q">{r.correct ? "✅" : "❌"} {r.question}</p>
            <p>Your answer: <strong>{r.given != null ? r.options[r.given] : "—"}</strong></p>
            {!r.correct && <p>Correct: <strong>{r.options[r.answer]}</strong></p>}
            <p className="review-exp">{r.explanation}</p>
          </div>
        ))}
        <div className="quiz-nav">
          <button className="btn btn-outline" onClick={() => setActive(null)}>All quizzes</button>
          <button className="btn btn-primary" onClick={() => start(active)}>Retry</button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="page">
      <button className="back-link" onClick={() => setActive(null)}>← All quizzes</button>
      <h1>{active} quiz</h1>
      <p className="page-sub">{answered}/{questions.length} answered</p>

      {questions.map((q, qi) => (
        <div className="quiz-question" key={q.id}>
          <p className="quiz-q-text">{qi + 1}. {q.question}</p>
          <div className="quiz-options">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                className={`quiz-option ${answers[q.id] === oi ? "selected" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.id]: oi })}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        className="btn btn-primary btn-lg"
        disabled={busy || answered === 0}
        onClick={submit}
      >
        {busy
          ? "Submitting…"
          : answered === 0
          ? "Pick at least one answer"
          : answered < questions.length
          ? `Submit (${questions.length - answered} unanswered)`
          : "Submit Quiz ✓"}
      </button>
    </div>
  );
}
