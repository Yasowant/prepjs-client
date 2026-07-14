import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Questions() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState("all");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    api("/concepts/questions", { auth: true })
      .then((d) => setAll(d.questions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // categories present in the current track
  const cats = useMemo(() => {
    const seen = new Map();
    all
      .filter((q) => track === "all" || q.track === track)
      .forEach((q) => seen.set(q.category, { name: q.categoryName, icon: q.categoryIcon }));
    return [...seen.entries()];
  }, [all, track]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter(
      (q) =>
        (track === "all" || q.track === track) &&
        (!category || q.category === category) &&
        (!s || q.q.toLowerCase().includes(s) || q.a.toLowerCase().includes(s))
    );
  }, [all, track, category, search]);

  function switchTrack(t) {
    setTrack(t);
    setCategory("");
  }

  if (loading) return <div className="page-loader">Loading the question bank…</div>;

  return (
    <div className="page questions-page">
      <h1>Interview Q&A Bank</h1>
      <p className="page-sub">
        Every interview question from all concepts — {all.length} questions in one place.
        Read the question, answer out loud, then check yourself.
      </p>

      {/* track switch */}
      <div className="track-switch">
        {[["all", "🎯 All"], ["js", "⚡ JavaScript"], ["react", "⚛️ React.js"]].map(([id, label]) => (
          <button
            key={id}
            className={`track-btn ${track === id ? "active" : ""}`}
            onClick={() => switchTrack(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        className="search-input"
        placeholder="🔍 Search questions… (closure, this, useEffect, event loop…)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* category chips */}
      <div className="chip-row">
        <button className={`chip ${!category ? "active" : ""}`} onClick={() => setCategory("")}>
          All categories
        </button>
        {cats.map(([id, c]) => (
          <button
            key={id}
            className={`chip ${category === id ? "active" : ""}`}
            onClick={() => setCategory(id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* toolbar */}
      <div className="qbank-toolbar">
        <span className="qbank-count">
          Showing <strong>{filtered.length}</strong> question{filtered.length !== 1 && "s"}
        </span>
        <button className="btn btn-outline" onClick={() => setAllOpen(!allOpen)}>
          {allOpen ? "▲ Collapse all" : "▼ Expand all answers"}
        </button>
      </div>

      {/* the bank */}
      {filtered.length === 0 && <p className="empty">No questions match your search.</p>}
      <div className="qbank-list" key={String(allOpen)}>
        {filtered.map((q, i) => (
          <details className="qa qbank-item" key={`${q.conceptId}-${i}`} open={allOpen || undefined}>
            <summary>
              <span className="qbank-num">Q{i + 1}.</span> {q.q}
              <span className={`level-badge ${q.level}`}>{q.level}</span>
            </summary>
            <p className="qbank-answer">{q.a}</p>
            <p className="qbank-source">
              {q.categoryIcon} {q.categoryName} ·{" "}
              <Link to={`/concepts/${q.conceptId}`}>Read full concept: {q.conceptTitle} →</Link>
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
