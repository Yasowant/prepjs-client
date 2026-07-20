import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { api } from "../api.js";

const FILTERS = [
  ["all", "🌐 All"],
  ["javascript", "🟨 JavaScript"],
  ["react", "⚛️ React"],
  ["webdev", "🖥 Web Dev"],
  ["tech", "🔶 Hacker News"],
];

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ---------- in-app article reader (Dev.to) ---------- */
function ArticleReader({ articleId, onBack }) {
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setArticle(null);
    setError("");
    window.scrollTo({ top: 0 });
    api(`/news/article/${articleId}`)
      .then(setArticle)
      .catch((e) => setError(e.message));
  }, [articleId]);

  if (error) {
    return (
      <div className="page news-page">
        <button className="back-link" onClick={onBack}>← All news</button>
        <p className="empty">⚠️ {error}</p>
      </div>
    );
  }
  if (!article) return <div className="page-loader">Loading article…</div>;

  const clean = DOMPurify.sanitize(article.html, {
    FORBID_TAGS: ["style", "iframe", "form", "input", "button"],
    ADD_ATTR: ["target"],
  });

  return (
    <div className="page news-page">
      <button className="back-link" onClick={onBack}>← All news</button>

      {article.cover && <img src={article.cover} alt="" className="article-cover" />}
      <h1 className="article-title">{article.title}</h1>

      <div className="article-meta">
        {article.authorImg && <img src={article.authorImg} alt="" className="article-author-img" />}
        <span className="article-author">{article.author}</span>
        <span>·</span>
        <span>{new Date(article.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        {article.readingTime && <><span>·</span><span>☕ {article.readingTime} min read</span></>}
        <span>·</span>
        <span>❤️ {article.reactions}</span>
      </div>
      {article.tags.length > 0 && (
        <div className="article-tags">
          {article.tags.map((t) => <span className="chip small" key={t}>#{t}</span>)}
        </div>
      )}

      <article
        className="article-content"
        dangerouslySetInnerHTML={{ __html: clean }}
      />

      <div className="article-foot">
        <button className="btn btn-primary" onClick={onBack}>← Back to news</button>
        <a href={article.url} target="_blank" rel="noreferrer" className="btn btn-outline">
          View original on Dev.to ↗
        </a>
      </div>
    </div>
  );
}

/* ---------- news list ---------- */
export default function News() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState(null); // devto numeric id

  useEffect(() => {
    api("/news")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    if (!items) return [];
    return filter === "all" ? items : items.filter((i) => i.tag === filter);
  }, [items, filter]);

  if (readingId) return <ArticleReader articleId={readingId} onBack={() => setReadingId(null)} />;

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!items) return <div className="page-loader">Fetching the latest tech news…</div>;

  return (
    <div className="page news-page">
      <h1>📰 Tech News</h1>
      <p className="page-sub">
        The latest from the JavaScript, React and web dev world — read full articles
        with images right here, without leaving DevPrep. Updated every 30 minutes.
      </p>

      <div className="rlab-filters">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            className={`chip small rlab-diff-chip ${filter === id ? "on" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
        <span className="fc-progress">{shown.length} stories</span>
      </div>

      <div className="news-list">
        {shown.length === 0 && <p className="empty">No stories in this filter right now.</p>}
        {shown.map((n) => {
          const isDevto = n.source === "Dev.to";
          const inner = (
            <>
              <div className="news-body">
                <div className="news-meta">
                  <span className={`news-source ${isDevto ? "devto" : "hn"}`}>{n.source}</span>
                  <span className="news-time">{timeAgo(n.date)}</span>
                  {n.author && <span className="news-author">by {n.author}</span>}
                </div>
                <h3>{n.title}</h3>
                {n.description && <p className="news-desc">{n.description}</p>}
                <div className="news-stats">
                  <span>▲ {n.points}</span>
                  <span>💬 {n.comments}</span>
                  <span className="news-open">
                    {isDevto ? "📖 Read here" : "External link ↗"}
                  </span>
                </div>
              </div>
              {n.image && <img src={n.image} alt="" className="news-thumb" loading="lazy" />}
            </>
          );
          return isDevto ? (
            <button
              className="news-row"
              onClick={() => setReadingId(n.id.replace("devto-", ""))}
              key={n.id}
            >
              {inner}
            </button>
          ) : (
            <a className="news-row" href={n.url} target="_blank" rel="noreferrer" key={n.id}>
              {inner}
            </a>
          );
        })}
      </div>

      <p className="cert-hint">
        Dev.to articles open in DevPrep's reader with full credit to the author.
        Hacker News stories link to their original sites.
      </p>
    </div>
  );
}
