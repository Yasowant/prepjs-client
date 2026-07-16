import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { SIGNAL_META } from "./Interview.jsx";

const TOPIC_NAMES = { javascript: "🟨 JavaScript", react: "⚛️ React.js", fullstack: "🌐 Full Stack" };

export default function InterviewReview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/interview/${id}`, { auth: true }).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="page interview-page">
        <h1>📋 Interview Review</h1>
        <div className="interview-error">⚠️ {error}</div>
        <Link to="/interview" className="btn btn-outline">← Back to interviews</Link>
      </div>
    );
  }
  if (!data) return <div className="page-loader">Loading interview…</div>;

  const pct = data.outOf ? Math.round((data.total / data.outOf) * 100) : 0;
  const signal = SIGNAL_META[data.hireSignal] || SIGNAL_META.borderline;

  return (
    <div className="page interview-page">
      <Link to="/interview" className="iv-back">← All interviews</Link>
      <h1>📋 Interview Review</h1>
      <p className="page-sub">
        {TOPIC_NAMES[data.topic] || data.topic} · {data.level} ·{" "}
        {new Date(data.createdAt).toLocaleString()}
      </p>

      {/* recorded video */}
      {data.videoUrl && (
        <div className="iv-replay">
          <h2 className="iv-h2">🎥 Your interview recording</h2>
          <video src={data.videoUrl} controls playsInline className="iv-replay-video" />
          <p className="iv-note">
            Watch your body language, filler words and pacing — that's where interviews are won.
          </p>
        </div>
      )}

      <div className={`iv-verdict ${signal.cls}`}>
        <div className="iv-score-ring" style={{ "--pct": pct }}>
          <span>{data.total}<small>/{data.outOf}</small></span>
        </div>
        <div className="iv-verdict-body">
          <strong>{signal.icon} {data.hireSignal?.toUpperCase()}</strong>
          <p>{data.verdict}</p>
        </div>
      </div>

      <h2 className="iv-h2">Question-by-question feedback</h2>
      {data.results.map((r, i) => (
        <div className="iv-feedback-card" key={i}>
          <div className="iv-feedback-head">
            <strong>Q{i + 1}. {data.qa[i]?.question}</strong>
            <span className={`iv-qscore ${r.score >= 7 ? "good" : r.score >= 4 ? "mid" : "bad"}`}>
              {r.score}/10
            </span>
          </div>
          <p className="iv-your-answer">
            <span>Your answer:</span> {data.qa[i]?.answer?.trim() || <em>(no answer)</em>}
          </p>
          <p className="iv-feedback">💬 {r.feedback}</p>
          <details className="iv-model-answer">
            <summary>✅ Model answer</summary>
            <p>{r.modelAnswer}</p>
          </details>
        </div>
      ))}

      <div className="iv-actions">
        <Link to="/interview" className="btn btn-primary">🔁 Take another interview</Link>
        <Link to="/dashboard" className="btn btn-outline">View dashboard</Link>
      </div>
    </div>
  );
}
