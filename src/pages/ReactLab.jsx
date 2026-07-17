import { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useActiveCode,
} from "@codesandbox/sandpack-react";
import { Link } from "react-router-dom";
import { REACT_CHALLENGES } from "../data/reactLab.js";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CODE_KEY = "devprep-reactlab-code";
const DEPS_KEY = "devprep-reactlab-deps";
// first 2 challenges are free — the rest need a (free) account
const FREE_IDS = new Set(REACT_CHALLENGES.slice(0, 2).map((c) => c.id));

const DEFAULT_DEPS = ["axios", "react-router-dom", "lodash"];

const SB_PREFIX = "rl-sb-";
const SANDBOX_TEMPLATE = `import React, { useState } from "react";

export default function App() {
  const [msg] = useState("Build anything here! 🚀");

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h2>⚛️ My Sandbox</h2>
      <p>{msg}</p>
      <p>
        This is a real bundler (the CodeSandbox engine) — install ANY npm
        package from the 📦 panel and import it normally. The preview
        hot-reloads as you type.
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

// Older DevPrep snippets were written for the legacy runtime (global React,
// auto-mounted App, no exports). Upgrade them so they run in a real bundler.
function modernize(src) {
  let out = String(src || "");
  const hasReactImport = /from\s+["']react["']/.test(out);
  if (!hasReactImport) {
    out = `import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";\n` + out;
    // drop legacy global destructuring that would now redeclare the hooks
    out = out.replace(/^\s*const\s*\{[^}]*\}\s*=\s*React;?\s*$/gm, "");
  }
  if (!/export\s+default/.test(out)) {
    if (/function\s+App\s*\(/.test(out) || /const\s+App\s*=/.test(out)) {
      out += `\n\nexport default App;`;
    }
  }
  return out;
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(CODE_KEY)) || {};
  } catch {
    return {};
  }
}

function loadDeps() {
  try {
    return JSON.parse(localStorage.getItem(DEPS_KEY)) || {};
  } catch {
    return {};
  }
}

const diffClass = (d) => (d === "easy" ? "basic" : d === "medium" ? "intermediate" : "advanced");

// reports edits from inside Sandpack's editor up to React Lab
function SandpackBridge({ onChange }) {
  const { code } = useActiveCode();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange(code);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function ReactLab() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(loadSaved);
  const [depsMap, setDepsMap] = useState(loadDeps);
  const [depInput, setDepInput] = useState("");
  const [active, setActive] = useState(null); // challenge or null (browse)
  const [code, setCode] = useState("");
  const [extVersion, setExtVersion] = useState(0); // bump → remount Sandpack (external code set)
  const [showingSolution, setShowingSolution] = useState(false);
  const [briefOpen, setBriefOpen] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [synced, setSynced] = useState(false);
  const [lockedChallenge, setLockedChallenge] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);
  const [submitState, setSubmitState] = useState(null); // null | "reviewing" | {result} | {error}
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const myCodeRef = useRef(""); // user's code while viewing solution
  const syncTimers = useRef({});
  const codeRef = useRef("");
  const activeRef = useRef(null);
  const prettierRef = useRef(null);
  const saveNowRef = useRef(() => {});
  const formatRef = useRef(() => {});

  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { activeRef.current = active; }, [active]);

  // which challenges has this user already solved?
  useEffect(() => {
    if (!user) return;
    api("/reactlab/summary", { auth: true })
      .then((d) => setSolvedIds(new Set(d.solved)))
      .catch(() => {});
  }, [user]);

  async function submitSolution() {
    if (!active || active.isSandbox || showingSolution) return;
    setSubmitState("reviewing");
    try {
      const data = await api("/reactlab/submit", {
        method: "POST",
        auth: true,
        body: { challengeId: active.id, title: active.title, asked: active.asked, code },
      });
      setSubmitState(data);
      if (data.passed) setSolvedIds((s) => new Set([...s, active.id]));
    } catch (err) {
      setSubmitState({ error: err.message });
    }
  }

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
    saveDeps(active.id, [...deps, pkg]);
    setDepInput("");
    setExtVersion((v) => v + 1); // remount bundler with the new dependency
  }

  function removeDep(pkg) {
    if (!active?.isSandbox) return;
    saveDeps(active.id, getDeps(active).filter((d) => d !== pkg));
    setExtVersion((v) => v + 1);
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
            try { deps[id.replace("::deps", "")] = JSON.parse(c); } catch { /* noop */ }
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

  function open(ch) {
    if (!user && !FREE_IDS.has(ch.id)) {
      setLockedChallenge(ch);
      return;
    }
    setActive(ch);
    setShowingSolution(false);
    setBriefOpen(true);
    setCode(modernize(saved[ch.id] ?? ch.starter));
    setExtVersion((v) => v + 1);
  }

  const sandboxIds = Object.keys(saved).filter((id) => id.startsWith(SB_PREFIX));

  function newSandbox() {
    if (!user) {
      setLockedChallenge({ id: "new-sandbox", title: "New Sandbox", difficulty: "easy" });
      return;
    }
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
    if (active?.id === id) setActive(null);
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
    while (saved[newId]) newId = `${SB_PREFIX}${slug}-${n++}`;

    const oldId = active.id;
    const currentCode = code;
    const currentDeps = getDeps(active);

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
    if (user) {
      clearTimeout(syncTimers.current[oldId]);
      api(`/code/${newId}`, { method: "PUT", auth: true, body: { code: currentCode } }).catch(() => {});
      api(`/code/${newId}::deps`, { method: "PUT", auth: true, body: { code: JSON.stringify(currentDeps) } }).catch(() => {});
      api(`/code/${oldId}`, { method: "DELETE", auth: true }).catch(() => {});
      api(`/code/${oldId}::deps`, { method: "DELETE", auth: true }).catch(() => {});
    }
    setActive(sandboxToChallenge(newId));
  }

  // edits coming from inside Sandpack's editor
  function onEdit(value) {
    const v = value ?? "";
    setCode(v);
    if (!showingSolution && activeRef.current) {
      setSaved((s) => ({ ...s, [activeRef.current.id]: v }));
      syncRemote(activeRef.current.id, v);
    }
  }

  function toggleSolution() {
    if (!active) return;
    if (showingSolution) {
      setShowingSolution(false);
      setCode(myCodeRef.current);
    } else {
      myCodeRef.current = code;
      setShowingSolution(true);
      setCode(modernize(active.solution));
    }
    setExtVersion((v) => v + 1);
  }

  function restart() {
    setExtVersion((v) => v + 1); // full bundler restart
  }

  /* ---------- Prettier format + Ctrl+S save ---------- */

  async function loadPrettier() {
    if (prettierRef.current) return prettierRef.current;
    const [prettier, babel, estree] = await Promise.all([
      import(/* @vite-ignore */ "https://esm.sh/prettier@3.3.3/standalone"),
      import(/* @vite-ignore */ "https://esm.sh/prettier@3.3.3/plugins/babel"),
      import(/* @vite-ignore */ "https://esm.sh/prettier@3.3.3/plugins/estree"),
    ]);
    prettierRef.current = {
      prettier: prettier.default ?? prettier,
      plugins: [babel.default ?? babel, estree.default ?? estree],
    };
    return prettierRef.current;
  }

  async function formatCode() {
    try {
      const { prettier, plugins } = await loadPrettier();
      const formatted = await prettier.format(codeRef.current, {
        parser: "babel", plugins, semi: true, singleQuote: false, tabWidth: 2, printWidth: 90,
      });
      onEdit(formatted);
      setExtVersion((v) => v + 1); // push formatted code into the editor
      return formatted;
    } catch {
      return null; // syntax error — Sandpack's overlay already shows it
    }
  }
  useEffect(() => { formatRef.current = formatCode; });

  async function saveNow() {
    const formatted = await formatRef.current();
    const value = formatted ?? codeRef.current;
    const act = activeRef.current;
    if (act && user) {
      clearTimeout(syncTimers.current[act.id]);
      api(`/code/${act.id}`, { method: "PUT", auth: true, body: { code: value } }).catch(() => {});
    }
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1600);
  }
  useEffect(() => { saveNowRef.current = saveNow; });

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeRef.current) saveNowRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    setCode(modernize(active.starter));
    setExtVersion((v) => v + 1);
  }

  // stable files object — new identity ONLY on external code sets (not keystrokes)
  const sandpackFiles = useMemo(
    () => ({ "/App.js": code }),
    [extVersion, active?.id] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const sandpackDeps = useMemo(
    () => Object.fromEntries(getDeps(active).map((d) => [d, "latest"])),
    [active, depsMap] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
            The React machine-coding round, live — powered by the real CodeSandbox
            bundler. Write the component and watch it hot-reload as you type, install
            any npm package, then submit for an AI code review.
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
              Blank React projects on a real bundler — install any npm package
              and build anything, with hot reload as you type.
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
                  <span>⚛️ hot reload</span>
                  {solvedIds.has(ch.id) ? (
                    <span className="pgb-solved">🏆 solved</span>
                  ) : (
                    saved[ch.id] && <span className="pgb-started">✓ started</span>
                  )}
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
        {saveFlash ? (
          <span className="rlab-sync rlab-saved-flash">✓ Saved</span>
        ) : (
          user && synced && !showingSolution && (
            <span className="rlab-sync" title="Auto-saves while typing · Ctrl+S to format & save now">☁ synced</span>
          )
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
          <button className="btn btn-ghost" onClick={() => formatRef.current()} title="Prettier (also Ctrl+S)">
            ✨ Format
          </button>
          <button className={`btn btn-ghost ${showConsole ? "btn-outline" : ""}`} onClick={() => setShowConsole(!showConsole)}>
            🖥 Console
          </button>
          <button className="btn btn-run" onClick={restart} title="Full bundler restart (preview hot-reloads automatically as you type)">
            ↻ Restart
          </button>
          {!active.isSandbox && !showingSolution && user && (
            <button className="btn btn-primary" onClick={submitSolution} title="AI reviews your code against the requirements">
              {solvedIds.has(active.id) ? "🚀 Re-submit" : "🚀 Submit"}
            </button>
          )}
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
                  placeholder="Add any npm package… (e.g. dayjs, uuid, zustand)"
                />
                <button className="btn btn-primary" onClick={() => addDep(depInput)}>＋</button>
              </div>

              <div className="dep-list">
                <div className="dep-row locked">
                  <span className="dep-name">react</span>
                  <span className="dep-version">^18</span>
                </div>
                <div className="dep-row locked">
                  <span className="dep-name">react-dom</span>
                  <span className="dep-version">^18</span>
                </div>
                {getDeps(active).map((d) => (
                  <div className="dep-row" key={d}>
                    <span className="dep-name">{d}</span>
                    <span className="dep-version">latest</span>
                    <button className="dep-remove" onClick={() => removeDep(d)} title="Remove">🗑</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pg-problem-section">
              <h5>ℹ️ How it works</h5>
              <p className="pg-problem-statement">
                This is the real CodeSandbox bundler running in your browser — every
                package here is installed from npm for real. Add one, import it
                normally, and the preview rebuilds automatically.
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
              <h5>📏 Rules</h5>
              <p className="pg-problem-statement">
                Build the component in <strong>App.js</strong> and keep{" "}
                <code>export default App</code>.{"\n"}
                The preview <strong>hot-reloads as you type</strong> — no Run button needed.{"\n"}
                📦 Preinstalled: <strong>axios</strong>, <strong>react-router-dom</strong>,{" "}
                <strong>lodash</strong>.{"\n"}
                Done? Hit <strong>🚀 Submit</strong> for an AI code review.
              </p>
            </div>
          </aside>
        )}

        {/* the real CodeSandbox engine */}
        <div className="rlab-sandpack">
          <SandpackProvider
            key={`${active.id}:${extVersion}`}
            template="react"
            theme="dark"
            files={sandpackFiles}
            customSetup={{ dependencies: sandpackDeps }}
            options={{
              activeFile: "/App.js",
              visibleFiles: ["/App.js"],
              recompileMode: "delayed",
              recompileDelay: 400,
            }}
          >
            <SandpackBridge onChange={onEdit} />
            <SandpackLayout className="rlab-sp-layout">
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs={false}
                wrapContent
              />
              <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton />
            </SandpackLayout>
            {showConsole && (
              <div className="rlab-console-panel">
                <SandpackConsole resetOnPreviewRestart />
              </div>
            )}
          </SandpackProvider>
        </div>
      </div>

      {/* AI review modal */}
      {submitState && (
        <div className="rlab-review-overlay" onClick={() => submitState !== "reviewing" && setSubmitState(null)}>
          <div className="rlab-review-panel" onClick={(e) => e.stopPropagation()}>
            {submitState === "reviewing" ? (
              <div className="rlab-review-loading">
                <div className="iv-eval-spinner">🧑‍⚖️</div>
                <h3>Reviewing your solution…</h3>
                <p>The AI interviewer is checking your code against the requirements.</p>
              </div>
            ) : submitState.error ? (
              <>
                <h3>⚠️ Submission failed</h3>
                <p className="rlab-review-summary">{submitState.error}</p>
                <div className="iv-actions">
                  <button className="btn btn-primary" onClick={submitSolution}>Retry</button>
                  <button className="btn btn-outline" onClick={() => setSubmitState(null)}>Close</button>
                </div>
              </>
            ) : (
              <>
                <div className={`rlab-review-verdict ${submitState.passed ? "pass" : "fail"}`}>
                  <span className="rlab-review-icon">{submitState.passed ? "🎉" : "🔁"}</span>
                  <div>
                    <h3>{submitState.passed ? "ACCEPTED" : "NOT YET"} · {submitState.score}/10</h3>
                    <p>{submitState.summary}</p>
                  </div>
                </div>
                {submitState.feedback?.length > 0 && (
                  <ul className="rlab-review-feedback">
                    {submitState.feedback.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                )}
                <p className="iv-xp">+{submitState.xpGained} XP</p>
                {submitState.newBadges?.length > 0 && (
                  <p className="iv-new-badges">🎖 New badge: {submitState.newBadges.join(", ")}</p>
                )}
                <div className="iv-actions">
                  <button className="btn btn-primary" onClick={() => setSubmitState(null)}>
                    {submitState.passed ? "Nice! Continue" : "Keep improving"}
                  </button>
                  {!submitState.passed && (
                    <button className="btn btn-outline" onClick={() => { setSubmitState(null); toggleSolution(); }}>
                      💡 See solution
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
