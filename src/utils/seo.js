// Lightweight per-route SEO — sets title, meta description, canonical,
// OpenGraph tags and optional JSON-LD without any dependency.
const SITE = "https://devprep.esscentra.in";

export const DEFAULT_SEO = {
  title: "DevPrep — Master JavaScript & React Interviews | Free Practice Platform",
  description:
    "Free JavaScript & React interview prep: 108 concepts, 315+ interview questions, coding playground, live React sandbox, AI mock interviews and a free practice REST API.",
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function setSEO({ title, description, path = "/", jsonLd = null }) {
  const t = title || DEFAULT_SEO.title;
  const d = (description || DEFAULT_SEO.description).slice(0, 160);
  const url = SITE + path;

  document.title = t;
  upsertMeta("name", "description", d);
  upsertMeta("property", "og:title", t);
  upsertMeta("property", "og:description", d);
  upsertMeta("property", "og:url", url);
  upsertMeta("name", "twitter:title", t);
  upsertMeta("name", "twitter:description", d);
  upsertCanonical(url);

  const existing = document.getElementById("dyn-jsonld");
  if (existing) existing.remove();
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "dyn-jsonld";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

// static titles for the public routes — applied automatically on navigation
export const ROUTE_SEO = {
  "/": DEFAULT_SEO,
  "/concepts": {
    title: "JavaScript & React Concepts for Interviews — 108 Topics Explained | DevPrep",
    description:
      "Every JavaScript and React concept asked in interviews: closures, event loop, hooks, prototypes, promises and more — explained with code examples and interview Q&A.",
  },
  "/playground": {
    title: "JavaScript Coding Practice Online — Playground with Interview Problems | DevPrep",
    description:
      "Solve JavaScript coding interview problems in a VS Code-style online editor with test cases, submissions and instant feedback. Free, in your browser.",
  },
  "/react-lab": {
    title: "React Machine Coding Round Practice — Live Sandbox & Challenges | DevPrep",
    description:
      "Practice 15 real React machine-coding interview challenges in a live CodeSandbox-powered editor with hot reload, npm packages and AI code review.",
  },
  "/visualizer": {
    title: "JavaScript Event Loop Visualizer Online — See Your Code Execute | DevPrep",
    description:
      "Paste any JavaScript code and watch the call stack, microtask queue and event loop execute it step by step. The interview topic, animated.",
  },
  "/api": {
    title: "Free Fake REST API for Practice — No Auth, CORS Enabled | DevPrep",
    description:
      "A free dummy REST API with users, products, todos, posts and quotes. No key, no login, CORS open — perfect for React, fetch and axios practice projects.",
  },
  "/interview": {
    title: "AI Mock Interview for JavaScript & React — Voice + Video | DevPrep",
    description:
      "Take a realistic mock interview: the AI asks questions out loud, you answer on camera, and get scored feedback with model answers. Free.",
  },
  "/news": {
    title: "Tech News — Latest JavaScript, React & Web Dev Updates | DevPrep",
    description:
      "Fresh JavaScript, React and web development news, releases and top articles from Dev.to and Hacker News — updated every 30 minutes.",
  },
  "/leaderboard": {
    title: "Leaderboard — Top JavaScript & React Learners | DevPrep",
    description:
      "See the top DevPrep learners ranked by XP from quizzes, coding problems and mock interviews. Practice daily to climb the board.",
  },
  "/questions": {
    title: "315+ JavaScript & React Interview Questions with Answers | DevPrep",
    description:
      "Every JavaScript and React interview question in one place, with clear answers — from closures and the event loop to hooks and performance.",
  },
};
