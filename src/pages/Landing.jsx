import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

/* ---------- helpers ---------- */

// scroll-reveal wrapper
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("revealed");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div className="reveal" ref={ref}>{children}</div>;
}

// animated count-up number
function CountUp({ to, suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1200;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <strong ref={ref}>{n}{suffix}</strong>;
}

// typing code effect
const TYPED_LINES = [
  'console.log("start");',
  "setTimeout(() => console.log('timer'), 0);",
  "Promise.resolve().then(() => console.log('promise'));",
  'console.log("end");',
  "",
  "// → start, end, promise, timer  🤯",
  "// Can you explain WHY? DevPrep can.",
];

function TypingCode() {
  const [text, setText] = useState("");
  useEffect(() => {
    const full = TYPED_LINES.join("\n");
    let i = 0;
    let timer;
    const type = () => {
      i++;
      setText(full.slice(0, i));
      if (i < full.length) timer = setTimeout(type, full[i - 1] === "\n" ? 140 : 24);
      else timer = setTimeout(() => { i = 0; setText(""); timer = setTimeout(type, 600); }, 6000);
    };
    timer = setTimeout(type, 700);
    return () => clearTimeout(timer);
  }, []);
  return (
    <pre className="typing-pre">{text}<span className="type-cursor">▍</span></pre>
  );
}

/* ---------- data ---------- */

const FLOATERS = ["=>", "async", "{ }", "??", "...spread", "await", "this", "===", "[ ]", "npm run dev", "useState()", "console.log"];

const FEATURES = [
  { icon: "📚", title: "108+ Concepts, Zero Gaps", desc: "JavaScript from variables to V8 internals, React from JSX to concurrent rendering — with runnable code and real interview answers." },
  { icon: "⚛️", title: "Full React Track", desc: "Hooks deep-dives, Virtual DOM, performance, Redux, React 18 — plus the most-asked React interview questions." },
  { icon: "🎯", title: "315+ Q&A Bank", desc: "Every interview question in one place — filter by JS or React, search, and rehearse answers out loud." },
  { icon: "⌨️", title: "VS Code Playground", desc: "The real Monaco editor in your browser. Coding problems with auto-tests, scenario projects, and a live terminal." },
  { icon: "🤖", title: "AI Doubt Coach", desc: "Stuck on closures or useEffect at 2 AM? Ask anything — answers like a friendly senior dev, with code." },
  { icon: "📈", title: "Progress Tracking", desc: "Quizzes with tricky traps, per-category progress bars, bookmarks — watch yourself become interview-ready." },
];

const PREVIEWS = [
  { id: "closures", icon: "🔒", title: "Closures", level: "intermediate", teaser: "A function that remembers the scope it was born in — THE most asked JS question." },
  { id: "event-loop", icon: "⏳", title: "Event Loop", level: "advanced", teaser: "Sync → microtasks → macrotasks. Predict any console.log ordering question." },
  { id: "jsx", icon: "⚛️", title: "JSX", level: "basic", teaser: "It compiles to React.createElement — why className, braces, and one root element." },
  { id: "virtual-dom", icon: "🌳", title: "Virtual DOM", level: "intermediate", teaser: "How React diffs trees and patches only what changed — reconciliation explained." },
  { id: "this-keyword", icon: "🎯", title: "The 'this' Keyword", level: "intermediate", teaser: "Four binding rules + arrows. Never be surprised by this again." },
  { id: "state-usestate", icon: "🪝", title: "State & useState", level: "basic", teaser: "Why setCount(count+1) twice adds one — batching, closures, functional updates." },
  { id: "memory-stack-heap", icon: "🧠", title: "Stack vs Heap", level: "intermediate", teaser: "Where variables actually live — frames, references, and stack overflow." },
  { id: "debounce-throttle", icon: "🚀", title: "Debounce & Throttle", level: "advanced", teaser: "The must-write utilities of every machine coding round." },
];

const ROADMAP = [
  ["JS Fundamentals", "Variables · Types · Coercion · Operators · Loops"],
  ["Functions & Scope", "Arrows · Closures · Hoisting · Currying · IIFE"],
  ["JS Internals", "Execution Context · Stack vs Heap · Memory · GC"],
  ["Objects, OOP & Arrays", "this · Prototypes · Classes · map/filter/reduce"],
  ["Async JavaScript", "Event Loop · Promises · async/await · fetch"],
  ["Advanced JS + Coding", "Debounce · Patterns · Polyfills · Tricky Outputs"],
  ["React Basics & Hooks", "JSX · Props · State · useEffect · Custom Hooks"],
  ["React Advanced", "Virtual DOM · Performance · Redux · React 18"],
];

const TESTIMONIALS = [
  { name: "Ananya S.", role: "SDE-1 @ fintech startup", text: "The tricky quiz humbled me on day one. Two weeks later I answered the exact [] == ![] question in my interview. Offer letter in hand. 🙌", avatar: "👩‍💻" },
  { name: "Rohit K.", role: "Frontend Dev, 3 YOE", text: "I've read closures 10 times before. The playground made it click in 10 minutes — predicting output before running is genius practice.", avatar: "👨‍💻" },
  { name: "Priya M.", role: "Fresher → React Dev", text: "Went from 'what is hoisting' to explaining the event loop on a whiteboard. The AI coach answered every silly doubt without judging. 😄", avatar: "🧑‍💻" },
];

const FAQS = [
  ["Is DevPrep really free?", "Yes — every concept, quiz, the playground and the AI coach are free. Just sign up and verify your email."],
  ["Does it cover React or only JavaScript?", "Both, fully. The React track has 27 concepts and 100+ interview Q&A: JSX, hooks deep-dives, Virtual DOM, performance, Redux, React 18 concurrent features, and the most-asked practical scenario questions."],
  ["I'm a complete beginner. Will I understand it?", "Absolutely. Concepts are organized basic → intermediate → advanced. Start with JS Fundamentals, and several concepts (including JSX and useState) are open without even logging in."],
  ["How is this different from YouTube tutorials?", "Every concept is structured for interviews: explanation + runnable code + the actual Q&A interviewers ask. Plus a 315-question Q&A bank, quizzes to prove you retained it, and progress tracking to keep you honest."],
  ["Does it cover machine coding rounds?", "Yes — polyfills (map, bind, Promise.all), debounce/throttle, deep clone, event emitters, coding problems with auto-tests, and scenario projects like LRU cache and rate limiters."],
  ["Can I practice code inside DevPrep?", "Yes — the Playground is a real VS Code (Monaco) editor with coding problems, projects, runnable snippets and your own files, saved in your browser."],
];

/* ---------- page ---------- */

export default function Landing() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ concepts: 81, categories: 11 });
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    api("/concepts/categories")
      .then((cats) =>
        setStats({
          concepts: cats.reduce((a, c) => a + c.count, 0),
          categories: cats.length,
          cats,
        })
      )
      .catch(() => {});
    api("/stats").then(setCommunity).catch(() => {});
  }, []);

  return (
    <div className="landing">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-bg" />

      {/* HERO */}
      <section className="hero">
        {FLOATERS.map((f, i) => (
          <span className="floater" key={f} style={{ "--i": i }}>{f}</span>
        ))}

        <div className="hero-badge">
          <span className="pulse-dot" /> {stats.concepts}+ concepts · quizzes · playground · AI coach
        </div>
        <h1>
          Master <span className="gradient-text shimmer">JavaScript & React</span>
          <br /> from Basics to Interview-Ready
        </h1>
        <p className="hero-sub">
          The complete frontend interview prep platform — every JS & React concept,
          the traps, the polyfills, hooks deep-dives, a VS Code playground and a 24/7 AI coach.
        </p>
        <p className="hero-tagline">From <code>console.log</code> to offer letter. 🚀</p>
        <div className="hero-cta">
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg btn-glow">
            {user ? "Go to Dashboard →" : "Start Learning Free →"}
          </Link>
        </div>
        {community && community.learners > 0 && (
          <div className="hero-proof">
            <span className="hero-proof-avatars">
              {["👩‍💻", "👨‍💻", "🧑‍💻"].map((a, i) => (
                <span className="hero-proof-avatar" key={i}>{a}</span>
              ))}
            </span>
            {community.accepted > 0 ? (
              <>🏆 <strong>{community.accepted}</strong> solution{community.accepted !== 1 && "s"} accepted
              · <strong>{community.learners}</strong> learner{community.learners !== 1 && "s"} prepping — join them</>
            ) : (
              <><strong>{community.learners}</strong> learner{community.learners !== 1 && "s"} already prepping — join them 🚀</>
            )}
          </div>
        )}

        <div className="hero-tracks">
          <Link to="/concepts?track=js" className="track-card">
            <span className="track-card-icon">⚡</span>
            <span className="track-card-body">
              <strong>JavaScript</strong>
              <small>Concepts + interview Q&A · basics → internals</small>
            </span>
            <span className="track-card-arrow">→</span>
          </Link>
          <Link to="/concepts?track=react" className="track-card react">
            <span className="track-card-icon">⚛️</span>
            <span className="track-card-body">
              <strong>React.js</strong>
              <small>Concepts + interview Q&A · JSX → React 18</small>
            </span>
            <span className="track-card-arrow">→</span>
          </Link>
        </div>

        <div className="code-window hero-window">
          <div className="code-titlebar">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="code-filename">interview.js — asked at every interview</span>
          </div>
          <TypingCode />
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div><CountUp to={stats.concepts} suffix="+" /><span>Concepts</span></div>
        <div><CountUp to={2} /><span>Tracks: JS + React</span></div>
        <div><CountUp to={315} suffix="+" /><span>Interview Q&A</span></div>
        <div><CountUp to={99} /><span>Quiz Questions</span></div>
        <div><CountUp to={21} /><span>Coding Problems & Projects</span></div>
      </section>

      {/* CATEGORIES */}
      {stats.cats && (
        <section className="section">
          <Reveal>
            <h2>One library. <span className="gradient-text">Every topic.</span></h2>
          </Reveal>
          <div className="cat-grid">
            {stats.cats.map((c, i) => (
              <Reveal key={c.id} delay={i * 40}>
                <Link to={`/concepts?category=${c.id}`} className="cat-card">
                  <span className="cat-icon">{c.icon}</span>
                  <div>
                    <h4>{c.name}</h4>
                    <p>{c.description}</p>
                  </div>
                  <span className="cat-count">{c.count}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CONCEPT PREVIEWS */}
      <section className="section">
        <Reveal><h2>A taste of the <span className="gradient-text">concepts</span> inside</h2></Reveal>
        <div className="preview-grid">
          {PREVIEWS.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <Link to={`/concepts/${p.id}`} className="preview-card">
                <div className="preview-top">
                  <span className="preview-icon">{p.icon}</span>
                  <span className={`level-badge ${p.level}`}>{p.level}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.teaser}</p>
                <span className="preview-link">Read free →</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="center-cta">
          <Link to="/concepts" className="btn btn-outline">View all {stats.concepts}+ concepts</Link>
        </div>
      </section>

      {/* PLAYGROUND PROMO */}
      <section className="section pg-promo">
        <Reveal>
          <div className="pg-promo-text">
            <h2 style={{ textAlign: "left" }}>
              Practice in a <span className="gradient-text">VS Code editor</span> — right in the browser
            </h2>
            <p>
              Real Monaco editor, runnable snippets for closures, the event loop,{" "}
              <code>this</code>, promises and polyfills — with a live terminal and your own
              practice files. Predict the output, hit Run, learn instantly.
            </p>
            <Link to="/playground" className="btn btn-primary btn-lg btn-glow">⌨️ Open Playground</Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="code-window pg-promo-window">
            <div className="code-titlebar">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              <span className="code-filename">closures.js — DevPrep Playground</span>
            </div>
            <pre>{`function makeCounter() {
  let count = 0;        // private via closure
  return () => ++count;
}
const counter = makeCounter();
console.log(counter()); // ▶ 1
console.log(counter()); // ▶ 2

TERMINAL
✓ 1
✓ 2`}</pre>
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section className="section">
        <Reveal><h2>Everything you need. <span className="gradient-text">Nothing you don't.</span></h2></Reveal>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="section">
        <Reveal><h2>Your <span className="gradient-text">roadmap</span> to the offer letter</h2></Reveal>
        <div className="roadmap">
          {ROADMAP.map(([title, desc], i) => (
            <Reveal key={title} delay={i * 40}>
              <div className="roadmap-step">
                <div className="roadmap-num">{i + 1}</div>
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <Reveal><h2>Devs who <span className="gradient-text">cracked it</span></h2></Reveal>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="testi-card">
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-who">
                  <span className="testi-avatar">{t.avatar}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <Reveal><h2>Questions? <span className="gradient-text">Answered.</span></h2></Reveal>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 40}>
              <details className="qa faq">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DEVELOPER */}
      <section className="section" id="developer">
        <Reveal>
          <h2>Building <span className="gradient-text shimmer">Engineers</span>, Not Just Coders</h2>
          <p className="dev-section-sub">— from the developer behind DevPrep</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="dev-card">
            <div className="dev-photo-wrap">
              <img src="/yasowant.jpg" alt="Yasowant Nayak" className="dev-photo" />
              <div className="dev-photo-glow" />
            </div>
            <div className="dev-info">
              <h3>Yasowant Nayak</h3>
              <p className="dev-role">Full Stack Software Engineer · Bangalore, India</p>
              <p className="dev-desc">
                Full Stack Engineer with <strong>3+ years</strong> building production SaaS on
                React.js and Node.js — scaling a multi-tenant platform to <strong>8+ enterprise
                organizations</strong>, cutting release time 50% with CI/CD, and mentoring
                developers along the way. I built DevPrep from the exact concepts and questions
                asked in real interviews, so you can walk in prepared for what actually comes up.
              </p>
              <div className="dev-tech">
                {["React.js", "Next.js", "TypeScript", "Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "Docker", "CI/CD"].map((t) => (
                  <span className="chip small" key={t}>{t}</span>
                ))}
              </div>
              <div className="dev-links">
                <a href="https://yasowantdev.info" target="_blank" rel="noreferrer" className="btn btn-outline">🌐 Portfolio</a>
                <a href="https://www.linkedin.com/in/yasowant-nayak-154968269/" target="_blank" rel="noreferrer" className="btn btn-outline">💼 LinkedIn</a>
                <a href="https://github.com/Yasowant" target="_blank" rel="noreferrer" className="btn btn-outline">🐙 GitHub</a>
                <a href="mailto:yasowant1998@gmail.com" className="btn btn-outline">✉️ Email</a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="cta-final">
        <Reveal>
          <div className="cta-box">
            <div className="cta-rays" />
            <div className="cta-left">
              <div className="cta-title-row">
                <Logo size={46} />
                <h2>Your next interview is coming.<br /><span className="gradient-text shimmer">Be ready for it.</span></h2>
              </div>
              <p className="cta-sub">
                Unlock all {stats.concepts}+ JavaScript & React concepts, the 315+ Q&A bank,
                the coding playground, quizzes and your personal AI coach — everything in one place.
              </p>
              <div className="cta-checks">
                <span>✓ Free forever</span>
                <span>✓ No credit card</span>
                <span>✓ Just verify your email</span>
              </div>
            </div>
            <div className="cta-right">
              <Link to={user ? "/concepts" : "/register"} className="btn btn-primary btn-lg btn-glow">
                {user ? "Continue Learning →" : "Create Free Account →"}
              </Link>
              {!user && <Link to="/playground" className="btn btn-outline btn-lg">Try it first — no signup</Link>}
              <div className="cta-terminal">
                <span className="cta-prompt">$</span> npm run crack-interview
                <span className="cta-ok"> ✓</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="footer-big">
        <div className="footer-grid">
          <div className="footer-col footer-brand-col">
            <span className="footer-brand"><Logo size={30} /> Dev<span className="brand-accent">Prep</span></span>
            <p className="footer-tagline">From <code>console.log</code> to offer letter. 🚀</p>
            <p className="footer-mini">
              The complete JavaScript & React interview prep platform — every concept,
              a 315+ Q&A bank, a VS Code playground, quizzes, and a 24/7 AI coach.
            </p>
            <span className="footer-stack">React · Node.js · Express · MongoDB</span>
          </div>

          <div className="footer-col">
            <h4>Learn</h4>
            <Link to="/concepts?track=js">JavaScript Concepts</Link>
            <Link to="/concepts?track=react">React Concepts</Link>
            <Link to="/questions">Q&A Bank</Link>
            <Link to="/playground">Playground</Link>
            <Link to="/quiz">Quizzes</Link>
            <Link to="/chat">AI Coach</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/register">Create account</Link>
            <Link to="/login">Login</Link>
            <Link to="/dashboard">Dashboard</Link>
            <a href="#developer">About the developer</a>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <a href="https://www.linkedin.com/in/yasowant-nayak-154968269/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="https://github.com/Yasowant" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://yasowantdev.info" target="_blank" rel="noreferrer">Portfolio ↗</a>
            <a href="mailto:yasowant1998@gmail.com">Email</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DevPrep · Developed with ❤️ by <a href="#developer">Yasowant Nayak</a></span>
          <span className="footer-code">while (!offer) &#123; prep(); &#125;</span>
        </div>
      </footer>
    </div>
  );
}
