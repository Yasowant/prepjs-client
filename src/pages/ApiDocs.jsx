import { useState } from "react";

const ORIGIN = import.meta.env.VITE_API_URL || window.location.origin;
const BASE = `${ORIGIN}/api/v1`;

const SECTIONS = [
  {
    name: "Users",
    desc: "50 dummy users with names, emails, cities, companies and avatar URLs.",
    endpoints: [
      ["GET", "/users?limit=3", "All users (paginated)"],
      ["GET", "/users/5", "Single user by id"],
      ["GET", "/users/search?q=bangalore", "Search by name, email, city or company"],
      ["POST", "/users", "Simulated create — echoes your body with a new id"],
    ],
  },
  {
    name: "Products",
    desc: "60 products across 6 categories with prices, ratings, stock and thumbnails.",
    endpoints: [
      ["GET", "/products?limit=3", "All products (paginated)"],
      ["GET", "/products/12", "Single product"],
      ["GET", "/products/search?q=keyboard", "Search by title, category or brand"],
      ["GET", "/products?limit=10&skip=10", "Pagination — perfect for infinite scroll practice"],
      ["DELETE", "/products/12", "Simulated delete"],
    ],
  },
  {
    name: "Todos",
    desc: "40 developer-flavoured todos with completed flags and user ids.",
    endpoints: [
      ["GET", "/todos?limit=3", "All todos"],
      ["GET", "/todos/7", "Single todo"],
      ["PUT", "/todos/7", "Simulated update — toggle completed!"],
    ],
  },
  {
    name: "Posts",
    desc: "40 blog posts about JavaScript & React topics, with tags and likes.",
    endpoints: [
      ["GET", "/posts?limit=3", "All posts"],
      ["GET", "/posts/search?q=hooks", "Search titles & bodies"],
      ["GET", "/posts/3", "Single post"],
    ],
  },
  {
    name: "Quotes",
    desc: "20 classic programming quotes.",
    endpoints: [
      ["GET", "/quotes?limit=3", "All quotes"],
      ["GET", "/quotes/random", "One random quote — great for a quote widget"],
    ],
  },
];

const EXAMPLE = `// ✅ Every endpoint is FREE — no login, no key, no token.
// Works from any origin (CORS open). Paste this in your React app,
// Node script, browser console or Postman:

fetch("${BASE}/products?limit=5")
  .then((res) => res.json())
  .then((data) => console.log(data.products));

// async/await style
const res = await fetch("${BASE}/users/5");
const user = await res.json();

// search + pagination — great for debounce & infinite scroll practice
fetch("${BASE}/products/search?q=keyboard")
  .then((r) => r.json()).then(console.log);
fetch("${BASE}/posts?limit=10&skip=10")
  .then((r) => r.json()).then(console.log);

// simulated POST (echoes back, nothing persists)
await fetch("${BASE}/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ firstName: "Yaso", city: "Bangalore" }),
});`;

export default function ApiDocs() {
  const [openPath, setOpenPath] = useState(null);
  const [responses, setResponses] = useState({}); // path -> { loading, text, status }
  const [copiedKey, setCopiedKey] = useState(null);

  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }

  async function tryEndpoint(path) {
    if (openPath === path) return setOpenPath(null); // toggle closed
    setOpenPath(path);
    if (responses[path]?.text) return; // cached

    setResponses((r) => ({ ...r, [path]: { loading: true } }));
    try {
      const res = await fetch(`${BASE}${path}`);
      const data = await res.json().catch(() => ({}));
      setResponses((r) => ({
        ...r,
        [path]: {
          loading: false,
          status: res.status,
          text: JSON.stringify(data, null, 2).slice(0, 3000),
        },
      }));
    } catch (err) {
      setResponses((r) => ({
        ...r,
        [path]: { loading: false, status: 0, text: "Network error: " + err.message },
      }));
    }
  }

  return (
    <div className="page apidocs-page">
      <h1>🔌 DevPrep Free API</h1>
      <p className="page-sub">
        A 100% free fake REST API for your practice projects — like dummyjson, built into
        DevPrep. <strong>No login, no key, no token</strong> — CORS open to every origin, so
        it works from localhost, CodePen, Postman, anywhere. Click <strong>▼ try</strong> on
        any GET endpoint to see the live JSON, or <strong>📋</strong> to copy the full URL.
      </p>

      {/* base url */}
      <div className="api-base">
        <span className="api-base-label">BASE URL</span>
        <code>{BASE}</code>
        <button className="btn btn-outline" onClick={() => copy(BASE, "base")}>
          {copiedKey === "base" ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      {/* quick start */}
      <h2 className="api-h2">Quick start</h2>
      <div className="api-example-wrap">
        <button
          className="btn btn-outline api-example-copy"
          onClick={() => copy(EXAMPLE, "example")}
        >
          {copiedKey === "example" ? "✓ Copied" : "📋 Copy"}
        </button>
        <pre className="code-block">{EXAMPLE}</pre>
      </div>

      {/* endpoints */}
      <h2 className="api-h2">Endpoints</h2>
      {SECTIONS.map((section) => (
        <div className="api-section" key={section.name}>
          <h3>
            {section.name} <span className="api-tier free">FREE</span>
          </h3>
          <p className="api-section-desc">{section.desc}</p>

          <div className="api-endpoints">
            {section.endpoints.map(([method, path, desc]) => {
              const isOpen = openPath === path;
              const resp = responses[path];
              const fullUrl = `${BASE}${path}`;
              const copyKey = method + path;
              return (
                <div key={copyKey}>
                  <div
                    className={`api-row ${isOpen ? "open" : ""}`}
                    onClick={() => method === "GET" && tryEndpoint(path)}
                    style={{ cursor: method === "GET" ? "pointer" : "default" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && method === "GET") tryEndpoint(path);
                    }}
                  >
                    <span className={`api-method ${method.toLowerCase()}`}>{method}</span>
                    <span className="api-path" title={fullUrl}>{fullUrl}</span>
                    <span className="api-desc">{desc}</span>
                    <button
                      className="api-copy"
                      title="Copy full URL"
                      onClick={(e) => {
                        e.stopPropagation();
                        copy(fullUrl, copyKey);
                      }}
                    >
                      {copiedKey === copyKey ? "✓ Copied" : "📋"}
                    </button>
                    {method === "GET" && (
                      <span className="api-expand">{isOpen ? "▲" : "▼ try"}</span>
                    )}
                  </div>

                  {isOpen && (
                    <pre className={`api-json ${resp?.status >= 400 ? "error" : ""}`}>
                      {resp?.loading
                        ? "⏳ Fetching…"
                        : `HTTP ${resp?.status}\n${resp?.text || ""}`}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="api-notes">
        <h3>📌 Good to know</h3>
        <ul>
          <li><strong>Everything is free</strong> — no auth, no key, no rate-limit worries for practice. Copy any URL and call it from any app, browser console, Postman or curl.</li>
          <li>Every list endpoint supports <code>?limit=</code> and <code>?skip=</code> (max 100) — responses include <code>total</code> for pagination and infinite scroll.</li>
          <li>Search endpoints (<code>/search?q=</code>) are perfect for practising debounced search inputs.</li>
          <li>POST / PUT / DELETE are <strong>simulated</strong>: they echo your data with <code>isSimulated: true</code>, nothing persists — safe to hammer from tutorials.</li>
          <li>Data is deterministic — the same ids return the same records every time.</li>
        </ul>
      </div>
    </div>
  );
}
