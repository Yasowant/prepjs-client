import { useState } from "react";

const BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api/v1`;

const SECTIONS = [
  {
    name: "Users",
    desc: "50 dummy users with names, emails, cities, companies and avatar URLs.",
    endpoints: [
      ["GET", "/users", "All users (paginated)"],
      ["GET", "/users/5", "Single user by id"],
      ["GET", "/users/search?q=bangalore", "Search by name, email, city or company"],
      ["POST", "/users", "Simulated create — echoes your body with a new id"],
      ["PUT", "/users/5", "Simulated update"],
      ["DELETE", "/users/5", "Simulated delete"],
    ],
  },
  {
    name: "Products",
    desc: "60 products across 6 categories with prices, ratings, stock and thumbnails.",
    endpoints: [
      ["GET", "/products", "All products (paginated)"],
      ["GET", "/products/12", "Single product"],
      ["GET", "/products/search?q=keyboard", "Search by title, category or brand"],
      ["GET", "/products?limit=10&skip=10", "Pagination — perfect for infinite scroll practice"],
      ["POST", "/products", "Simulated create"],
      ["DELETE", "/products/12", "Simulated delete"],
    ],
  },
  {
    name: "Todos",
    desc: "40 developer-flavoured todos with completed flags and user ids.",
    endpoints: [
      ["GET", "/todos", "All todos"],
      ["GET", "/todos/7", "Single todo"],
      ["PUT", "/todos/7", "Simulated update — toggle completed!"],
    ],
  },
  {
    name: "Posts",
    desc: "40 blog posts about JavaScript & React topics, with tags and likes.",
    endpoints: [
      ["GET", "/posts", "All posts"],
      ["GET", "/posts/search?q=hooks", "Search titles & bodies"],
      ["GET", "/posts/3", "Single post"],
    ],
  },
  {
    name: "Quotes",
    desc: "20 classic programming quotes.",
    endpoints: [
      ["GET", "/quotes", "All quotes"],
      ["GET", "/quotes/random", "One random quote — great for a quote widget"],
    ],
  },
];

const EXAMPLE = `// works from ANY origin — CORS is open, no API key needed
fetch("${BASE}/products?limit=5")
  .then((res) => res.json())
  .then((data) => console.log(data.products));

// with axios
const { data } = await axios.get("${BASE}/users/search?q=nayak");

// simulated POST (echoes back, nothing persists)
await fetch("${BASE}/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ todo: "Master DevPrep API", completed: false }),
});`;

export default function ApiDocs() {
  const [tried, setTried] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function tryIt() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/quotes/random`);
      setTried(JSON.stringify(await res.json(), null, 2));
    } catch (err) {
      setTried("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyBase() {
    navigator.clipboard?.writeText(BASE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="page apidocs-page">
      <h1>🔌 DevPrep Public API</h1>
      <p className="page-sub">
        A free fake REST API for your practice projects — like dummyjson, built into DevPrep.
        No API key, no signup, CORS open to every origin. Use it in the React Lab, your
        portfolio projects, or anywhere you need realistic data.
      </p>

      {/* base url */}
      <div className="api-base">
        <span className="api-base-label">BASE URL</span>
        <code>{BASE}</code>
        <button className="btn btn-outline" onClick={copyBase}>
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
        <button className="btn btn-primary" onClick={tryIt} disabled={loading}>
          {loading ? "Calling…" : "▶ Try it live"}
        </button>
      </div>
      {tried && (
        <pre className="api-tryout">
          <span className="api-tryout-label">GET /quotes/random →</span>
          {"\n"}{tried}
        </pre>
      )}

      {/* quick start */}
      <h2 className="api-h2">Quick start</h2>
      <pre className="code-block">{EXAMPLE}</pre>

      {/* endpoints */}
      <h2 className="api-h2">Endpoints</h2>
      {SECTIONS.map((section) => (
        <div className="api-section" key={section.name}>
          <h3>{section.name}</h3>
          <p className="api-section-desc">{section.desc}</p>
          <div className="api-endpoints">
            {section.endpoints.map(([method, path, desc]) => (
              <div className="api-row" key={method + path}>
                <span className={`api-method ${method.toLowerCase()}`}>{method}</span>
                <a
                  className="api-path"
                  href={method === "GET" ? `${BASE}${path}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  /api/v1{path}
                </a>
                <span className="api-desc">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="api-notes">
        <h3>📌 Good to know</h3>
        <ul>
          <li>Every list endpoint supports <code>?limit=</code> and <code>?skip=</code> (max limit: 100) — responses include <code>total</code>, so pagination and infinite scroll are easy.</li>
          <li>POST / PUT / DELETE are <strong>simulated</strong>: they validate and echo your data back with <code>isSimulated: true</code>, but nothing is stored — safe for everyone.</li>
          <li>The data is deterministic — the same ids return the same records every time, so your tests won't flake.</li>
          <li>Fair-use rate limits apply. Free forever for learning and portfolio projects.</li>
        </ul>
      </div>
    </div>
  );
}
