import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { REACT_CHALLENGES } from "../data/reactLab.js";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CODE_KEY = "devprep-reactlab-code";
const DEPS_KEY = "devprep-reactlab-deps";
// first 2 challenges are free — the rest need a (free) account
const FREE_IDS = new Set(REACT_CHALLENGES.slice(0, 2).map((c) => c.id));

// Packages with optimized UMD bundles. Anything else loads from esm.sh.
const KNOWN_PACKAGES = {
  axios: { url: "https://unpkg.com/axios@1.7.7/dist/axios.min.js", version: "1.7.7" },
  lodash: { url: "https://unpkg.com/lodash@4.17.21/lodash.min.js", version: "4.17.21" },
  "react-router-dom": { url: "https://unpkg.com/react-router-dom@6.26.2/dist/umd/react-router-dom.production.min.js", version: "6.26.2" },
  dayjs: { url: "https://unpkg.com/dayjs@1.11.13/dayjs.min.js", version: "1.11.13" },
};
const DEFAULT_DEPS = ["axios", "react-router-dom", "lodash"];

const SB_PREFIX = "rl-sb-";
const SANDBOX_TEMPLATE = `const { useState } = React;

function App() {
  const [msg] = useState("Build anything here! 🚀");

  return (
    <div>
      <h2>⚛️ My Sandbox</h2>
      <p>{msg}</p>
      <p>
        Preinstalled packages — import them normally:<br />
        <code>import axios from "axios"</code><br />
        <code>import {"{ MemoryRouter, Routes, Route, Link }"} from "react-router-dom"</code><br />
        <code>import _ from "lodash"</code>
      </p>
    </div>
  );
}`;

function sandboxToChallenge(id) {
  return {
    id,
    title: id.slice(SB_PREFIX.length).replace(/-/g, " "),
    isSandbox: true,
    starter: SANDBOX_TEMPLATE,
    solution: SANDBOX_TEMPLATE,
    asked: "",
    approach: [],
  };
}

// The sandbox runs code as a plain script, so `import` statements would crash.
// Map imports of preinstalled packages to their CDN globals; strip the rest.
function transformImports(code) {
  return code
    .replace(/import\s+React\s*,\s*\{([^}]*)\}\s*from\s*['"]react['"];?/g, "const {$1} = React;")
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]react['"];?/g, "const {$1} = React;")
    .replace(/import\s+React\s+from\s*['"]react['"];?/g, "")
    .replace(/import\s+ReactDOM\s+from\s*['"]react-dom(\/client)?['"];?/g, "")
    // packages with UMD globals 📦
    .replace(/import\s+(\w+)\s+from\s*['"]axios['"];?/g, "const $1 = window.axios;")
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]react-router-dom['"];?/g, "const {$1} = window.__RRD;")
    .replace(/import\s+(\w+)\s+from\s*['"]lodash['"];?/g, "const $1 = window._;")
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]lodash['"];?/g, "const {$1} = window._;")
    .replace(/import\s+(\w+)\s+from\s*['"]dayjs['"];?/g, "const $1 = window.dayjs;")
    // any OTHER npm package → load on the fly from esm.sh (like a real install)
    .replace(/import\s+(\w+)\s*,\s*\{([^}]*)\}\s*from\s*['"]([^'".][^'"]*)['"];?/g,
      'const { default: $1, $2 } = await import("https://esm.sh/$3");')
    .replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'".][^'"]*)['"];?/g,
      'const $1 = await import("https://esm.sh/$2");')
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]([^'".][^'"]*)['"];?/g,
      'const {$1} = await import("https://esm.sh/$2");')
    .replace(/import\s+(\w+)\s+from\s*['"]([^'".][^'"]*)['"];?/g,
      'const $1 = await import("https://esm.sh/$2").then(m => m.default ?? m);')
    .replace(/export\s+default\s+/g, "")
    .replace(/^\s*export\s+/gm, "");
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(CODE_KEY)) || {};
  } catch {
    return {};
  }
}

const diffClass = (d) => (d === "easy" ? "basic" : d === "medium" ? "intermediate" : "advanced");

// Build the sandboxed page: React 18 + Babel (pinned versions, classic JSX
// runtime — automatic runtime would inject an `import`, which crashes plain scripts).
function buildSrcDoc(rawCode, deps = DEFAULT_DEPS) {
  const code = transformImports(rawCode)
    .replace(/<\/script/gi, "<\\/script"); // don't let user code close our tag
  const depScripts = deps
    .filter((d) => KNOWN_PACKAGES[d])
    .map((d) => `<script src="${KNOWN_PACKAGES[d].url}"><\/script>`)
    .join("\n");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"><\/script>
<!-- dependencies 📦 -->
${depScripts}
<script>
  // BrowserRouter can't manage the URL inside a sandboxed preview —
  // alias it to MemoryRouter so router code works unchanged.
  window.__RRD = window.ReactRouterDOM
    ? Object.assign({}, window.ReactRouterDOM, { BrowserRouter: window.ReactRouterDOM.MemoryRouter })
    : {};
<\/script>
<style>
  body { font-family: system-ui, sans-serif; padding: 18px; margin: 0; color: #111827; background: #ffffff; }
  button { cursor: pointer; padding: 6px 12px; border-radius: 8px; border: 1px solid #d1d5db; background: #f9fafb; }
  button:hover { background: #f3f4f6; }
  input, select { padding: 6px 10px; border-radius: 8px; border: 1px solid #d1d5db; }
  h1, h2, h3 { margin-top: 0; }
</style>
</head>
<body>
<div id="root"><p style="color:#9ca3af">Rendering…</p></div>
<script type="text/plain" id="__user_code">${code}<\/script>
<script>
  const __send = (level, args) => {
    try {
      parent.postMessage({
        source: "devprep-react-lab",
        level,
        text: args.map(a => {
          if (typeof a === "string") return a;
          try { return JSON.stringify(a); } catch { return String(a); }
        }).join(" "),
      }, "*");
    } catch {}
  };
  ["log","info","warn","error"].forEach(l => {
    const orig = console[l].bind(console);
    console[l] = (...a) => { __send(l, a); orig(...a); };
  });
  const __fail = (msg) => {
    __send("error", [String(msg)]);
    document.getElementById("root").innerHTML =
      '<pre style="color:#dc2626;white-space:pre-wrap;">❌ ' + String(msg) + "</pre>";
  };
  window.onerror = (msg, src, line) => __fail(msg + " (line " + line + ")");

  window.addEventListener("DOMContentLoaded", async () => {
    const source = document.getElementById("__user_code").textContent;
    try {
      // classic runtime → JSX compiles to React.createElement (no imports injected)
      const compiled = Babel.transform(source, {
        presets: [["react", { runtime: "classic" }]],
        filename: "app.jsx",
      }).code;

      // async wrapper so esm.sh packages can be awaited at top level
      const runner = new Function(
        '"use strict"; return (async () => {\\n' + compiled +
        "\\n;return (typeof App === 'undefined') ? undefined : App;\\n})()"
      );
      const AppComponent = await runner();

      if (typeof AppComponent === "function") {
        ReactDOM.createRoot(document.getElementById("root"))
          .render(React.createElement(AppComponent));
      } else {
        document.getElementById("root").innerHTML =
          '<p style="color:#dc2626">Define <b>function App() { ... }</b> — the sandbox mounts it automatically.</p>';
      }
    } catch (err) {
      __fail(err.message);
    }
  });
<\/script>
</body>
</html>`;
}

function loadDeps() {
  try {
    return JSON.parse(localStorage.getItem(DEPS_KEY)) || {};
  } catch {
    return {};
  }
}

export default function ReactLab() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(loadSaved);
  const [depsMap, setDepsMap] = useState(loadDeps);
  const [depInput, setDepInput] = useState("");
  const [active, setActive] = useState(null); // challenge or null (browse)
  const [code, setCode] = useState("");
  const [showingSolution, setShowingSolution] = useState(false);
  const [briefOpen, setBriefOpen] = useState(true);
  const [srcDoc, setSrcDoc] = useState("");
  const [runId, setRunId] = useState(0);
  const [logs, setLogs] = useState([]);
  const [synced, setSynced] = useState(false);
  const [lockedChallenge, setLockedChallenge] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const myCodeRef = useRef(""); // user's code while viewing solution
  const syncTimers = useRef({});

  // local cache (also the guest fallback)
  useEffect(() => {
    localStorage.setItem(CODE_KEY, JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    localStorage.setItem(DEPS_KEY, JSON.stringify(depsMap));
  }, [depsMap]);

  function getDeps(item) {
    if (!item?.isSandbox) return DEFAULT_DEPS;
    return depsMap[item.id] ?? DEFAULT_DEPS;
  }

  function saveDeps(sandboxId, deps) {
    setDepsMap((m) => ({ ...m, [sandboxId]: deps }));
    if (user) {
      api(`/code/${sandboxId}::deps`, {
        method: "PUT", auth: true, body: { code: JSON.stringify(deps) },
      }).catch(() => {});
    }
  }

  function addDep(name) {
    const pkg = name.trim().toLowerCase();
    if (!pkg || !active?.isSandbox) return;
    const deps = getDeps(active);
    if (deps.includes(pkg)) return setDepInput("");
    const next = [...deps, pkg];
    saveDeps(active.id, next);
    setDepInput("");
    run(code, next); // re-run with the new dependency loaded
  }

  function removeDep(pkg) {
    if (!active?.isSandbox) return;
    const next = getDeps(active).filter((d) => d !== pkg);
    saveDeps(active.id, next);
    run(code, next);
  }

  // logged in → load saved code + deps from the SERVER (server wins over local cache)
  useEffect(() => {
    if (!user) return;
    api("/code", { auth: true })
      .then((serverMap) => {
        const mine = {};
        const deps = {};
        for (const [id, c] of Object.entries(serverMap)) {
          if (id.endsWith("::deps")) {
            try { deps[id.replace("::deps", "")] = JSON.parse(c); } catch {}
          } else if (id.startsWith("rl-")) {
            mine[id] = c;
          }
        }
        setSaved((local) => ({ ...local, ...mine }));
        setDepsMap((local) => ({ ...local, ...deps }));
        setSynced(true);
      })
      .catch(() => {});
  }, [user]);

  // debounced push to server while typing
  function syncRemote(itemId, value) {
    if (!user) return;
    clearTimeout(syncTimers.current[itemId]);
    syncTimers.current[itemId] = setTimeout(() => {
      api(`/code/${itemId}`, { method: "PUT", auth: true, body: { code: value } }).catch(() => {});
    }, 1500);
  }

  // receive console output from the iframe
  useEffect(() => {
    function onMessage(e) {
      if (e.data?.source !== "devprep-react-lab") return;
      setLogs((l) => [...l.slice(-99), { level: e.data.level, text: e.data.text }]);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function open(ch) {
    if (!user && !FREE_IDS.has(ch.id)) {
      setLockedChallenge(ch);
      return;
    }
    setActive(ch);
    setShowingSolution(false);
    setBriefOpen(true);
    const initial = saved[ch.id] ?? ch.starter;
    setCode(initial);
    setLogs([]);
    setSrcDoc(buildSrcDoc(initial, ch.isSandbox ? depsMap[ch.id] ?? DEFAULT_DEPS : DEFAULT_DEPS));
    setRunId((r) => r + 1);
  }

  const sandboxIds = Object.keys(saved).filter((id) => id.startsWith(SB_PREFIX));

  function newSandbox() {
    if (!user) {
      setLockedChallenge({ id: "new-sandbox", title: "New Sandbox", difficulty: "easy" });
      return;
    }
    // auto-name: sandbox-1, sandbox-2, … (no popups)
    let n = 1;
    while (saved[`${SB_PREFIX}sandbox-${n}`]) n++;
    const id = `${SB_PREFIX}sandbox-${n}`;
    setSaved((s) => ({ ...s, [id]: SANDBOX_TEMPLATE }));
    saveDeps(id, DEFAULT_DEPS);
    syncRemote(id, SANDBOX_TEMPLATE);
    open(sandboxToChallenge(id));
  }

  function deleteSandbox(id, e) {
    if (e) e.stopPropagation();
    setSaved((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
    setDepsMap((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });
    if (user) {
      api(`/code/${id}`, { method: "DELETE", auth: true }).catch(() => {});
      api(`/code/${id}::deps`, { method: "DELETE", auth: true }).catch(() => {});
    }
    if (active?.id === id) setActive(null); // back to browse if it was open
  }

  function startRename() {
    if (!active?.isSandbox) return;
    setRenameValue(active.id.slice(SB_PREFIX.length).replace(/-/g, " "));
    setRenaming(true);
  }

  function commitRename() {
    setRenaming(false);
    if (!active?.isSandbox) return;
    const slug = renameValue.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) return;
    let newId = SB_PREFIX + slug;
    if (newId === active.id) return;
    let n = 2;
    while (saved[newId]) newId = `${SB_PREFIX}${slug}-${n++}`; // avoid collisions

    const oldId = active.id;
    const currentCode = code;
    const currentDeps = getDeps(active);

    // move locally
    setSaved((s) => {
      const next = { ...s, [newId]: currentCode };
      delete next[oldId];
      return next;
    });
    setDepsMap((m) => {
      const next = { ...m, [newId]: currentDeps };
      delete next[oldId];
      return next;
    });
    // move on the server
    if (user) {
      clearTimeout(syncTimers.current[oldId]);
      api(`/code/${newId}`, { method: "PUT", auth: true, body: { code: currentCode } }).catch(() => {});
      api(`/code/${newId}::deps`, { method: "PUT", auth: true, body: { code: JSON.stringify(currentDeps) } }).catch(() => {});
      api(`/code/${oldId}`, { method: "DELETE", auth: true }).catch(() => {});
      api(`/code/${oldId}::deps`, { method: "DELETE", auth: true }).catch(() => {});
    }
    setActive(sandboxToChallenge(newId));
  }

  function run(source = code, deps = null) {
    setLogs([]);
    setSrcDoc(buildSrcDoc(source, deps ?? getDeps(active)));
    setRunId((r) => r + 1);
  }

  function onEdit(value) {
    const v = value ?? "";
    setCode(v);
    if (!showingSolution && active) {
      setSaved((s) => ({ ...s, [active.id]: v }));
      syncRemote(active.id, v); // persists to your account
    }
  }

  function toggleSolution() {
    if (!active) return;
    if (showingSolution) {
      // back to my code
      setShowingSolution(false);
      setCode(myCodeRef.current);
      run(myCodeRef.current);
    } else {
      myCodeRef.current = code;
      setShowingSolution(true);
      setCode(active.solution);
      run(active.solution);
    }
  }

  function reset() {
    if (!active) return;
    setSaved((s) => {
      const next = { ...s };
      delete next[active.id];
      return next;
    });
    if (user) {
      clearTimeout(syncTimers.current[active.id]);
      api(`/code/${active.id}`, { method: "DELETE", auth: true }).catch(() => {});
    }
    setShowingSolution(false);
    setCode(active.starter);
    run(active.starter);
  }

  /* ============ LOCK SCREEN ============ */
  if (lockedChallenge) {
    return (
      <div className="page">
        <button className="back-link" onClick={() => setLockedChallenge(null)}>← All challenges</button>
        <div className="lock-screen">
          <div className="lock-glow" />
          <div className="lock-icon">🔒</div>
          <span className={`level-badge ${diffClass(lockedChallenge.difficulty)}`}>
            {lockedChallenge.difficulty}
          </span>
          <h1>{lockedChallenge.title}</h1>
          <p className="lock-msg">
            The first 2 challenges are free. Create a <strong>free account</strong> to unlock
            all {REACT_CHALLENGES.length} React machine-coding challenges — with your code
            saved to your account.
          </p>
          <div className="lock-actions">
            <Link to="/login" className="btn btn-primary btn-lg">Login to Unlock</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create Free Account</Link>
          </div>
          <p className="lock-hint">✨ Free forever — just verify your email.</p>
        </div>
      </div>
    );
  }

  /* ============ BROWSE ============ */
  if (!active) {
    return (
      <div className="pgb">
        <div className="pgb-head">
          <h1>⚛️ React Lab</h1>
          <p>
            The React machine-coding round, live — write the component, hit Run, and see
            the real UI render beside your code. Read how it's asked, plan your approach,
            build it, then compare with the solution.
          </p>
        </div>

        {/* my sandboxes */}
        <div className="pgb-myfiles-head">
          <h2>📦 My Sandboxes</h2>
          <button className="btn btn-primary" onClick={newSandbox}>＋ New Sandbox</button>
        </div>
        <div className="pgb-grid" style={{ marginBottom: 40 }}>
          {sandboxIds.length === 0 && (
            <p className="empty">
              Blank React projects with a dependencies panel — add axios, dayjs, uuid
              or almost any npm package, and build anything.
            </p>
          )}
          {sandboxIds.map((id) => (
            <button className="pgb-card mine" key={id} onClick={() => open(sandboxToChallenge(id))}>
              <div className="pgb-card-top">
                <span className="pg-file-icon mine">⚛</span>
                <span style={{ display: "flex", gap: 8 }}>
                  <span
                    className="pg-file-delete sb-card-edit"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(sandboxToChallenge(id));
                      setTimeout(() => {
                        setRenameValue(id.slice(SB_PREFIX.length).replace(/-/g, " "));
                        setRenaming(true);
                      }, 0);
                    }}
                  >
                    ✏️
                  </span>
                  <span className="pg-file-delete" onClick={(e) => deleteSandbox(id, e)} title="Delete">×</span>
                </span>
              </div>
              <h3>{id.slice(SB_PREFIX.length).replace(/-/g, " ")}</h3>
              <p>Your sandbox project</p>
              <div className="pgb-card-foot">
                <span>📦 {(depsMap[id] ?? DEFAULT_DEPS).length + 2} dependencies</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pgb-myfiles-head">
          <h2>🏆 Challenges</h2>
        </div>
        <div className="pgb-grid">
          {REACT_CHALLENGES.map((ch, i) => {
            const locked = !user && !FREE_IDS.has(ch.id);
            return (
              <button className={`pgb-card ${locked ? "locked" : ""}`} key={ch.id} onClick={() => open(ch)}>
                <div className="pgb-card-top">
                  <span className="pgb-num">#{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {locked && <span className="lock-badge">🔒</span>}
                    {!user && FREE_IDS.has(ch.id) && <span className="free-badge">FREE</span>}
                    <span className={`level-badge ${diffClass(ch.difficulty)}`}>{ch.difficulty}</span>
                  </span>
                </div>
                <h3>{ch.title}</h3>
                <p>{ch.asked.split(".")[0]}.</p>
                <div className="pgb-card-foot">
                  <span>⚛️ live preview</span>
                  {saved[ch.id] && <span className="pgb-started">✓ started</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ============ WORK MODE ============ */
  return (
    <div className="pgw">
      <div className="pgw-topbar">
        <button className="pgw-back" onClick={() => setActive(null)}>←</button>
        <span className="pg-tab-icon" style={{ color: "#61dafb", background: "rgba(97,218,251,0.12)" }}>⚛</span>
        {active.isSandbox && renaming ? (
          <input
            className="sb-rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            autoFocus
          />
        ) : (
          <span
            className={`pgw-title ${active.isSandbox ? "sb-renamable" : ""}`}
            onClick={active.isSandbox ? startRename : undefined}
            title={active.isSandbox ? "Click to rename" : undefined}
          >
            {active.title} {active.isSandbox && <span className="sb-edit-hint">✏️</span>}
          </span>
        )}
        {active.isSandbox ? (
          <span className="free-badge">📦 SANDBOX</span>
        ) : (
          <span className={`level-badge ${diffClass(active.difficulty)}`}>{active.difficulty}</span>
        )}
        {showingSolution && <span className="rlab-solution-flag">👀 viewing solution</span>}
        {user && synced && !showingSolution && (
          <span className="rlab-sync" title="Your code auto-saves to your account">☁ synced</span>
        )}
        <div className="pgw-actions">
          <button className={`btn btn-outline pgw-brief-btn ${briefOpen ? "on" : ""}`} onClick={() => setBriefOpen(!briefOpen)}>
            {active.isSandbox
              ? `📦 ${briefOpen ? "Hide" : "Show"} deps`
              : `📋 ${briefOpen ? "Hide" : "Show"} brief`}
          </button>
          <button className="btn btn-ghost" onClick={reset}>↺ Reset</button>
          {active.isSandbox && (
            <button className="btn btn-ghost sb-delete-btn" onClick={() => deleteSandbox(active.id)}>
              🗑 Delete
            </button>
          )}
          {!active.isSandbox && (
            <button className={`btn ${showingSolution ? "btn-primary" : "btn-outline"}`} onClick={toggleSolution}>
              {showingSolution ? "← My code" : "💡 Solution"}
            </button>
          )}
          <button className="btn btn-run" onClick={() => run()}>▶ Run</button>
        </div>
      </div>

      <div className="pgw-body">
        {/* dependencies panel — sandboxes only */}
        {briefOpen && active.isSandbox && (
          <aside className="pgw-brief deps-panel">
            <div className="pg-problem-section">
              <h5>📦 Dependencies</h5>
              <div className="dep-add">
                <input
                  value={depInput}
                  onChange={(e) => setDepInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDep(depInput)}
                  placeholder="Add package… (e.g. dayjs, uuid)"
                />
                <button className="btn btn-primary" onClick={() => addDep(depInput)}>＋</button>
              </div>

              <div className="dep-list">
                <div className="dep-row locked">
                  <span className="dep-name">react</span>
                  <span className="dep-version">^18.3.1</span>
                </div>
                <div className="dep-row locked">
                  <span className="dep-name">react-dom</span>
                  <span className="dep-version">^18.3.1</span>
                </div>
                {getDeps(active).map((d) => (
                  <div className="dep-row" key={d}>
                    <span className="dep-name">{d}</span>
                    <span className="dep-version">{KNOWN_PACKAGES[d]?.version ?? "esm.sh"}</span>
                    <button className="dep-remove" onClick={() => removeDep(d)} title="Remove">🗑</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pg-problem-section">
              <h5>ℹ️ How it works</h5>
              <p className="pg-problem-statement">
                Import any listed package normally. Packages without an optimized
                bundle load on-demand from esm.sh when you import them — most npm
                packages just work. Hit ▶ Run after changes.
              </p>
            </div>
          </aside>
        )}

        {/* brief — challenges only */}
        {briefOpen && !active.isSandbox && (
          <aside className="pgw-brief">
            <div className="pg-problem-section">
              <h5>🗣 How it's asked</h5>
              <p className="pg-problem-statement">{active.asked}</p>
            </div>
            <div className="pg-problem-section">
              <h5>🧠 How to approach it</h5>
              <ol className="pg-req-list rlab-approach">
                {active.approach.map((a) => <li key={a}>{a}</li>)}
              </ol>
            </div>
            <div className="pg-problem-section">
              <h5>📏 Sandbox rules</h5>
              <p className="pg-problem-statement">
                Define <strong>function App()</strong> — it mounts automatically.{"\n"}
                Hooks: <code>const {"{ useState }"} = React;</code> or import from "react".{"\n"}
                📦 Preinstalled: <strong>axios</strong>, <strong>react-router-dom</strong>, <strong>lodash</strong> — import them normally.{"\n"}
                Hit <strong>▶ Run</strong> to refresh the preview.
              </p>
            </div>
          </aside>
        )}

        {/* editor */}
        <div className="rlab-editor">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={onEdit}
            options={{
              fontSize: 13.5,
              fontFamily: "JetBrains Mono, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              tabSize: 2,
              wordWrap: "on",
            }}
          />
        </div>

        {/* live preview */}
        <div className="rlab-preview">
          <div className="rlab-preview-title">
            <span>PREVIEW</span>
            <span className="rlab-live">● live</span>
          </div>
          <iframe
            key={runId}
            title="React preview"
            className="rlab-iframe"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={srcDoc}
          />
          <div className="rlab-console">
            <div className="rlab-console-title">
              <span>CONSOLE</span>
              <button className="pg-clear" onClick={() => setLogs([])}>🗑 clear</button>
            </div>
            <div className="rlab-console-body">
              {logs.length === 0 && <span className="pg-term-placeholder">console.log output appears here…</span>}
              {logs.map((l, i) => (
                <div key={i} className={`pg-term-line ${l.level}`}>{l.text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
