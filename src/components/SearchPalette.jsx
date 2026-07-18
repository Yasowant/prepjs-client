import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { PROBLEMS } from "../data/problems.js";
import { REACT_CHALLENGES } from "../data/reactLab.js";
import { PROJECTS_DATA } from "../data/projects.js";

const PAGES = [
  { title: "Concepts", sub: "108 JS & React concepts", to: "/concepts", icon: "📚" },
  { title: "Interview Q&A", sub: "315+ questions in one place", to: "/questions", icon: "❓" },
  { title: "Playground", sub: "VS Code-style coding practice", to: "/playground", icon: "💻" },
  { title: "React Lab", sub: "Machine-coding challenges + sandboxes", to: "/react-lab", icon: "⚛️" },
  { title: "Event Loop Visualizer", sub: "Watch your code execute step by step", to: "/visualizer", icon: "⏳" },
  { title: "Free API", sub: "Fake REST API for practice projects", to: "/api", icon: "🔌" },
  { title: "Mock Interview", sub: "AI-graded timed interview", to: "/interview", icon: "🎤" },
  { title: "Flashcards", sub: "Rapid Q&A revision deck", to: "/flashcards", icon: "🃏" },
  { title: "Leaderboard", sub: "Top learners by XP", to: "/leaderboard", icon: "🏆" },
  { title: "Quiz", sub: "109 questions, 12 categories", to: "/quiz", icon: "📝" },
  { title: "AI Coach", sub: "Ask any JavaScript doubt", to: "/chat", icon: "🤖" },
  { title: "Dashboard", sub: "Your progress, streak & badges", to: "/dashboard", icon: "📊" },
  { title: "Profile", sub: "Account settings & avatar", to: "/profile", icon: "👤" },
];

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [concepts, setConcepts] = useState(null); // lazy-fetched
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // open triggers: Ctrl/Cmd+K and navbar button
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  // focus + lazy-load concepts on open
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 30);
    if (!concepts) {
      api("/concepts").then(setConcepts).catch(() => setConcepts([]));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const index = useMemo(() => {
    const items = [
      ...PAGES.map((p) => ({ ...p, type: "Page" })),
      ...(concepts || []).map((c) => ({
        title: c.title,
        sub: `${c.category.replace(/-/g, " ")} · ${c.level}`,
        to: `/concepts/${c.id}`,
        icon: "📖",
        type: "Concept",
      })),
      ...PROBLEMS.map((p) => ({
        title: p.title,
        sub: `coding problem · ${p.difficulty || "practice"}`,
        to: "/playground",
        icon: "🧩",
        type: "Problem",
      })),
      ...REACT_CHALLENGES.map((c) => ({
        title: c.title,
        sub: "React machine-coding challenge",
        to: "/react-lab",
        icon: "⚛️",
        type: "Challenge",
      })),
      ...PROJECTS_DATA.map((p) => ({
        title: p.title,
        sub: `scenario project · ${p.difficulty}`,
        to: "/playground",
        icon: "🛠",
        type: "Project",
      })),
    ];
    return items;
  }, [concepts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 9);
    const scored = [];
    for (const item of index) {
      const t = item.title.toLowerCase();
      const s = (item.sub || "").toLowerCase();
      let score = -1;
      if (t.startsWith(q)) score = 3;
      else if (t.includes(q)) score = 2;
      else if (s.includes(q)) score = 1;
      if (score >= 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12).map((x) => x.item);
  }, [query, index]);

  useEffect(() => setActive(0), [results.length, query]);

  function go(item) {
    setOpen(false);
    navigate(item.to);
  }

  function onInputKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active]);
    }
  }

  // keep active row in view
  useEffect(() => {
    listRef.current
      ?.querySelector(".sp-row.active")
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="sp-overlay" onClick={() => setOpen(false)}>
      <div className="sp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sp-input-row">
          <span className="sp-icon">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search concepts, problems, challenges, pages…"
          />
          <kbd className="sp-esc">esc</kbd>
        </div>

        <div className="sp-list" ref={listRef}>
          {results.length === 0 && (
            <p className="sp-empty">No results for “{query}”</p>
          )}
          {results.map((item, i) => (
            <button
              key={item.type + item.title + item.to}
              className={`sp-row ${i === active ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
            >
              <span className="sp-row-icon">{item.icon}</span>
              <span className="sp-row-body">
                <span className="sp-row-title">{item.title}</span>
                <span className="sp-row-sub">{item.sub}</span>
              </span>
              <span className="sp-row-type">{item.type}</span>
            </button>
          ))}
        </div>

        <div className="sp-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
