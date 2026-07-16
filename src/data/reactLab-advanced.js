// React Lab — machine-coding challenges (data & API heavy).
export default [
  {
    id: "rl-fetch",
    title: "Fetch API (loading / error / data)",
    difficulty: "medium",
    asked: "Fetch users from an API and render them. Handle loading and error states properly. Follow-up: how do you avoid setting state after unmount?",
    approach: [
      "The holy trio of states: data, loading, error — render a branch for each",
      "Fetch inside useEffect(fn, []) — never during render",
      "Check res.ok! fetch does NOT reject on 404/500",
      "Cleanup follow-up: AbortController (or an 'alive' flag) so a fast unmount can't set state",
      "Production answer to mention: React Query / SWR handles caching + retries",
    ],
    starter: `const { useState, useEffect } = React;

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: useEffect -> fetch https://jsonplaceholder.typicode.com/users
  // handle loading / error / data + AbortController cleanup

  return <h2>Users</h2>;
}`,
    solution: `const { useState, useEffect } = React;

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("https://jsonplaceholder.typicode.com/users", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setUsers(await res.json());
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();

    return () => controller.abort();   // no setState after unmount
  }, []);

  if (loading) return <p>⏳ Loading users…</p>;
  if (error) return <p style={{ color: "crimson" }}>❌ {error}</p>;

  return (
    <div>
      <h2>Users ({users.length})</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            <strong>{u.name}</strong> — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
  },
  {
    id: "rl-debounce-search",
    title: "Debounce Search (API)",
    difficulty: "medium",
    asked: "Search products from an API as the user types — but don't fire a request per keystroke. Debounce it. THE most asked React machine-coding question.",
    approach: [
      "Input state updates instantly (controlled input stays snappy)",
      "useEffect on [query]: setTimeout(fetch, 500) and return clearTimeout — every keystroke cancels the previous timer",
      "That cleanup-based debounce is the pattern interviewers want to see",
      "Bonus: extract it into a useDebounce(value, delay) custom hook — instant senior points",
      "Also abort in-flight requests so a slow old response can't overwrite a new one",
    ],
    starter: `const { useState, useEffect } = React;

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // TODO: debounced useEffect on query ->
  // fetch("https://dummyjson.com/products/search?q=" + query)

  return (
    <div>
      <h2>Product Search</h2>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try 'phone'..." />
      {/* TODO: results */}
    </div>
  );
}`,
    solution: `const { useState, useEffect } = React;

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {          // ⏲ debounce: wait 500ms
      try {
        const res = await fetch(
          "https://dummyjson.com/products/search?q=" + encodeURIComponent(query),
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {                                   // 🧹 every keystroke:
      clearTimeout(timer);                           // cancel pending timer
      controller.abort();                            // cancel in-flight request
    };
  }, [query]);

  return (
    <div style={{ maxWidth: 380 }}>
      <h2>Product Search</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try 'phone', 'laptop'..."
        style={{ padding: 8, width: "100%" }}
      />
      {loading && <p>Searching…</p>}
      <ul>
        {results.map(p => (
          <li key={p.id}>{p.title} — <strong>{"$" + p.price}</strong></li>
        ))}
      </ul>
      {!loading && query && results.length === 0 && <p>No products found.</p>}
    </div>
  );
}`,
  },
  {
    id: "rl-pagination",
    title: "Pagination",
    difficulty: "medium",
    asked: "Fetch 100 posts and show them 10 per page with Prev / Next and numbered page buttons. Follow-up: server-side vs client-side pagination?",
    approach: [
      "State: posts (all data) + currentPage. Page COUNT and visible SLICE are derived — not state",
      "slice((page-1)*perPage, page*perPage) gets the current window",
      "Disable Prev on first page, Next on last — interviewers check edge cases",
      "Follow-up answer: client-side is fine for small data; real apps ask the SERVER for ?page=2&limit=10 so you never download everything",
    ],
    starter: `const { useState, useEffect } = React;
const PER_PAGE = 10;

function App() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  // TODO: fetch https://jsonplaceholder.typicode.com/posts once
  // TODO: derive totalPages + current slice; Prev/Next + page buttons

  return <h2>Posts</h2>;
}`,
    solution: `const { useState, useEffect } = React;
const PER_PAGE = 10;

function App() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then(r => r.json())
      .then(setPosts);
  }, []);

  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const visible = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (!posts.length) return <p>⏳ Loading…</p>;

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Posts — page {page}/{totalPages}</h2>
      <ol start={(page - 1) * PER_PAGE + 1}>
        {visible.map(p => <li key={p.id}>{p.title}</li>)}
      </ol>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setPage(n)}
            style={{ fontWeight: n === page ? 700 : 400, background: n === page ? "#fde68a" : "" }}
          >
            {n}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}`,
  },
  {
    id: "rl-infinite-scroll",
    title: "Infinite Scroll",
    difficulty: "hard",
    asked: "Load products as the user scrolls to the bottom — no Load More button. Which API do you use and why not a scroll event listener?",
    approach: [
      "IntersectionObserver on a sentinel div at the list bottom — THE answer they want (scroll listeners fire constantly and need throttling)",
      "State: items, skip (offset), hasMore, loading",
      "When sentinel becomes visible and !loading && hasMore → fetch next batch with ?limit=10&skip=N and APPEND",
      "Set hasMore=false when the API returns fewer than requested",
      "Attach the observer in useEffect, disconnect in cleanup",
    ],
    starter: `const { useState, useEffect, useRef } = React;

function App() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  // TODO: loadMore() -> https://dummyjson.com/products?limit=10&skip=...
  // TODO: IntersectionObserver on sentinelRef triggers loadMore

  return (
    <div>
      <h2>Infinite Products</h2>
      {/* list */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}`,
    solution: `const { useState, useEffect, useRef } = React;
const LIMIT = 10;

function App() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;

      setLoading(true);
      const res = await fetch(
        "https://dummyjson.com/products?limit=" + LIMIT + "&skip=" + skip
      );
      const data = await res.json();
      setItems(prev => [...prev, ...data.products]);
      setSkip(s => s + LIMIT);
      if (skip + LIMIT >= data.total) setHasMore(false);
      setLoading(false);
    });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [skip, hasMore, loading]);

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Infinite Products ({items.length})</h2>
      {items.map(p => (
        <div key={p.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 8 }}>
          <strong>{p.title}</strong>
          <div style={{ color: "#666" }}>{"$" + p.price} · ⭐ {p.rating}</div>
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <p>⏳ Loading more…</p>}
      {!hasMore && <p>🏁 You have seen everything!</p>}
    </div>
  );
}`,
  },
  {
    id: "rl-crud",
    title: "CRUD App",
    difficulty: "medium",
    asked: "Build a contact manager: Create, Read, Update, Delete. One form should serve both add and edit modes.",
    approach: [
      "State: items array + form fields + editingId (null = add mode, id = edit mode)",
      "One form, two behaviors: submit either appends or maps-and-replaces based on editingId",
      "Edit button copies the item into the form and sets editingId — cancel resets both",
      "All four operations immutable: spread to add, .map to update, .filter to delete",
      "Say: 'with a backend, each handler would call the API then update state (or refetch)'",
    ],
    starter: `const { useState } = React;

function App() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Yaso", phone: "9876543210" },
  ]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState(null);

  // TODO: handleSubmit (add OR update based on editingId)
  // TODO: startEdit(contact), remove(id)

  return <h2>Contacts</h2>;
}`,
    solution: `const { useState } = React;

function App() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Yaso", phone: "9876543210" },
  ]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    if (editingId) {
      // UPDATE
      setContacts(contacts.map(c =>
        c.id === editingId ? { ...c, ...form } : c
      ));
    } else {
      // CREATE
      setContacts([...contacts, { id: Date.now(), ...form }]);
    }
    cancel();
  }

  function startEdit(c) {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone });
  }

  function cancel() {
    setEditingId(null);
    setForm({ name: "", phone: "" });
  }

  const remove = (id) => setContacts(contacts.filter(c => c.id !== id));

  return (
    <div style={{ maxWidth: 380 }}>
      <h2>📇 Contacts ({contacts.length})</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Phone" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button>{editingId ? "💾 Save" : "＋ Add"}</button>
        {editingId && <button type="button" onClick={cancel}>✕</button>}
      </form>

      {contacts.map(c => (
        <div key={c.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 10, border: "1px solid #eee", borderRadius: 8, marginBottom: 6,
          background: editingId === c.id ? "#fef9c3" : "white",
        }}>
          <span><strong>{c.name}</strong> · {c.phone}</span>
          <span>
            <button onClick={() => startEdit(c)}>✏️</button>
            <button onClick={() => remove(c.id)} style={{ marginLeft: 4 }}>🗑</button>
          </span>
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: "rl-data-table",
    title: "Data Table (sort + search)",
    difficulty: "hard",
    asked: "Render a table of users with sortable columns (click header toggles asc/desc) and a search box. Follow-up: how do you keep it fast for 10k rows?",
    approach: [
      "State: sortKey, sortDir, query. The sorted+filtered rows are DERIVED with useMemo",
      "Sort: copy first ([...rows].sort) — never mutate! Compare with localeCompare for strings, subtraction for numbers",
      "Clicking the active column flips direction; a new column resets to asc",
      "Show ▲/▼ on the active header — small detail, big impression",
      "10k-rows follow-up: useMemo the computation + virtualization (react-window) for rendering",
    ],
    starter: `const { useState, useMemo } = React;

const USERS = [
  { name: "Yaso", role: "Engineer", age: 27 },
  { name: "Ananya", role: "Designer", age: 24 },
  { name: "Rohit", role: "Manager", age: 31 },
  { name: "Priya", role: "Engineer", age: 26 },
  { name: "Karan", role: "Analyst", age: 29 },
];

function App() {
  // TODO: query, sortKey, sortDir states
  // TODO: useMemo -> filter + sort derived rows
  return <h2>Team</h2>;
}`,
    solution: `const { useState, useMemo } = React;

const USERS = [
  { name: "Yaso", role: "Engineer", age: 27 },
  { name: "Ananya", role: "Designer", age: 24 },
  { name: "Rohit", role: "Manager", age: 31 },
  { name: "Priya", role: "Engineer", age: 26 },
  { name: "Karan", role: "Analyst", age: 29 },
];
const COLUMNS = ["name", "role", "age"];

function App() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  function onSort(key) {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = USERS.filter(u =>
      u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {          // copy — never mutate!
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [query, sortKey, sortDir]);

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Team Table</h2>
      <input placeholder="Search name or role..." value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: "100%", marginBottom: 10 }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col} onClick={() => onSort(col)}
                style={{ cursor: "pointer", textAlign: "left", padding: 8, borderBottom: "2px solid #ddd" }}>
                {col.toUpperCase()} {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(u => (
            <tr key={u.name}>
              {COLUMNS.map(col => (
                <td key={col} style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p>No matches.</p>}
    </div>
  );
}`,
  },
  {
    id: "rl-employee-mgmt",
    title: "Employee Management System",
    difficulty: "hard",
    asked: "The capstone: manage employees with add/edit/delete, search, filter by department, quick stats, and localStorage persistence. 45–60 minutes in real interviews.",
    approach: [
      "This combines everything: CRUD + derived filtering + persistence. Plan the state FIRST, out loud",
      "State: employees (lazy from localStorage), form, editingId, query, deptFilter",
      "Visible list = derived: filter by dept → filter by search → render. Stats derived too",
      "One form for add/edit (the CRUD pattern), useEffect to persist employees",
      "Time management tip: get add+list working in 15 min, then delete, then edit, then filters — working software at every step",
    ],
    starter: `const { useState, useEffect } = React;
const DEPTS = ["Engineering", "Design", "HR", "Sales"];

function App() {
  // TODO: employees (localStorage), form { name, dept, salary },
  //       editingId, query, deptFilter
  return <h2>Employee Management</h2>;
}`,
    solution: `const { useState, useEffect } = React;
const DEPTS = ["Engineering", "Design", "HR", "Sales"];
const EMPTY = { name: "", dept: "Engineering", salary: "" };

function App() {
  const [employees, setEmployees] = useState(() =>
    JSON.parse(localStorage.getItem("employees") || "[]")
  );
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.salary) return;
    const record = { ...form, salary: Number(form.salary) };

    setEmployees(editingId
      ? employees.map(emp => emp.id === editingId ? { ...emp, ...record } : emp)
      : [...employees, { id: Date.now(), ...record }]
    );
    setForm(EMPTY);
    setEditingId(null);
  }

  const startEdit = (emp) => { setEditingId(emp.id); setForm(emp); };
  const remove = (id) => setEmployees(employees.filter(e => e.id !== id));

  // derived: filter chain
  const visible = employees
    .filter(e => deptFilter === "All" || e.dept === deptFilter)
    .filter(e => e.name.toLowerCase().includes(query.toLowerCase()));

  const totalSalary = visible.reduce((s, e) => s + e.salary, 0);

  return (
    <div style={{ maxWidth: 460 }}>
      <h2>👥 Employee Management</h2>

      {/* stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Stat label="Employees" value={visible.length} />
        <Stat label="Total salary" value={"$" + totalSalary.toLocaleString()} />
      </div>

      {/* add / edit form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="number" placeholder="Salary" value={form.salary} style={{ width: 90 }}
          onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        <button>{editingId ? "💾 Save" : "＋ Add"}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }}>✕</button>
        )}
      </form>

      {/* filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input placeholder="🔍 Search..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option>All</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* list */}
      {visible.map(emp => (
        <div key={emp.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 10, border: "1px solid #eee", borderRadius: 8, marginBottom: 6,
        }}>
          <span>
            <strong>{emp.name}</strong>
            <span style={{ color: "#666" }}> · {emp.dept} · {"$" + emp.salary.toLocaleString()}</span>
          </span>
          <span>
            <button onClick={() => startEdit(emp)}>✏️</button>
            <button onClick={() => remove(emp.id)} style={{ marginLeft: 4 }}>🗑</button>
          </span>
        </div>
      ))}
      {visible.length === 0 && <p>No employees — add your first one above! 👆</p>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: "8px 14px", background: "#f3f4f6", borderRadius: 8 }}>
      <strong>{value}</strong> <small>{label}</small>
    </div>
  );
}`,
  },
];
