import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function QuizReview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/quiz/results/${id}/review`, { auth: true })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!data) return <div className="page-loader">Loading review…</div>;

  const pct = Math.round((data.score / data.total) * 100);

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Dashboard</Link>

      <h1>{data.category} quiz — {data.score}/{data.total} ({pct}%)</h1>
      <p className="page-sub">
        Taken on {new Date(data.createdAt).toLocaleString()} ·{" "}
        {pct >= 80 ? "🔥 Interview ready!" : pct >= 50 ? "👍 Good — review the misses below." : "📖 Revisit this topic and retry."}
      </p>

      {!data.hasAnswers && (
        <div className="alert" style={{ marginBottom: 20 }}>
          This attempt was taken before answer history was added, so your selected answers
          aren't available — but here are all questions with correct answers and explanations. ✅
        </div>
      )}

      {data.review.map((r, i) => (
        <div key={r.id} className={`review-card ${!data.hasAnswers ? "" : r.correct ? "ok" : "bad"}`}>
          <p className="review-q">
            {data.hasAnswers ? (r.correct ? "✅" : "❌") : `${i + 1}.`} {r.question}
          </p>
          {data.hasAnswers && (
            <p>Your answer: <strong>{r.given != null ? r.options[r.given] : "— (skipped)"}</strong></p>
          )}
          <p>Correct answer: <strong>{r.options[r.answer]}</strong></p>
          <p className="review-exp">💡 {r.explanation}</p>
        </div>
      ))}

      <div className="quiz-nav">
        <Link to="/quiz" className="btn btn-primary">Retake a quiz</Link>
        <Link to="/dashboard" className="btn btn-outline">Back to dashboard</Link>
      </div>
    </div>
  );
}
