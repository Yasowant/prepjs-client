import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api/v1`;

const SECTIONS = [
  {
    name: "Users",
    locked: false,
    desc: "50 dummy users with names, emails, cities, companies and avatar URLs.",
    endpoints: [
      ["GET", "/users?limit=3", "All users (paginated)"],
      ["GET", "/users/5", "Single user by id"],
      ["GET", "/users/search?q=bangalore", "Search by name, email, city or company"],
      ["POST", "/users", "Simulated create — echoes your body with a new id"],
    ],
  },
  {
    name: "Quotes",
    locked: false,
    desc: "20 classic programming quotes.",
    endpoints: [
      ["GET", "/quotes?limit=3", "All quotes"],
      ["GET", "/quotes/random", "One random quote — great for a quote widget"],
    ],
  },
  {
    name: "Products",
    locked: true,
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
    locked: true,
    desc: "40 developer-flavoured todos with completed flags and user ids.",
    endpoints: [
      ["GET", "/todos?limit=3", "All todos"],
      ["GET", "/todos/7", "Single todo"],
      ["PUT", "/todos/7", "Simulated update — toggle completed!"],
    ],
  },
  {
    name: "Posts",
    locked: true,
    desc: "40 blog posts about JavaScript & React topics, with tags and likes.",
    endpoints: [
      ["GET", "/posts?limit=3", "All posts"],
      ["GET", "/posts/search?q=hooks", "Search titles & bodies"],
      ["GET", "/posts/3", "Single post"],
    ],
  },
];

const EXAMPLE = `// FREE endpoints — work from any origin, no key needed
fetch("${BASE}/users?limit=5")
  .then((res) => res.json())
  .then((data) => console.log(data.users));

// LOGIN-REQUIRED endpoints — send your DevPrep token
fetch("${BASE}/products?limit=5", {
  headers: { Authorization: "Bearer <your-access-token>" },
}).then((res) => res.json()).then(console.log);

// simulated POST (echoes back, nothing persists)
await fetch("${BASE}/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ firstName: "Yaso", city: "Bangalore" }),
});`;

export default function ApiDocs() {
  const { user } = useAuth();
  const [openPath, setOpenPath] = useState(null);
  const [responses, setResponses] = useState({}); // path -> { loading, text, status }
  const [copied, setCopied] = useState(false);

  async function tryEndpoint(path, locked) {
    if (openPath === path) return setOpenPath(null); // toggle closed
    setOpenPath(path);
    if (responses[path]?.text) return; // cached

    setResponses((r) => ({ ...r, [path]: { loading: true } }));
    try {
      const headers = {};
      const token = localStorage.getItem("accessToken");
      if (locked && token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${BASE}${path}`, { headers });
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
        A fake REST API for your practice projects — like dummyjson, built into DevPrep.
        CORS open to every origin. <strong>Users & Quotes are free</strong>; Products,
        Todos & Posts need a free DevPrep account. Click any GET endpoint to see the
        live JSON response right here.
      </p>

      {/* base url */}
      <div className="api-base">
        <span className="api-base-label">BASE URL</span>
        <code>{BASE}</code>
        <button className="btn btn-outline" onClick={copyBase}>
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      {/* quick start */}
      <h2 className="api-h2">Quick start</h2>
      <pre className="code-block">{EXAMPLE}</pre>

      {/* endpoints */}
      <h2 className="api-h2">Endpoints</h2>
      {SECTIONS.map((section) => (
        <div className="api-section" key={section.name}>
          <h3>
            {section.name}{" "}
            {section.locked ? (
              <span className="api-tier locked">🔒 login required</span>
            ) : (
              <span className="api-tier free">FREE</span>
            )}
          </h3>
          <p className="api-section-desc">{section.desc}</p>

          {section.locked && !user && (
            <p className="api-login-hint">
              <Link to="/register">Create a free account</Link> to unlock — then requests
              from this page include your token automatically.
            </p>
          )}

          <div className="api-endpoints">
            {section.endpoints.map(([method, path, desc]) => {
              const isOpen = openPath === path;
              const resp = responses[path];
              return (
                <div key={method + path}>
                  <button
                    className={`api-row ${isOpen ? "open" : ""}`}
                    onClick={() => method === "GET" && tryEndpoint(path, section.locked)}
                    style={{ width: "100%", cursor: method === "GET" ? "pointer" : "default" }}
                  >
                    <span className={`api-method ${method.toLowerCase()}`}>{method}</span>
                    <span className="api-path">/api/v1{path}</span>
                    <span className="api-desc">{desc}</span>
                    {method === "GET" && (
                      <span className="api-expand">{isOpen ? "▲" : "▼ try"}</span>
                    )}
                  </button>

                  {isOpen && (
                    <pre className={`api-json ${resp?.status >= 400 ? "error" : ""}`}>
                      {resp?.loading
                        ? "⏳ Fetching…"
                        : `HTTP ${resp?.status}\n${resp?.text || ""}`}
                      {resp?.status === 401 && (
                        <span className="api-json-hint">
                          {"\n\n"}🔒 This endpoint needs login — {user
                            ? "your session may have expired, try re-logging in."
                            : "log in to DevPrep and this page will send your token automatically."}
                        </span>
                      )}
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
          <li><strong>Free tier:</strong> Users & Quotes — no auth, use them from any app or origin.</li>
          <li><strong>Login tier:</strong> Products, Todos & Posts — send <code>Authorization: Bearer &lt;token&gt;</code> from a free DevPrep account.</li>
          <li>Every list endpoint supports <code>?limit=</code> and <code>?skip=</code> (max 100) — responses include <code>total</code> for pagination and infinite scroll.</li>
          <li>POST / PUT / DELETE are <strong>simulated</strong>: they echo your data with <code>isSimulated: true</code>, nothing persists.</li>
          <li>Data is deterministic — the same ids return the same records every time.</li>
        </ul>
      </div>
    </div>
  );
}
