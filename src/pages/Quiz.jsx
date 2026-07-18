import { useEffect, useState } from "react";
import { api } from "../api.js";
import Confetti from "../components/Confetti.jsx";

export default function Quiz() {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [best, setBest] = useState({}); // category -> { score, total, attempts }

  function loadHistory() {
    api("/quiz/results/history", { auth: true })
      .then((list) => {
        const map = {};
        for (const r of list) {
          const cur = map[r.category];
          if (!cur || r.score / r.total > cur.score / cur.total) {
            map[r.category] = { score: r.score, total: r.total, attempts: (cur?.attempts || 0) + 1 };
          } else {
            cur.attempts += 1;
          }
        }
        setBest(map);
      })
      .catch(() => {});
  }

  useEffect(() => {
    api("/quiz/categories").then(setCategories).catch(() => {});
    loadHistory();
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
      loadHistory(); // refresh best-score badges
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
        <p className="page-sub">
          Pick a category and test yourself — retake any quiz as often as you like,
          your best score is saved.
        </p>
        <div className="quiz-cat-grid">
          {categories.map((c) => {
            const b = best[c.id];
            const pct = b ? Math.round((b.score / b.total) * 100) : null;
            return (
              <button key={c.id} className={`quiz-cat-card ${b ? "attempted" : ""}`} onClick={() => start(c.id)}>
                <h3>{c.id}</h3>
                <span>{c.count} questions</span>
                {b ? (
                  <span className={`quiz-best ${pct === 100 ? "perfect" : pct >= 70 ? "good" : ""}`}>
                    {pct === 100 ? "🏆" : "✅"} Best: {b.score}/{b.total}
                    <em> · 🔄 Retry</em>
                  </span>
                ) : (
                  <span className="quiz-new">▶ Start</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    const wrong = result.review.filter((r) => r.given != null && !r.correct).length;
    const skipped = result.review.filter((r) => r.given == null).length;
    const celebration =
      pct === 100 ? { emoji: "🏆", title: "PERFECT SCORE!", msg: "Flawless. You'd ace this round in a real interview." }
      : pct >= 80 ? { emoji: "🎉", title: "Excellent!", msg: "Interview ready — just skim the explanations below." }
      : pct >= 50 ? { emoji: "💪", title: "Good effort!", msg: "Solid base. Review the misses and retry to lock it in." }
      : { emoji: "📖", title: "Keep going!", msg: "Every expert failed this once. Read the explanations and retry." };

    return (
      <div className="page">
        {pct >= 50 && <Confetti />}

        {/* score hero */}
        <div className="result-hero">
          <div className="result-emoji">{celebration.emoji}</div>
          <div className="result-ring" style={{ "--pct": pct }}>
            <span className="result-pct">{pct}%</span>
          </div>
          <h1>{celebration.title}</h1>
          <p className="page-sub">{celebration.msg}</p>

          <div className="result-breakdown">
            <span className="rb-chip ok">✅ {result.score} correct</span>
            <span className="rb-chip bad">❌ {wrong} wrong</span>
            {skipped > 0 && <span className="rb-chip skip">⏭ {skipped} skipped</span>}
            <span className="rb-chip">📊 {result.score}/{result.total}</span>
          </div>

          <div className="quiz-nav">
            <button className="btn btn-primary" onClick={() => start(active)}>🔄 Retry Quiz</button>
            <button className="btn btn-outline" onClick={() => setActive(null)}>All quizzes</button>
          </div>
        </div>

        <h2 className="result-review-title">📋 Full review — every question explained</h2>
        {result.review.map((r, i) => (
          <div key={r.id} className={`review-card ${r.correct ? "ok" : "bad"}`}>
            <p className="review-q">{r.correct ? "✅" : r.given == null ? "⏭" : "❌"} {i + 1}. {r.question}</p>
            <p>Your answer: <strong>{r.given != null ? r.options[r.given] : "— skipped"}</strong></p>
            <p>Correct answer: <strong className="review-correct">{r.options[r.answer]}</strong></p>
            <p className="review-exp">💡 {r.explanation}</p>
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
