import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ORIGIN = import.meta.env.VITE_API_URL || window.location.origin;
const BASE = `${ORIGIN}/api/v1`;

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

const FREE_EXAMPLE = `// ✅ FREE endpoints — no login, no key. Works from any origin (CORS open).
// Paste this in your React app, Node script, browser console or Postman:
fetch("${BASE}/users?limit=5")
  .then((res) => res.json())
  .then((data) => console.log(data.users));

fetch("${BASE}/quotes/random")
  .then((res) => res.json())
  .then(console.log);`;

const LOGIN_EXAMPLE = `// 🔒 LOGIN-REQUIRED endpoints from YOUR local project (React, Node, Postman…)

// Step 1 — login with your (free) DevPrep account to get a token:
const res = await fetch("${ORIGIN}/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "you@example.com",     // your DevPrep email
    password: "your-password",    // your DevPrep password
  }),
});
const { accessToken } = await res.json();

// Step 2 — call any 🔒 endpoint with the token:
const data = await fetch("${BASE}/products?limit=5", {
  headers: { Authorization: \`Bearer \${accessToken}\` },
}).then((r) => r.json());
console.log(data.products);

// Postman: Authorization tab → Bearer Token → paste your accessToken.
// Tokens expire in ~15 min — just run the login call again for a fresh one.`;

export default function ApiDocs() {
  const { user } = useAuth();
  const [openPath, setOpenPath] = useState(null);
  const [responses, setResponses] = useState({}); // path -> { loading, text, status }
  const [copiedKey, setCopiedKey] = useState(null);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;

  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }

  async function tryEndpoint(path, locked) {
    if (openPath === path) return setOpenPath(null); // toggle closed
    setOpenPath(path);
    if (responses[path]?.text) return; // cached

    setResponses((r) => ({ ...r, [path]: { loading: true } }));
    try {
      const headers = {};
      const freshToken = localStorage.getItem("accessToken");
      if (locked && freshToken) headers.Authorization = `Bearer ${freshToken}`;

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

  return (
    <div className="page apidocs-page">
      <h1>🔌 DevPrep Free API</h1>
      <p className="page-sub">
        A free fake REST API for your practice projects — like dummyjson, built into DevPrep.
        CORS open to every origin. <strong>Users & Quotes need NO login</strong> — copy any
        endpoint and use it straight away. Products, Todos & Posts need a free DevPrep account.
        Click <strong>▼ try</strong> on any GET endpoint to see the live JSON, or{" "}
        <strong>📋</strong> to copy the full URL.
      </p>

      {/* base url */}
      <div className="api-base">
        <span className="api-base-label">BASE URL</span>
        <code>{BASE}</code>
        <button className="btn btn-outline" onClick={() => copy(BASE, "base")}>
          {copiedKey === "base" ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      {/* your token (logged in only) */}
      {user && token && (
        <div className="api-token-box">
          <div className="api-token-head">
            <span>🔑 Your access token — use it in Postman / curl / your own code</span>
            <button className="btn btn-outline" onClick={() => copy(token, "token")}>
              {copiedKey === "token" ? "✓ Copied" : "📋 Copy token"}
            </button>
          </div>
          <code className="api-token-value">
            {token.slice(0, 42)}…{token.slice(-8)}
          </code>
          <p>
            Send it as <code>Authorization: Bearer &lt;token&gt;</code>. It expires in ~15 minutes —
            revisit this page for a fresh one, or login from your code (example below).
          </p>
        </div>
      )}

      {/* quick start */}
      <h2 className="api-h2">Quick start — no login needed</h2>
      <div className="api-example-wrap">
        <button
          className="btn btn-outline api-example-copy"
          onClick={() => copy(FREE_EXAMPLE, "free-ex")}
        >
          {copiedKey === "free-ex" ? "✓ Copied" : "📋 Copy"}
        </button>
        <pre className="code-block">{FREE_EXAMPLE}</pre>
      </div>

      <h2 className="api-h2">Using 🔒 endpoints from your local system</h2>
      <div className="api-example-wrap">
        <button
          className="btn btn-outline api-example-copy"
          onClick={() => copy(LOGIN_EXAMPLE, "login-ex")}
        >
          {copiedKey === "login-ex" ? "✓ Copied" : "📋 Copy"}
        </button>
        <pre className="code-block">{LOGIN_EXAMPLE}</pre>
      </div>

      {/* endpoints */}
      <h2 className="api-h2">Endpoints</h2>
      {SECTIONS.map((section) => (
        <div className="api-section" key={section.name}>
          <h3>
            {section.name}{" "}
            {section.locked ? (
              <span className="api-tier locked">🔒 login required</span>
            ) : (
              <span className="api-tier free">FREE — no login</span>
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
              const fullUrl = `${BASE}${path}`;
              const copyKey = method + path;
              return (
                <div key={copyKey}>
                  <div
                    className={`api-row ${isOpen ? "open" : ""}`}
                    onClick={() => method === "GET" && tryEndpoint(path, section.locked)}
                    style={{ cursor: method === "GET" ? "pointer" : "default" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && method === "GET") tryEndpoint(path, section.locked);
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
          <li><strong>Free tier:</strong> Users & Quotes — no auth, no key. Copy the URL and call it from any app, browser console, Postman or curl.</li>
          <li><strong>Login tier:</strong> Products, Todos & Posts — login via <code>POST {ORIGIN}/api/auth/login</code> to get an <code>accessToken</code>, then send <code>Authorization: Bearer &lt;token&gt;</code>. A DevPrep account is free.</li>
          <li>Tokens expire after ~15 minutes — run the login call again in your code for a fresh one (see the example above).</li>
          <li>Every list endpoint supports <code>?limit=</code> and <code>?skip=</code> (max 100) — responses include <code>total</code> for pagination and infinite scroll.</li>
          <li>POST / PUT / DELETE are <strong>simulated</strong>: they echo your data with <code>isSimulated: true</code>, nothing persists.</li>
          <li>Data is deterministic — the same ids return the same records every time.</li>
        </ul>
      </div>
    </div>
  );
}
