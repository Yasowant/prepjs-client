// 10 more real machine-coding round challenges (modern module format).
export default [
  {
    id: "rl-star-rating",
    title: "Star Rating",
    difficulty: "easy",
    asked:
      "Build a 5-star rating component. Stars fill on hover up to the hovered star, clicking locks the rating, and the current rating shows as text. Asked constantly in UI rounds at product companies.",
    approach: [
      "Two states: rating (locked) and hover (preview)",
      "Render 5 stars from an array — filled if index <= (hover || rating)",
      "onMouseEnter sets hover, onMouseLeave clears it, onClick sets rating",
      "Clicking the same star again should clear the rating (nice touch)",
    ],
    starter: `import React, { useState } from "react";

function App() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // TODO: render 5 stars; fill up to hover (preview) or rating (locked)

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Rate your interview prep</h3>
      {/* stars here */}
      <p>{rating ? \`You rated: \${rating}/5\` : "No rating yet"}</p>
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

function App() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Rate your interview prep</h3>
      <div onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            style={{ fontSize: 34, cursor: "pointer", color: n <= shown ? "#f5a623" : "#ccc" }}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n === rating ? 0 : n)}
          >
            ★
          </span>
        ))}
      </div>
      <p>{rating ? \`You rated: \${rating}/5\` : "No rating yet"}</p>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-tabs",
    title: "Tabs Component",
    difficulty: "easy",
    asked:
      "Build a reusable Tabs component: a row of tab buttons, only the active tab's content visible, active tab highlighted. Follow-up: make it work for ANY number of tabs passed as data.",
    approach: [
      "Drive everything from a data array: [{ label, content }]",
      "One state: activeIndex",
      "Map over the array for buttons — style the active one differently",
      "Render only tabs[activeIndex].content below",
    ],
    starter: `import React, { useState } from "react";

const TABS = [
  { label: "HTML", content: "HTML structures the page." },
  { label: "CSS", content: "CSS makes it beautiful." },
  { label: "JavaScript", content: "JS makes it interactive." },
];

function App() {
  // TODO: activeIndex state + tab buttons + active content
  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Tabs</h3>
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

const TABS = [
  { label: "HTML", content: "HTML structures the page." },
  { label: "CSS", content: "CSS makes it beautiful." },
  { label: "JavaScript", content: "JS makes it interactive." },
];

function App() {
  const [active, setActive] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Tabs</h3>
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #eee" }}>
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            style={{
              padding: "8px 16px", border: "none", cursor: "pointer",
              background: "none", fontWeight: i === active ? 700 : 400,
              borderBottom: i === active ? "2px solid #0ea5e9" : "2px solid transparent",
              color: i === active ? "#0ea5e9" : "#333", marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ padding: 12 }}>{TABS[active].content}</p>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-modal",
    title: "Modal / Dialog",
    difficulty: "easy",
    asked:
      "Build a modal: opens on button click, dark overlay behind it, closes on the ✕ button, on overlay click, AND on the Escape key. The Escape part is what separates juniors from mids.",
    approach: [
      "isOpen boolean state",
      "Overlay div (fixed, full screen, rgba bg) with onClick={close}",
      "Modal card stops propagation so clicking inside doesn't close",
      "useEffect: add keydown listener for Escape when open, REMOVE it on cleanup",
    ],
    starter: `import React, { useEffect, useState } from "react";

function App() {
  const [open, setOpen] = useState(false);

  // TODO: overlay + modal card + Escape key via useEffect

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Modal demo</h3>
      <button onClick={() => setOpen(true)}>Open modal</button>
    </div>
  );
}

export default App;`,
    solution: `import React, { useEffect, useState } from "react";

function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey); // cleanup!
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 12, padding: 24, minWidth: 280 }}
      >
        {children}
        <button onClick={onClose} style={{ marginTop: 12 }}>✕ Close</button>
      </div>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Modal demo</h3>
      <button onClick={() => setOpen(true)}>Open modal</button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h4>🎉 I close 3 ways</h4>
          <p>✕ button, overlay click, or Escape key.</p>
        </Modal>
      )}
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-otp-input",
    title: "OTP Input",
    difficulty: "medium",
    asked:
      "Build a 4-digit OTP input: separate boxes, typing a digit auto-focuses the next box, Backspace on an empty box focuses the previous one. A favourite at fintech companies.",
    approach: [
      "State: array of 4 strings; refs: array of 4 input refs (useRef([]))",
      "onChange: keep only the last typed digit, update the array immutably, focus next",
      "onKeyDown: if Backspace and box empty → focus previous box",
      "Derive the full OTP with join('') and show success when length === 4",
    ],
    starter: `import React, { useRef, useState } from "react";

const LENGTH = 4;

function App() {
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const inputsRef = useRef([]);

  // TODO: handleChange(i, value) and handleKeyDown(i, e)

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Enter OTP</h3>
      <div style={{ display: "flex", gap: 8 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            style={{ width: 44, height: 48, fontSize: 22, textAlign: "center" }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;`,
    solution: `import React, { useRef, useState } from "react";

const LENGTH = 4;

function App() {
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const inputsRef = useRef([]);
  const otp = digits.join("");

  function handleChange(i, value) {
    const digit = value.replace(/\\D/g, "").slice(-1); // digits only, keep last
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Enter OTP</h3>
      <div style={{ display: "flex", gap: 8 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            style={{
              width: 44, height: 48, fontSize: 22, textAlign: "center",
              border: "2px solid " + (d ? "#0ea5e9" : "#ccc"), borderRadius: 8,
            }}
          />
        ))}
      </div>
      {otp.length === LENGTH && <p style={{ color: "green" }}>✅ OTP entered: {otp}</p>}
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-autocomplete",
    title: "Autocomplete / Typeahead",
    difficulty: "medium",
    asked:
      "Build a search box with suggestions: filtered list appears as you type, ↑/↓ keys move the highlight, Enter selects, clicking a suggestion selects it. THE classic frontend machine-coding question.",
    approach: [
      "States: query, highlightIndex, isOpen",
      "Derive suggestions by filtering the list with the query (don't store them)",
      "onKeyDown: ArrowDown/ArrowUp move highlight (clamp to bounds), Enter picks",
      "Close the list on selection; reopen on typing",
    ],
    starter: `import React, { useState } from "react";

const FRUITS = ["Apple", "Banana", "Cherry", "Grapes", "Mango", "Orange",
  "Papaya", "Pineapple", "Strawberry", "Watermelon"];

function App() {
  const [query, setQuery] = useState("");
  // TODO: suggestions + keyboard navigation (↑ ↓ Enter)

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Fruit search</h3>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search…"
        style={{ padding: 8, width: 240 }}
      />
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

const FRUITS = ["Apple", "Banana", "Cherry", "Grapes", "Mango", "Orange",
  "Papaya", "Pineapple", "Strawberry", "Watermelon"];

function App() {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);

  const suggestions = query
    ? FRUITS.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    : [];

  function select(value) {
    setQuery(value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      select(suggestions[highlight]);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Fruit search</h3>
      <div style={{ position: "relative", width: 260 }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
          onKeyDown={onKeyDown}
          placeholder="Type to search…"
          style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
        />
        {open && suggestions.length > 0 && (
          <ul style={{
            listStyle: "none", margin: 0, padding: 4, border: "1px solid #ddd",
            borderRadius: 8, position: "absolute", top: "100%", left: 0, right: 0,
            background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}>
            {suggestions.map((s, i) => (
              <li
                key={s}
                onClick={() => select(s)}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: "8px 10px", cursor: "pointer", borderRadius: 6,
                  background: i === highlight ? "#e0f2fe" : "transparent",
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-toast",
    title: "Toast Notifications",
    difficulty: "medium",
    asked:
      "Build a toast system: clicking buttons shows success/error toasts stacked in a corner, each auto-dismisses after 3 seconds, each has a manual ✕. Tests your understanding of timers + state arrays.",
    approach: [
      "State: array of toasts { id, type, message }",
      "addToast pushes with a unique id (Date.now() or a counter)",
      "setTimeout in addToast removes that id after 3s — remove by FILTERING by id, never by index",
      "Render fixed-position stack; ✕ removes immediately",
    ],
    starter: `import React, { useState } from "react";

function App() {
  const [toasts, setToasts] = useState([]);

  // TODO: addToast(type, message) with 3s auto-dismiss + removeToast(id)

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Toasts</h3>
      <button onClick={() => {/* success */}}>Show success</button>{" "}
      <button onClick={() => {/* error */}}>Show error</button>
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

let nextId = 1;

function App() {
  const [toasts, setToasts] = useState([]);

  function removeToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  function addToast(type, message) {
    const id = nextId++;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => removeToast(id), 3000); // auto-dismiss THIS toast
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Toasts</h3>
      <button onClick={() => addToast("success", "Saved successfully! 🎉")}>Show success</button>{" "}
      <button onClick={() => addToast("error", "Something went wrong 😬")}>Show error</button>

      <div style={{ position: "fixed", top: 12, right: 12, display: "flex",
        flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "10px 14px", borderRadius: 8, color: "#fff", minWidth: 220,
            display: "flex", justifyContent: "space-between", gap: 10,
            background: t.type === "success" ? "#16a34a" : "#dc2626",
          }}>
            <span>{t.message}</span>
            <span style={{ cursor: "pointer" }} onClick={() => removeToast(t.id)}>✕</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-carousel",
    title: "Image Carousel",
    difficulty: "medium",
    asked:
      "Build a carousel: prev/next buttons that WRAP around, dot indicators that jump to a slide, and auto-play every 3 seconds that pauses on hover. Timers + cleanup is what they're testing.",
    approach: [
      "State: index; wrap with (index ± 1 + length) % length",
      "Dots: map over slides, onClick={() => setIndex(i)}",
      "Auto-play: useEffect with setInterval; return clearInterval cleanup",
      "Pause on hover: isPaused state gates the interval (add it to the deps!)",
    ],
    starter: `import React, { useEffect, useState } from "react";

const SLIDES = [
  { bg: "#0ea5e9", text: "Slide 1 — JavaScript" },
  { bg: "#8b5cf6", text: "Slide 2 — React" },
  { bg: "#16a34a", text: "Slide 3 — Node.js" },
  { bg: "#f59e0b", text: "Slide 4 — MongoDB" },
];

function App() {
  const [index, setIndex] = useState(0);

  // TODO: next/prev with wrap-around, dots, 3s auto-play with pause on hover

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Carousel</h3>
      <div style={{ background: SLIDES[index].bg, color: "#fff", height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 12, fontSize: 20 }}>
        {SLIDES[index].text}
      </div>
    </div>
  );
}

export default App;`,
    solution: `import React, { useEffect, useState } from "react";

const SLIDES = [
  { bg: "#0ea5e9", text: "Slide 1 — JavaScript" },
  { bg: "#8b5cf6", text: "Slide 2 — React" },
  { bg: "#16a34a", text: "Slide 3 — Node.js" },
  { bg: "#f59e0b", text: "Slide 4 — MongoDB" },
];

function App() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;                    // no interval while hovered
    const t = setInterval(next, 3000);
    return () => clearInterval(t);         // cleanup — the interview point!
  }, [paused]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Carousel {paused && "⏸"}</h3>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: "relative", width: 340 }}
      >
        <div style={{ background: SLIDES[index].bg, color: "#fff", height: 160,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 12, fontSize: 20, transition: "background 0.4s" }}>
          {SLIDES[index].text}
        </div>
        <button onClick={prev} style={{ position: "absolute", left: 8, top: "45%" }}>◀</button>
        <button onClick={next} style={{ position: "absolute", right: 8, top: "45%" }}>▶</button>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{ width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                background: i === index ? "#0ea5e9" : "#cbd5e1" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-cart",
    title: "Shopping Cart",
    difficulty: "medium",
    asked:
      "Build a mini shopping cart: product list with Add buttons, cart with +/− quantity controls, line totals and a grand total. Adding an existing product increases quantity instead of duplicating.",
    approach: [
      "Cart state: array of { ...product, qty }",
      "addToCart: if id exists → map and increment qty, else push with qty 1",
      "changeQty(id, delta): map to new qty; FILTER OUT items that reach 0",
      "Grand total: reduce((sum, item) => sum + item.price * item.qty, 0)",
    ],
    starter: `import React, { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Mechanical Keyboard", price: 3499 },
  { id: 2, name: "Wireless Mouse", price: 999 },
  { id: 3, name: "27\\" Monitor", price: 15999 },
];

function App() {
  const [cart, setCart] = useState([]);

  // TODO: addToCart(product) — no duplicates! — and changeQty(id, delta)

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>🛒 Store</h3>
      {PRODUCTS.map((p) => (
        <div key={p.id} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <span style={{ width: 190 }}>{p.name} — ₹{p.price}</span>
          <button>Add</button>
        </div>
      ))}
      <h4>Cart</h4>
      <p>(empty)</p>
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Mechanical Keyboard", price: 3499 },
  { id: 2, name: "Wireless Mouse", price: 999 },
  { id: 3, name: "27\\" Monitor", price: 15999 },
];

function App() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart((c) => {
      const existing = c.find((x) => x.id === product.id);
      return existing
        ? c.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...product, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((c) =>
      c.map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0) // qty 0 → remove from cart
    );
  }

  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>🛒 Store</h3>
      {PRODUCTS.map((p) => (
        <div key={p.id} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <span style={{ width: 190 }}>{p.name} — ₹{p.price}</span>
          <button onClick={() => addToCart(p)}>Add</button>
        </div>
      ))}

      <h4>Cart</h4>
      {cart.length === 0 && <p>(empty)</p>}
      {cart.map((x) => (
        <div key={x.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
          <span style={{ width: 190 }}>{x.name}</span>
          <button onClick={() => changeQty(x.id, -1)}>−</button>
          <b>{x.qty}</b>
          <button onClick={() => changeQty(x.id, +1)}>+</button>
          <span>₹{x.price * x.qty}</span>
        </div>
      ))}
      {cart.length > 0 && <h4>Total: ₹{total}</h4>}
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-drag-list",
    title: "Drag & Drop Reorder List",
    difficulty: "hard",
    asked:
      "Build a list you can reorder by dragging — no libraries, native HTML5 drag events only. Asked to test whether you understand the DnD event model (dragstart, dragover, drop).",
    approach: [
      "State: items array + dragIndex (which item is being dragged)",
      "draggable attribute on each row; onDragStart stores the index",
      "onDragOver MUST call e.preventDefault() or drop never fires",
      "onDrop: splice the dragged item out and insert at the target index (on a copy)",
    ],
    starter: `import React, { useState } from "react";

const INITIAL = ["Learn closures", "Master the event loop", "Build projects",
  "Mock interviews", "Get the offer 🎉"];

function App() {
  const [items, setItems] = useState(INITIAL);

  // TODO: make rows draggable and reorder on drop

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Prep plan — drag to reorder</h3>
      {items.map((item) => (
        <div key={item} style={{ padding: 10, margin: 6, background: "#f1f5f9",
          borderRadius: 8, cursor: "grab" }}>
          ⠿ {item}
        </div>
      ))}
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

const INITIAL = ["Learn closures", "Master the event loop", "Build projects",
  "Mock interviews", "Get the offer 🎉"];

function App() {
  const [items, setItems] = useState(INITIAL);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  function onDrop(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1); // remove dragged
    next.splice(targetIndex, 0, moved);        // insert at target
    setItems(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>Prep plan — drag to reorder</h3>
      {items.map((item, i) => (
        <div
          key={item}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }} // preventDefault is REQUIRED
          onDrop={() => onDrop(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
          style={{
            padding: 10, margin: 6, borderRadius: 8, cursor: "grab",
            background: i === dragIndex ? "#bae6fd" : "#f1f5f9",
            border: i === overIndex && i !== dragIndex ? "2px dashed #0ea5e9" : "2px solid transparent",
            opacity: i === dragIndex ? 0.6 : 1,
          }}
        >
          ⠿ {item}
        </div>
      ))}
      <p style={{ color: "#64748b", fontSize: 13 }}>
        Order: {items.map((x) => x.split(" ")[1] || x.split(" ")[0]).join(" → ")}
      </p>
    </div>
  );
}

export default App;`,
  },
  {
    id: "rl-file-tree",
    title: "File Explorer Tree",
    difficulty: "hard",
    asked:
      "Render a nested file/folder tree (like VS Code's sidebar) from JSON: folders expand/collapse on click, files are leaves. The interviewer is testing RECURSIVE components.",
    approach: [
      "Data: { name, children? } — children means folder, no children means file",
      "Make a <Node> component that renders itself and maps children to more <Node>s (recursion!)",
      "Each folder keeps its own isOpen state — that's why recursion beats flattening",
      "Indent with paddingLeft based on depth prop",
    ],
    starter: `import React, { useState } from "react";

const TREE = {
  name: "devprep",
  children: [
    { name: "src", children: [
      { name: "components", children: [{ name: "Navbar.jsx" }, { name: "Card.jsx" }] },
      { name: "App.jsx" },
      { name: "index.js" },
    ]},
    { name: "public", children: [{ name: "logo.svg" }] },
    { name: "package.json" },
  ],
};

// TODO: recursive <Node node={...} depth={...} /> component

function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>📁 File explorer</h3>
      {/* <Node node={TREE} depth={0} /> */}
    </div>
  );
}

export default App;`,
    solution: `import React, { useState } from "react";

const TREE = {
  name: "devprep",
  children: [
    { name: "src", children: [
      { name: "components", children: [{ name: "Navbar.jsx" }, { name: "Card.jsx" }] },
      { name: "App.jsx" },
      { name: "index.js" },
    ]},
    { name: "public", children: [{ name: "logo.svg" }] },
    { name: "package.json" },
  ],
};

function Node({ node, depth }) {
  const [open, setOpen] = useState(depth === 0); // root starts open
  const isFolder = Array.isArray(node.children);

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div
        onClick={() => isFolder && setOpen(!open)}
        style={{ cursor: isFolder ? "pointer" : "default", padding: "3px 0", userSelect: "none" }}
      >
        {isFolder ? (open ? "📂" : "📁") : "📄"} {node.name}
        {isFolder && <span style={{ color: "#94a3b8" }}> {open ? "▾" : "▸"}</span>}
      </div>
      {isFolder && open &&
        node.children.map((child) => (
          <Node key={child.name} node={child} depth={depth + 1} /> // recursion!
        ))}
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 8 }}>
      <h3>📁 File explorer</h3>
      <Node node={TREE} depth={0} />
    </div>
  );
}

export default App;`,
  },
];
