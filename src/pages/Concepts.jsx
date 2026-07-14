import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const LEVELS = ["basic", "intermediate", "advanced"];

export default function Concepts() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [byCategory, setByCategory] = useState({});
  const [search, setSearch] = useState("");

  const category = params.get("category") || "";
  const level = params.get("level") || "";

  useEffect(() => {
    api("/concepts/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (level) q.set("level", level);
    if (search) q.set("search", search);
    api(`/concepts?${q}`, { auth: Boolean(user) }).then(setConcepts).catch(() => {});
  }, [category, level, search, user]);

  useEffect(() => {
    if (!user) return;
    api("/progress", { auth: true })
      .then((d) => {
        const map = {};
        d.entries.forEach((e) => (map[e.conceptId] = e.status));
        setProgress(map);
        setStats(d.stats);
        setByCategory(d.byCategory || {});
      })
      .catch(() => {});
  }, [user]);

  const activeCat = category && byCategory[category];

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="page">
      <h1>Concept Library</h1>
      <p className="page-sub">All JavaScript concepts — basic to advanced, with interview Q&A.</p>

      {user && stats && (
        <div className="concepts-progress">
          <div className="concepts-progress-row">
            <span>
              {activeCat
                ? <>📂 <strong>{categories.find((x) => x.id === category)?.name}</strong>: {activeCat.completed}/{activeCat.total} completed</>
                : <>🏁 Overall progress: <strong>{stats.completed}/{stats.total}</strong> concepts completed</>}
            </span>
            <span className="concepts-progress-pct">
              {activeCat ? activeCat.percent : stats.percent}%
            </span>
          </div>
          <div className="progress-bar big">
            <div
              className="progress-fill"
              style={{ width: `${activeCat ? activeCat.percent : stats.percent}%` }}
            />
          </div>
        </div>
      )}

      <input
        className="search-input"
        placeholder="🔍 Search concepts… (closures, event loop, this…)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chip-row">
        <button className={`chip ${!category ? "active" : ""}`} onClick={() => setFilter("category", "")}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${category === c.id ? "active" : ""}`}
            onClick={() => setFilter("category", c.id)}
          >
            {c.icon} {c.name} ({c.count})
          </button>
        ))}
      </div>

      <div className="chip-row">
        <button className={`chip small ${!level ? "active" : ""}`} onClick={() => setFilter("level", "")}>
          All levels
        </button>
        {LEVELS.map((l) => (
          <button key={l} className={`chip small ${level === l ? "active" : ""}`} onClick={() => setFilter("level", l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="concept-grid">
        {concepts.map((c) => (
          <Link
            to={`/concepts/${c.id}`}
            className={`concept-card ${c.locked ? "locked" : ""}`}
            key={c.id}
          >
            <div className="concept-card-top">
              <span className={`level-badge ${c.level}`}>{c.level}</span>
              {c.locked && <span className="lock-badge">🔒</span>}
              {!user && c.free && <span className="free-badge">FREE</span>}
              {progress[c.id] === "completed" && <span className="done-badge">✓ done</span>}
              {progress[c.id] === "bookmarked" && <span className="done-badge bookmark">🔖</span>}
            </div>
            <h3>{c.title}</h3>
            <span className="concept-cat">{categories.find((x) => x.id === c.category)?.name}</span>
          </Link>
        ))}
        {concepts.length === 0 && <p className="empty">No concepts match your search.</p>}
      </div>
    </div>
  );
}
