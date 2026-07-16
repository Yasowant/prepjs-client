// React Lab — machine-coding challenges (basics).
// Rules for all code: no imports; start with `const { ... } = React;`
// define `function App()` — the sandbox mounts <App /> automatically.

export default [
  {
    id: "rl-counter",
    title: "Counter",
    difficulty: "easy",
    asked: "Build a counter with increment, decrement and reset. Follow-up: add a custom step, and don't let it go below zero.",
    approach: [
      "One useState for count — that's the only state needed",
      "Use the functional update setCount(c => c + step) — safe if buttons are clicked fast",
      "Guard decrement: Math.max(0, c - step) to never go negative",
      "Follow-up trap: calling setCount(count+1) twice only adds 1 — explain WHY (stale closure + batching)",
    ],
    starter: `const { useState } = React;

function App() {
  // TODO: count state + step state
  return (
    <div>
      <h2>Counter</h2>
      {/* TODO: show count, +, -, reset buttons, step input */}
    </div>
  );
}`,
    solution: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Counter</h2>
      <h1 style={{ fontSize: 48, margin: 12 }}>{count}</h1>

      <button onClick={() => setCount(c => Math.max(0, c - step))}>− {step}</button>
      <button onClick={() => setCount(0)} style={{ margin: "0 8px" }}>Reset</button>
      <button onClick={() => setCount(c => c + step)}>+ {step}</button>

      <div style={{ marginTop: 16 }}>
        Step:{" "}
        <input
          type="number"
          min="1"
          value={step}
          onChange={(e) => setStep(Math.max(1, Number(e.target.value)))}
          style={{ width: 60 }}
        />
      </div>
    </div>
  );
}`,
  },
  {
    id: "rl-auth-localstorage",
    title: "Register / Login (localStorage)",
    difficulty: "medium",
    asked: "Build register and login forms. Store users in localStorage, keep the logged-in user across refreshes, and show a logout button.",
    approach: [
      "Three states: mode ('login' | 'register'), form fields, currentUser",
      "Initialize currentUser lazily from localStorage — that's what survives refresh",
      "Register: read users array, reject duplicate email, push new user, save back",
      "Login: find matching email+password; store 'session' user separately from the users list",
      "Say it out loud: 'in production passwords would be hashed server-side — this is UI practice'",
    ],
    starter: `const { useState } = React;

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  // TODO: currentUser state (lazy init from localStorage "session")

  // TODO: handleRegister -> save to localStorage "users"
  // TODO: handleLogin -> check users, set session
  // TODO: logout

  return (
    <div>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {/* TODO: form + switch mode link */}
    </div>
  );
}`,
    solution: `const { useState } = React;

const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("session") || "null")
  );

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    const users = getUsers();

    if (mode === "register") {
      if (users.some(u => u.email === form.email))
        return setMsg("Email already registered");
      users.push(form);
      localStorage.setItem("users", JSON.stringify(users));
      setMsg("Registered! Please login.");
      setMode("login");
    } else {
      const found = users.find(
        u => u.email === form.email && u.password === form.password
      );
      if (!found) return setMsg("Invalid credentials");
      localStorage.setItem("session", JSON.stringify(found));
      setUser(found);
      setMsg("");
    }
  }

  function logout() {
    localStorage.removeItem("session");
    setUser(null);
  }

  if (user)
    return (
      <div>
        <h2>Welcome, {user.name || user.email} 👋</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 260 }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      {mode === "register" && (
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
      )}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
      <button>{mode === "login" ? "Login" : "Create account"}</button>
      <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); setMsg(""); }}>
        {mode === "login" ? "New here? Register" : "Have an account? Login"}
      </a>
    </form>
  );
}`,
  },
  {
    id: "rl-search-filter",
    title: "Search Filter",
    difficulty: "easy",
    asked: "Given a list of items, add a search box that filters the list as the user types. Case-insensitive. Show 'no results' when nothing matches.",
    approach: [
      "State = the query string ONLY. The filtered list is DERIVED — compute it during render, don't store it",
      "Storing filtered results in state is the #1 mistake interviewers watch for (two sources of truth)",
      "filter + toLowerCase().includes() for the match",
      "Mention: for expensive filtering on huge lists → useMemo; for API search → debounce",
    ],
    starter: `const { useState } = React;

const FRUITS = ["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple", "Watermelon", "Papaya"];

function App() {
  const [query, setQuery] = useState("");
  // TODO: derive filtered list (do NOT put it in state!)

  return (
    <div>
      <h2>Search Filter</h2>
      {/* TODO: input + filtered list + empty message */}
    </div>
  );
}`,
    solution: `const { useState } = React;

const FRUITS = ["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple", "Watermelon", "Papaya"];

function App() {
  const [query, setQuery] = useState("");

  // derived state — computed every render, never stored
  const filtered = FRUITS.filter(f =>
    f.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <h2>Search Filter</h2>
      <input
        placeholder="Search fruits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: 220 }}
      />
      {filtered.length === 0 ? (
        <p>No results for "{query}" 😕</p>
      ) : (
        <ul>
          {filtered.map(f => <li key={f}>{f}</li>)}
        </ul>
      )}
      <small>{filtered.length} of {FRUITS.length} items</small>
    </div>
  );
}`,
  },
  {
    id: "rl-accordion",
    title: "Accordion",
    difficulty: "easy",
    asked: "Build an accordion from a data array — clicking a header expands its panel and collapses the others. Follow-up: allow multiple open at once.",
    approach: [
      "Single-open: state = activeIndex (number | null). Clicking the open one closes it (set null)",
      "Render from a data array with map — never hardcode the panels",
      "Follow-up multiple-open: switch state to a Set/array of open indexes and toggle membership",
      "Accessibility bonus points: use <button> for headers, aria-expanded",
    ],
    starter: `const { useState } = React;

const FAQS = [
  { q: "What is React?", a: "A library for building UIs with components." },
  { q: "What is JSX?", a: "Syntax sugar that compiles to React.createElement." },
  { q: "What are hooks?", a: "Functions like useState to use state in function components." },
];

function App() {
  // TODO: activeIndex state (null = all closed)
  return (
    <div>
      <h2>FAQ Accordion</h2>
      {/* TODO: map FAQS -> header button + conditional panel */}
    </div>
  );
}`,
    solution: `const { useState } = React;

const FAQS = [
  { q: "What is React?", a: "A library for building UIs with components." },
  { q: "What is JSX?", a: "Syntax sugar that compiles to React.createElement." },
  { q: "What are hooks?", a: "Functions like useState to use state in function components." },
];

function App() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>FAQ Accordion</h2>
      {FAQS.map((item, i) => (
        <div key={item.q} style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 8 }}>
          <button
            onClick={() => setActive(active === i ? null : i)}
            aria-expanded={active === i}
            style={{
              width: "100%", textAlign: "left", padding: 12,
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 600, display: "flex", justifyContent: "space-between",
            }}
          >
            {item.q} <span>{active === i ? "−" : "+"}</span>
          </button>
          {active === i && (
            <p style={{ padding: "0 12px 12px", margin: 0, color: "#555" }}>{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: "rl-todo",
    title: "Todo App",
    difficulty: "easy",
    asked: "The classic: add todos, toggle complete, delete, and filter All / Active / Done. Follow-up: persist in localStorage.",
    approach: [
      "State: todos array + input text + filter. Each todo = { id, text, done }",
      "ALL updates immutable: add [...todos, new], toggle .map, delete .filter",
      "Use Date.now() or crypto.randomUUID() for ids — never the array index as key",
      "Filtered list is derived during render from todos + filter",
      "Persist follow-up: lazy useState init from localStorage + useEffect to write on change",
    ],
    starter: `const { useState } = React;

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");

  // TODO: addTodo (form submit), toggle(id), remove(id)
  // TODO: derive visible list from filter

  return (
    <div>
      <h2>Todo App</h2>
      {/* TODO: form, filter buttons, list */}
    </div>
  );
}`,
    solution: `const { useState, useEffect } = React;

function App() {
  const [todos, setTodos] = useState(() =>
    JSON.parse(localStorage.getItem("todos") || "[]")
  );
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function addTodo(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }]);
    setText("");
  }

  const toggle = (id) =>
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos(todos.filter(t => t.id !== id));

  const visible = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>Todo App</h2>
      <form onSubmit={addTodo}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What to do?" style={{ padding: 8 }} />
        <button style={{ marginLeft: 6 }}>Add</button>
      </form>

      <div style={{ margin: "10px 0" }}>
        {["all", "active", "done"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ marginRight: 6, fontWeight: filter === f ? 700 : 400 }}>
            {f}
          </button>
        ))}
      </div>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {visible.map(t => (
          <li key={t.id} style={{ display: "flex", gap: 8, padding: 6, alignItems: "center" }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            <button onClick={() => remove(t.id)}>🗑</button>
          </li>
        ))}
      </ul>
      <small>{todos.filter(t => !t.done).length} remaining</small>
    </div>
  );
}`,
  },
  {
    id: "rl-theme-toggle",
    title: "Theme Toggle (Dark/Light)",
    difficulty: "easy",
    asked: "Add a dark/light theme toggle that persists across refreshes. Follow-up: share the theme app-wide without prop drilling (Context).",
    approach: [
      "State = theme string, lazy-initialized from localStorage",
      "useEffect writes theme to localStorage whenever it changes",
      "Apply via a style object or a class on the container",
      "Follow-up: wrap in ThemeContext.Provider + useContext(ThemeContext) in any child — that's the real interview answer",
    ],
    starter: `const { useState, useEffect, createContext, useContext } = React;

// TODO: ThemeContext + provider with theme, toggle
// TODO: persist in localStorage

function App() {
  return (
    <div>
      <h2>Theme Toggle</h2>
      {/* TODO */}
    </div>
  );
}`,
    solution: `const { useState, useEffect, createContext, useContext } = React;

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

function Page() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <div style={{
      background: dark ? "#111827" : "#f9fafb",
      color: dark ? "#f9fafb" : "#111827",
      padding: 24, borderRadius: 12, transition: "all .3s", minHeight: 200,
    }}>
      <h2>{dark ? "🌙 Dark" : "☀️ Light"} Mode</h2>
      <p>Theme comes from Context — no prop drilling. It survives refresh via localStorage.</p>
      <button onClick={toggle} style={{ padding: "8px 16px" }}>
        Switch to {dark ? "light" : "dark"}
      </button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}`,
  },
  {
    id: "rl-stopwatch",
    title: "Stopwatch",
    difficulty: "medium",
    asked: "Build a stopwatch with start, pause and reset showing minutes:seconds. Follow-up: why useRef for the interval id and not useState?",
    approach: [
      "Two states: elapsed time + isRunning. The interval ID goes in a useRef — changing it must NOT re-render",
      "Start the interval in a useEffect that depends on isRunning; return clearInterval as cleanup — this handles pause AND unmount leaks in one place",
      "Tick with functional update setTime(t => t + 1) — avoids the stale closure bug",
      "Format: pad minutes/seconds with String(x).padStart(2, '0')",
      "The useRef follow-up IS the real question — rehearse the answer",
    ],
    starter: `const { useState, useEffect, useRef } = React;

function App() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // TODO: useEffect that starts/clears the interval based on 'running'

  return (
    <div>
      <h2>Stopwatch</h2>
      {/* TODO: mm:ss display + start/pause/reset */}
    </div>
  );
}`,
    solution: `const { useState, useEffect } = React;

function App() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;                      // paused → no interval
    const id = setInterval(() => {
      setSeconds(s => s + 1);                  // functional update = no stale closure
    }, 1000);
    return () => clearInterval(id);            // cleanup on pause/unmount
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Stopwatch</h2>
      <h1 style={{ fontSize: 56, fontFamily: "monospace", margin: 12 }}>
        {mm}:{ss}
      </h1>
      <button onClick={() => setRunning(r => !r)} style={{ marginRight: 8 }}>
        {running ? "⏸ Pause" : "▶ Start"}
      </button>
      <button onClick={() => { setRunning(false); setSeconds(0); }}>
        ↺ Reset
      </button>
    </div>
  );
}`,
  },
  {
    id: "rl-custom-hook",
    title: "Custom Hook (useLocalStorage + useToggle)",
    difficulty: "medium",
    asked: "Extract reusable logic into a custom hook — e.g., useLocalStorage(key, initial) that works exactly like useState but persists. Demo it in two components.",
    approach: [
      "A custom hook = a 'use'-prefixed function that calls other hooks and returns whatever API you design",
      "useLocalStorage: lazy useState init (read once), useEffect to write on change, return [value, setValue] — same contract as useState",
      "Key insight to SAY: each component calling the hook gets its OWN state — hooks share logic, not state",
      "Show two different components using it to prove reusability",
    ],
    starter: `const { useState, useEffect } = React;

// TODO: function useLocalStorage(key, initial) { ... return [value, setValue] }
// TODO: function useToggle(initial = false) { ... return [on, toggle] }

function App() {
  return (
    <div>
      <h2>Custom Hooks</h2>
      {/* TODO: use both hooks */}
    </div>
  );
}`,
    solution: `const { useState, useEffect } = React;

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];   // same API as useState ✨
}

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(o => !o);
  return [on, toggle];
}

function NameCard() {
  const [name, setName] = useLocalStorage("demo-name", "");
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (persists!)" />
      <p>Hello, {name || "stranger"} — refresh me, I remember.</p>
    </div>
  );
}

function Spoiler() {
  const [open, toggle] = useToggle();
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginTop: 10 }}>
      <button onClick={toggle}>{open ? "Hide" : "Show"} spoiler</button>
      {open && <p>🎬 The hero wins. Obviously.</p>}
    </div>
  );
}

function App() {
  return (
    <div style={{ maxWidth: 380 }}>
      <h2>Custom Hooks</h2>
      <NameCard />
      <Spoiler />
    </div>
  );
}`,
  },
];
