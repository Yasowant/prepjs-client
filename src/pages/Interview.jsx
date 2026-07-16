import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { BADGE_META } from "../data/badges.js";

const SECONDS_PER_QUESTION = 180; // 3 minutes

const TOPICS = [
  { id: "javascript", icon: "🟨", name: "JavaScript", desc: "Core JS — closures, event loop, async, prototypes" },
  { id: "react", icon: "⚛️", name: "React.js", desc: "Hooks, rendering, state, performance" },
  { id: "fullstack", icon: "🌐", name: "Full Stack", desc: "JS + React + Node.js mixed round" },
];

const LEVELS = [
  { id: "junior", name: "Junior", desc: "0–2 years" },
  { id: "mid", name: "Mid-level", desc: "2–4 years" },
  { id: "senior", name: "Senior", desc: "4+ years" },
];

const SIGNAL_META = {
  "strong yes": { icon: "🚀", cls: "good" },
  yes: { icon: "✅", cls: "good" },
  borderline: { icon: "🤔", cls: "mid" },
  "not yet": { icon: "📚", cls: "bad" },
};

export default function Interview() {
  const [phase, setPhase] = useState("setup"); // setup | loading | live | evaluating | result | error
  const [topic, setTopic] = useState("javascript");
  const [level, setLevel] = useState("junior");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draft, setDraft] = useState("");
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  // refs so the timer callback never sees stale state
  const draftRef = useRef("");
  const answersRef = useRef([]);
  const submitRef = useRef(() => {});
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submitRef.current = submitAnswer; });

  // countdown during a live question
  useEffect(() => {
    if (phase !== "live") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => submitRef.current(), 0); // time's up — auto-advance
          return SECONDS_PER_QUESTION;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, current]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    setPhase("loading");
    setError("");
    try {
      const { questions: qs } = await api("/interview/start", {
        method: "POST",
        auth: true,
        body: { topic, level },
      });
      setQuestions(qs);
      setAnswers([]);
      setCurrent(0);
      setDraft("");
      setTimeLeft(SECONDS_PER_QUESTION);
      setPhase("live");
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }

  function submitAnswer() {
    const next = [
      ...answersRef.current,
      { question: questions[current], answer: draftRef.current },
    ];
    setAnswers(next);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setDraft("");
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      evaluate(next);
    }
  }

  async function evaluate(qa) {
    clearInterval(timerRef.current);
    setPhase("evaluating");
    try {
      const data = await api("/interview/evaluate", {
        method: "POST",
        auth: true,
        body: { topic, level, qa },
      });
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }

  function reset() {
    setPhase("setup");
    setResult(null);
    setError("");
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(1, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  /* ---------------- setup ---------------- */
  if (phase === "setup" || phase === "loading" || phase === "error") {
    return (
      <div className="page interview-page">
        <h1>🎤 Mock Interview</h1>
        <p className="page-sub">
          A real interview simulation: the AI asks <strong>5 questions one at a time</strong>,
          you answer in your own words with <strong>3 minutes per question</strong>, and at the
          end you get a score out of 10 per answer, honest feedback, model answers and a hire signal.
        </p>

        {phase === "error" && (
          <div className="interview-error">⚠️ {error} <button className="btn btn-outline" onClick={reset}>Try again</button></div>
        )}

        <h2 className="iv-h2">1 · Pick your track</h2>
        <div className="iv-topic-grid">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              className={`iv-topic ${topic === t.id ? "selected" : ""}`}
              onClick={() => setTopic(t.id)}
            >
              <span className="iv-topic-icon">{t.icon}</span>
              <strong>{t.name}</strong>
              <span className="iv-topic-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <h2 className="iv-h2">2 · Experience level</h2>
        <div className="iv-level-row">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`iv-level ${level === l.id ? "selected" : ""}`}
              onClick={() => setLevel(l.id)}
            >
              <strong>{l.name}</strong> <span>{l.desc}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary iv-start"
          onClick={start}
          disabled={phase === "loading"}
        >
          {phase === "loading" ? "⏳ Preparing your questions…" : "🎬 Start interview"}
        </button>
        <p className="iv-note">
          Tip: answer like you would speak in a real interview — 2 to 4 clear sentences beat a wall of text.
        </p>
      </div>
    );
  }

  /* ---------------- live ---------------- */
  if (phase === "live") {
    return (
      <div className="page interview-page">
        <div className="iv-live-top">
          <span className="iv-progress">Question {current + 1} / {questions.length}</span>
          <span className={`iv-timer ${timeLeft <= 30 ? "danger" : ""}`}>⏱ {mm}:{ss}</span>
        </div>
        <div className="iv-progress-bar">
          <div className="iv-progress-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
        </div>

        <div className="iv-question-card">
          <span className="iv-interviewer">🤖 Interviewer</span>
          <p className="iv-question">{questions[current]}</p>
        </div>

        <textarea
          className="iv-answer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your answer as you would say it aloud…"
          autoFocus
        />

        <div className="iv-actions">
          <button className="btn btn-primary" onClick={() => submitAnswer()}>
            {current + 1 === questions.length ? "Submit final answer →" : "Next question →"}
          </button>
          <span className="iv-skip-hint">Empty answers score 0 — attempt something!</span>
        </div>
      </div>
    );
  }

  /* ---------------- evaluating ---------------- */
  if (phase === "evaluating") {
    return (
      <div className="page interview-page iv-center">
        <div className="iv-eval-spinner">🧑‍⚖️</div>
        <h2>Evaluating your answers…</h2>
        <p className="page-sub">The interviewer is reviewing all {questions.length} answers and writing feedback.</p>
      </div>
    );
  }

  /* ---------------- result ---------------- */
  const outOf = result?.outOf || (result?.results?.length || 0) * 10;
  const pct = outOf ? Math.round((result.total / outOf) * 100) : 0;
  const signal = SIGNAL_META[result?.hireSignal] || SIGNAL_META.borderline;

  return (
    <div className="page interview-page">
      <h1>📋 Interview Report</h1>

      <div className={`iv-verdict ${signal.cls}`}>
        <div className="iv-score-ring" style={{ "--pct": pct }}>
          <span>{result.total}<small>/{outOf}</small></span>
        </div>
        <div className="iv-verdict-body">
          <strong>{signal.icon} {result.hireSignal?.toUpperCase()}</strong>
          <p>{result.verdict}</p>
          <span className="iv-xp">+{result.xpGained} XP earned</span>
          {result.newBadges?.length > 0 && (
            <span className="iv-new-badges">
              🎖 New badge{result.newBadges.length > 1 ? "s" : ""}:{" "}
              {result.newBadges.map((b) => BADGE_META[b]?.name || b).join(", ")}
            </span>
          )}
        </div>
      </div>

      <h2 className="iv-h2">Question-by-question feedback</h2>
      {result.results.map((r, i) => (
        <div className="iv-feedback-card" key={i}>
          <div className="iv-feedback-head">
            <strong>Q{i + 1}. {answers[i]?.question}</strong>
            <span className={`iv-qscore ${r.score >= 7 ? "good" : r.score >= 4 ? "mid" : "bad"}`}>
              {r.score}/10
            </span>
          </div>
          <p className="iv-your-answer">
            <span>Your answer:</span> {answers[i]?.answer?.trim() || <em>(no answer)</em>}
          </p>
          <p className="iv-feedback">💬 {r.feedback}</p>
          <details className="iv-model-answer">
            <summary>✅ Model answer</summary>
            <p>{r.modelAnswer}</p>
          </details>
        </div>
      ))}

      <div className="iv-actions">
        <button className="btn btn-primary" onClick={reset}>🔁 New interview</button>
        <Link to="/dashboard" className="btn btn-outline">View dashboard</Link>
      </div>
    </div>
  );
}
