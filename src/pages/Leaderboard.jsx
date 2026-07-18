import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ r }) {
  return (
    <div className={`lb-row ${r.isMe ? "me" : ""} ${r.rank <= 3 ? "top3" : ""}`}>
      <span className="lb-rank">{MEDALS[r.rank - 1] || `#${r.rank}`}</span>
      {r.avatar ? (
        <img src={r.avatar} alt="" className="lb-avatar" />
      ) : (
        <span className="lb-avatar lb-avatar-fallback">{r.name[0]?.toUpperCase()}</span>
      )}
      <span className="lb-name">
        {r.name} {r.isMe && <em>(you)</em>}
      </span>
      <span className="lb-streak" title="Current streak">🔥 {r.streak}</span>
      <span className="lb-badges" title="Badges earned">🎖 {r.badges}</span>
      <span className="lb-level">Lv {r.level}</span>
      <span className="lb-xp">{r.xp.toLocaleString()} XP</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/gamify/leaderboard", { auth: Boolean(user) })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [user]);

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!data) return <div className="page-loader">Loading leaderboard…</div>;

  return (
    <div className="page lb-page">
      <h1>🏆 Leaderboard</h1>
      <p className="page-sub">
        Top DevPrep learners by XP. Earn XP from quizzes, coding problems, React Lab
        submissions and mock interviews — every day you practice, your streak grows.
      </p>

      {!user && (
        <p className="api-login-hint">
          <Link to="/register">Create a free account</Link> to appear on the board and see your rank.
        </p>
      )}

      <div className="lb-list">
        {data.top.length === 0 && <p className="empty">No ranked learners yet — be the first!</p>}
        {data.top.map((r) => <Row r={r} key={r.rank} />)}
        {data.me && (
          <>
            <div className="lb-gap">⋯</div>
            <Row r={data.me} />
          </>
        )}
      </div>
    </div>
  );
}
