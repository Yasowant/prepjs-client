import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { BADGE_META, ALL_BADGE_IDS } from "../data/badges.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [gamify, setGamify] = useState(null);

  useEffect(() => {
    api("/progress", { auth: true })
      .then((d) => {
        setStats(d.stats);
        setBookmarks(d.entries.filter((e) => e.status === "bookmarked"));
        setByCategory(d.byCategory || {});
      })
      .catch(() => {});
    api("/quiz/results/history", { auth: true }).then(setHistory).catch(() => {});
    api("/concepts/categories").then(setCategories).catch(() => {});
    api("/gamify/me", { auth: true }).then(setGamify).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
      <p className="page-sub">Here's where your prep stands.</p>

      {gamify && (
        <div className="gamify-strip">
          <div className={`gamify-streak ${gamify.streak > 0 ? "alive" : ""}`}>
            <span className="gamify-flame">🔥</span>
            <div>
              <strong>{gamify.streak} day{gamify.streak === 1 ? "" : "s"}</strong>
              <span>
                {gamify.activeToday
                  ? "Streak safe for today!"
                  : gamify.streak > 0
                    ? "Practice today to keep it alive"
                    : "Start a streak — do anything today"}
              </span>
              {gamify.longestStreak > 1 && (
                <span className="gamify-best">Best: {gamify.longestStreak} days</span>
              )}
            </div>
          </div>

          <div className="gamify-level">
            <div className="gamify-level-top">
              <strong>⭐ Level {gamify.level}</strong>
              <span>{gamify.xp} XP</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(gamify.xpIntoLevel / gamify.xpForNextLevel) * 100}%` }}
              />
            </div>
            <span className="gamify-next">
              {gamify.xpForNextLevel - gamify.xpIntoLevel} XP to level {gamify.level + 1}
            </span>
          </div>

          <div className="gamify-badges">
            <strong>🎖 Badges ({gamify.badges.length}/{ALL_BADGE_IDS.length})</strong>
            <div className="badge-row">
              {ALL_BADGE_IDS.map((id) => {
                const meta = BADGE_META[id];
                const earned = gamify.badges.includes(id);
                return (
                  <span
                    key={id}
                    className={`badge-chip ${earned ? "earned" : "locked"}`}
                    title={`${meta.name} — ${meta.desc}${earned ? "" : " (locked)"}`}
                  >
                    {meta.icon}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="dash-grid">
          <div className="dash-card">
            <span className="dash-num">{stats.percent}%</span>
            <span className="dash-label">Course complete</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
            </div>
          </div>
          <div className="dash-card">
            <span className="dash-num">{stats.completed}/{stats.total}</span>
            <span className="dash-label">Concepts mastered</span>
          </div>
          <div className="dash-card">
            <span className="dash-num">{stats.bookmarked}</span>
            <span className="dash-label">Bookmarked</span>
          </div>
          <div className="dash-card">
            <span className="dash-num">{history.length}</span>
            <span className="dash-label">Quizzes taken</span>
          </div>
        </div>
      )}

      {categories.length > 0 && Object.keys(byCategory).length > 0 && (
        <section className="dash-catprogress">
          <h2>📊 Progress by category</h2>
          <div className="catprog-grid">
            {categories.map((c) => {
              const p = byCategory[c.id];
              if (!p) return null;
              return (
                <Link to={`/concepts?category=${c.id}`} className="catprog-row" key={c.id}>
                  <span className="catprog-icon">{c.icon}</span>
                  <div className="catprog-mid">
                    <div className="catprog-top">
                      <span className="catprog-name">{c.name}</span>
                      <span className="catprog-count">{p.completed}/{p.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${p.percent === 100 ? "full" : ""}`}
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>
                  </div>
                  {p.percent === 100 && <span className="catprog-done">🏆</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="dash-columns">
        <section>
          <h2>📝 Recent quiz results</h2>
          {history.length === 0 && <p className="empty">No quizzes yet. <Link to="/quiz">Take one →</Link></p>}
          {history.slice(0, 6).map((r) => (
            <Link className="history-row clickable" key={r._id} to={`/quiz/review/${r._id}`}>
              <span className="history-cat">{r.category}</span>
              <span className={`history-score ${r.score / r.total >= 0.7 ? "good" : ""}`}>
                {r.score}/{r.total}
              </span>
              <span className="history-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              <span className="history-arrow">→</span>
            </Link>
          ))}
          {history.length > 0 && (
            <p className="history-hint">Click any attempt to see every question, your answers & explanations.</p>
          )}
        </section>

        <section>
          <h2>🔖 Bookmarks</h2>
          {bookmarks.length === 0 && <p className="empty">Bookmark tricky concepts while learning.</p>}
          {bookmarks.map((b) => (
            <Link className="bookmark-row" to={`/concepts/${b.conceptId}`} key={b._id}>
              {b.conceptId.replace(/-/g, " ")}
            </Link>
          ))}
        </section>
      </div>

      <div className="dash-actions">
        <Link to="/concepts" className="btn btn-primary">Continue Learning</Link>
        <Link to="/quiz" className="btn btn-outline">Take a Quiz</Link>
        <Link to="/chat" className="btn btn-outline">Ask AI Coach</Link>
      </div>
    </div>
  );
}
