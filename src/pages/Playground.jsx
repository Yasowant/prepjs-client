import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { PROBLEMS } from "../data/problems.js";
import { PROJECTS_DATA } from "../data/projects.js";

const STORAGE_KEY = "prepjs-playground-files";
const SOLUTIONS_KEY = "prepjs-playground-solutions";

function loadStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function buildTestHarness(problem) {
  return `

/* ---------- PrepJS test runner ---------- */
const __tests = ${JSON.stringify(problem.tests)};
let __pass = 0;
for (let __i = 0; __i < __tests.length; __i++) {
  const __t = __tests[__i];
  try {
    let __got = eval(__t.expr);
    if (__got && typeof __got.then === "function") __got = await __got;
    const __ok = JSON.stringify(__got) === JSON.stringify(__t.expected);
    if (__ok) { __pass++; console.log("✅ Test " + (__i + 1) + ": " + __t.expr); }
    else console.error("❌ Test " + (__i + 1) + ": " + __t.expr +
      "\\n   expected: " + JSON.stringify(__t.expected) +
      "\\n   got:      " + JSON.stringify(__got));
  } catch (__e) {
    console.error("❌ Test " + (__i + 1) + ": " + __t.expr + " → threw: " + __e.message);
  }
}
if (__pass === __tests.length) console.log("🎉 All " + __tests.length + " tests passed! Interview ready.");
else console.warn("📊 " + __pass + "/" + __tests.length + " tests passed — keep going!");
`;
}

const SNIPPETS = {
  "welcome.js": `// ⚡ PrepJS Playground — write JS, hit ▶ Run
// console.log output appears in the terminal below.

const greet = (name) => \`Hello, \${name}! 👋\`;
console.log(greet("Fohat"));

// Try predicting the output BEFORE running:
console.log("1");
setTimeout(() => console.log("2 (timer)"), 0);
Promise.resolve().then(() => console.log("3 (promise)"));
console.log("4");`,
  "closures.js": `// 🔒 Closures — the counter remembers count
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
console.log(counter()); // ?
console.log(counter()); // ?

// classic trap — predict before running!
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 10);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 20);
}`,
  "event-loop.js": `// ⏳ Event loop — sync → microtasks → macrotasks
console.log("start");

setTimeout(() => console.log("macrotask: timeout"), 0);

Promise.resolve()
  .then(() => console.log("microtask: then 1"))
  .then(() => console.log("microtask: then 2"));

queueMicrotask(() => console.log("microtask: queueMicrotask"));

console.log("end");
// Predict the exact order, then run!`,
  "this.js": `// 🎯 'this' — depends on HOW you call
const user = {
  name: "PrepJS",
  regular() { console.log("regular:", this.name); },
  arrow: () => console.log("arrow:", this?.name),
};

user.regular();          // ?
user.arrow();            // ?

const detached = user.regular;
try { detached(); } catch (e) { console.log("detached:", e.message); }

const bound = user.regular.bind({ name: "Bound!" });
bound();                 // ?`,
  "promises.js": `// 🤝 Promises — chaining & combinators
const wait = (ms, val) =>
  new Promise((res) => setTimeout(() => res(val), ms));

async function main() {
  const fast = await wait(100, "🐇 fast");
  console.log(fast);

  const results = await Promise.all([
    wait(200, "A"), wait(100, "B"), wait(150, "C"),
  ]);
  console.log("all:", results);

  const winner = await Promise.race([
    wait(80, "🥇 winner"), wait(200, "🐢 slow"),
  ]);
  console.log("race:", winner);
}
main();`,
  "polyfill.js": `// 🛠 Polyfill practice — implement myMap
Array.prototype.myMap = function (cb) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    out.push(cb(this[i], i, this));
  }
  return out;
};

console.log([1, 2, 3].myMap((x) => x * 10));

// Your turn: implement myFilter below 👇
Array.prototype.myFilter = function (cb) {
  // ...write it and test it!
};`,
  "challenge.js": `// 💪 Challenge: fix the bug!
// This should log the user AFTER 1 second — but it crashes.
// Fix it using optional chaining or a guard.

const response = { data: null };

setTimeout(() => {
  // console.log(response.data.user.name); // ❌ TypeError
  console.log(response.data?.user?.name ?? "no user yet ✅");
}, 300);

// Bonus: debounce this
function search(q) { console.log("searching:", q); }
search("j"); search("js"); search("jsx");
// implement debounce(search, 300) so only the last call runs`,
};

function makeWorker() {
  const code = `
    const fmt = (v) => {
      if (typeof v === "string") return v;
      if (typeof v === "function") return v.toString();
      if (v instanceof Error) return v.name + ": " + v.message;
      try { const s = JSON.stringify(v, null, 1); return s === undefined ? String(v) : s.replace(/\\n\\s*/g, " "); }
      catch { return String(v); }
    };
    ["log","info","warn","error"].forEach((level) => {
      console[level] = (...args) =>
        postMessage({ type: "log", level, text: args.map(fmt).join(" ") });
    });
    onmessage = async (e) => {
      try {
        const fn = new Function('"use strict"; return (async () => {\\n' + e.data + '\\n})()');
        await fn();
      } catch (err) {
        postMessage({ type: "log", level: "error", text: err.name + ": " + err.message });
      }
      setTimeout(() => postMessage({ type: "done" }), 600);
    };
  `;
  return new Worker(URL.createObjectURL(new Blob([code], { type: "application/javascript" })));
}

const TABS = [
  { id: "problems", icon: "🏆", label: "Problems", sub: "Coding questions with auto-tests" },
  { id: "projects", icon: "🧩", label: "Projects", sub: "Real-world scenario builds" },
  { id: "snippets", icon: "📄", label: "Snippets", sub: "Learn by running & your files" },
];

const diffClass = (d) => (d === "easy" ? "basic" : d === "medium" ? "intermediate" : "advanced");

export default function Playground() {
  const [tab, setTab] = useState("problems");
  const [customFiles, setCustomFiles] = useState(() => loadStored(STORAGE_KEY));
  const [solutions, setSolutions] = useState(() => loadStored(SOLUTIONS_KEY));

  // active = { type: 'problem'|'project'|'file', data }  |  null = browse mode
  const [active, setActive] = useState(null);
  const [code, setCode] = useState("");
  const [briefOpen, setBriefOpen] = useState(true);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const workerRef = useRef(null);

  const allFiles = { ...SNIPPETS, ...customFiles };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customFiles));
  }, [customFiles]);
  useEffect(() => {
    localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(solutions));
  }, [solutions]);

  /* ---------- open / close ---------- */

  function openItem(type, data) {
    setActive({ type, data });
    setBriefOpen(type !== "file");
    setCode(type === "file" ? allFiles[data] : solutions[data.id] ?? data.starter);
    setOutput([]);
  }

  function goBack() {
    stop();
    setActive(null);
    setOutput([]);
  }

  function onEdit(value) {
    const v = value ?? "";
    setCode(v);
    if (!active) return;
    if (active.type === "file") {
      if (active.data in customFiles) setCustomFiles((f) => ({ ...f, [active.data]: v }));
    } else {
      setSolutions((s) => ({ ...s, [active.data.id]: v }));
    }
  }

  function resetCode() {
    if (!active || active.type === "file") return;
    if (!confirm("Reset to the starter code? Your work will be cleared.")) return;
    setSolutions((s) => {
      const next = { ...s };
      delete next[active.data.id];
      return next;
    });
    setCode(active.data.starter);
  }

  function newFile() {
    let name = prompt("File name (e.g. practice.js):", "my-practice.js");
    if (!name) return;
    name = name.trim();
    if (!name.endsWith(".js")) name += ".js";
    if (allFiles[name]) return alert(`"${name}" already exists — pick another name.`);
    const starter = `// 📝 ${name} — your practice file (auto-saved in this browser)\n\nconsole.log("Let's practice! 💪");\n`;
    setCustomFiles((f) => ({ ...f, [name]: starter }));
    openItem("file", name);
  }

  function deleteFile(name, e) {
    e.stopPropagation();
    if (!confirm(`Delete ${name}?`)) return;
    setCustomFiles((f) => {
      const next = { ...f };
      delete next[name];
      return next;
    });
  }

  /* ---------- run ---------- */

  function stop() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setRunning(false);
  }

  function run(source = code, label = "Running…") {
    stop();
    setOutput([{ level: "sys", text: `▶ ${label}` }]);
    setRunning(true);

    const worker = makeWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === "log") {
        setOutput((o) => [...o, { level: e.data.level, text: e.data.text }]);
      } else if (e.data.type === "done") {
        setOutput((o) => [...o, { level: "sys", text: "✓ finished" }]);
        stop();
      }
    };

    const killer = setTimeout(() => {
      if (workerRef.current) {
        setOutput((o) => [...o, { level: "error", text: "⏱ Stopped: took longer than 4s (infinite loop?)" }]);
        stop();
      }
    }, 4000);
    worker.addEventListener("message", (e) => e.data.type === "done" && clearTimeout(killer));

    worker.postMessage(source);
  }

  function runTests() {
    if (active?.type !== "problem") return;
    run(code + buildTestHarness(active.data), `Testing ${active.data.title}…`);
  }

  /* ================= BROWSE MODE ================= */
  if (!active) {
    return (
      <div className="pgb">
        <div className="pgb-head">
          <h1>⚡ Playground</h1>
          <p>Pick something to practice — everything runs right in your browser.</p>
        </div>

        <div className="pgb-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`pgb-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="pgb-tab-icon">{t.icon}</span>
              <span className="pgb-tab-label">{t.label}</span>
              <span className="pgb-tab-sub">{t.sub}</span>
            </button>
          ))}
        </div>

        {tab === "problems" && (
          <div className="pgb-grid">
            {PROBLEMS.map((p, i) => (
              <button className="pgb-card" key={p.id} onClick={() => openItem("problem", p)}>
                <div className="pgb-card-top">
                  <span className="pgb-num">#{String(i + 1).padStart(2, "0")}</span>
                  <span className={`level-badge ${diffClass(p.difficulty)}`}>{p.difficulty}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.statement.split("\n")[0]}</p>
                <div className="pgb-card-foot">
                  <span>🧪 {p.tests.length} auto-tests</span>
                  {solutions[p.id] && <span className="pgb-started">✓ started</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "projects" && (
          <div className="pgb-grid">
            {PROJECTS_DATA.map((p, i) => (
              <button className="pgb-card" key={p.id} onClick={() => openItem("project", p)}>
                <div className="pgb-card-top">
                  <span className="pgb-num">#{String(i + 1).padStart(2, "0")}</span>
                  <span className={`level-badge ${diffClass(p.difficulty)}`}>{p.difficulty}</span>
                </div>
                <h3>🧩 {p.title}</h3>
                <p>{p.scenario.slice(0, 120)}…</p>
                <div className="pgb-card-foot">
                  <span>📌 {p.requirements.length} requirements</span>
                  {solutions[p.id] && <span className="pgb-started">✓ started</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "snippets" && (
          <>
            <div className="pgb-grid">
              {Object.keys(SNIPPETS).map((name) => (
                <button className="pgb-card" key={name} onClick={() => openItem("file", name)}>
                  <div className="pgb-card-top">
                    <span className="pg-file-icon">JS</span>
                  </div>
                  <h3>{name}</h3>
                  <p>{SNIPPETS[name].split("\n")[0].replace(/^\/\/\s*/, "")}</p>
                  <div className="pgb-card-foot"><span>▶ run & learn</span></div>
                </button>
              ))}
            </div>

            <div className="pgb-myfiles-head">
              <h2>📝 My files</h2>
              <button className="btn btn-outline" onClick={newFile}>＋ New file</button>
            </div>
            <div className="pgb-grid">
              {Object.keys(customFiles).length === 0 && (
                <p className="empty">No files yet — create one and it auto-saves in this browser.</p>
              )}
              {Object.keys(customFiles).map((name) => (
                <button className="pgb-card mine" key={name} onClick={() => openItem("file", name)}>
                  <div className="pgb-card-top">
                    <span className="pg-file-icon mine">JS</span>
                    <span className="pg-file-delete" onClick={(e) => deleteFile(name, e)} title="Delete">×</span>
                  </div>
                  <h3>{name}</h3>
                  <p>Your practice file</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ================= WORK MODE ================= */
  const isProblem = active.type === "problem";
  const isProject = active.type === "project";
  const item = active.data;
  const title = active.type === "file" ? item : item.title;

  return (
    <div className="pgw">
      {/* topbar */}
      <div className="pgw-topbar">
        <button className="pgw-back" onClick={goBack}>←</button>
        <span className="pg-tab-icon">JS</span>
        <span className="pgw-title">{title}</span>
        {(isProblem || isProject) && (
          <span className={`level-badge ${diffClass(item.difficulty)}`}>{item.difficulty}</span>
        )}
        <div className="pgw-actions">
          {(isProblem || isProject) && (
            <>
              <button
                className={`btn btn-outline pgw-brief-btn ${briefOpen ? "on" : ""}`}
                onClick={() => setBriefOpen(!briefOpen)}
              >
                📋 {briefOpen ? "Hide" : "Show"} brief
              </button>
              <button className="btn btn-ghost" onClick={resetCode}>↺ Reset</button>
            </>
          )}
          {running && <button className="btn btn-ghost" onClick={stop}>■ Stop</button>}
          {isProblem && (
            <button className="btn btn-test" onClick={runTests} disabled={running}>
              ✓ Run Tests
            </button>
          )}
          <button className="btn btn-run" onClick={() => run()} disabled={running}>
            {running ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      <div className="pgw-body">
        {/* brief panel */}
        {briefOpen && (isProblem || isProject) && (
          <aside className="pgw-brief">
            {isProblem && (
              <>
                <div className="pg-problem-section">
                  <h5>📋 Problem</h5>
                  <p className="pg-problem-statement">{item.statement}</p>
                </div>
                <div className="pg-problem-section">
                  <h5>🧪 Examples</h5>
                  {item.examples.map((ex, i) => <pre key={i}>{ex}</pre>)}
                </div>
                <div className="pg-problem-section">
                  <h5>✅ Tests</h5>
                  <p className="pg-problem-statement">
                    {item.tests.length} hidden test cases. Hit <strong>✓ Run Tests</strong> when ready.
                  </p>
                </div>
              </>
            )}
            {isProject && (
              <>
                <div className="pg-problem-section">
                  <h5>🎬 Scenario</h5>
                  <p className="pg-problem-statement">{item.scenario}</p>
                </div>
                <div className="pg-problem-section">
                  <h5>📌 Requirements</h5>
                  <ul className="pg-req-list">
                    {item.requirements.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </div>
                <div className="pg-problem-section">
                  <h5>🎯 Expected behaviour</h5>
                  <pre>{item.expected}</pre>
                </div>
              </>
            )}
          </aside>
        )}

        {/* editor + terminal */}
        <div className="pgw-editorcol">
          <div className="pg-editor">
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={onEdit}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 14 },
                tabSize: 2,
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>

          <div className="pg-terminal">
            <div className="pg-terminal-title">
              <span>TERMINAL</span>
              <div className="pg-terminal-actions">
                {running && <span className="pg-running-chip">● running</span>}
                <button className="pg-clear" onClick={() => setOutput([])} title="Clear terminal">
                  🗑 clear
                </button>
              </div>
            </div>
            <div className="pg-terminal-body">
              {output.length === 0 && (
                <span className="pg-term-placeholder">
                  {isProblem
                    ? "Write your solution, then hit ✓ Run Tests…"
                    : isProject
                    ? "Fill in the TODOs, hit ▶ Run, compare with the expected behaviour…"
                    : "Hit ▶ Run to see your console output here…"}
                </span>
              )}
              {output.map((line, i) => (
                <div key={i} className={`pg-term-line ${line.level}`}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
