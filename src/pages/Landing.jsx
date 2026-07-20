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
  { icon: "📚", title: "108+ Concepts, Zero Gaps", desc: "JavaScript from variables to V8 internals, React from JSX to concurrent rendering — every concept explained with runnable code, the exact interview answer, and your own saved notes." },
  { icon: "⚛️", title: "React Lab — Real CodeSandbox Engine", desc: "25 machine-coding challenges (Todo, OTP Input, Autocomplete, Drag & Drop…) in a live editor with hot reload, real npm packages, code folding — and an AI reviewer that scores your solution /10." },
  { icon: "🎤", title: "AI Mock Interview — Voice + Video", desc: "The AI asks 7 questions out loud, you answer on camera, and get a scored report with feedback, model answers and a hire signal. Your recording is saved so you can rewatch yourself." },
  { icon: "⌨️", title: "Coding Playground + Judge", desc: "LeetCode-style problems with auto-tests and saved submissions, plus real-world projects: LRU cache, rate limiter, event emitter — all in a VS Code editor." },
  { icon: "🃏", title: "Flashcards & Tricky Quizzes", desc: "Rapid-revision flashcard decks of all 315+ Q&A ('Knew it' vs 'Revise again'), plus 109 quiz questions including the traps that fail candidates: [] == ![], map(parseInt), the var loop…" },
  { icon: "🤖", title: "AI Doubt Coach", desc: "Stuck on closures or useEffect at 2 AM? Ask anything — answers like a friendly senior dev, with code, saved like ChatGPT." },
  { icon: "🔥", title: "Streaks, XP & Certificates", desc: "Daily streaks, XP for everything you solve, 11 badges, a community leaderboard — and a shareable certificate when you complete a track. Post it on LinkedIn." },
  { icon: "🔌", title: "Free Public REST API", desc: "A dummyjson-style practice API (users, products, todos, posts, quotes) — no key, no login, CORS open. Build your fetch/axios projects against it from anywhere." },
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
  ["Prove It", "AI Mock Interview · Flashcards · Certificate 🎓"],
];

const TESTIMONIALS = [
  { name: "Ananya S.", role: "SDE-1 @ fintech startup", text: "The tricky quiz humbled me on day one. Two weeks later I answered the exact [] == ![] question in my interview. Offer letter in hand. 🙌", avatar: "👩‍💻" },
  { name: "Rohit K.", role: "Frontend Dev, 3 YOE", text: "I've read closures 10 times before. The playground made it click in 10 minutes — predicting output before running is genius practice.", avatar: "👨‍💻" },
  { name: "Priya M.", role: "Fresher → React Dev", text: "Went from 'what is hoisting' to explaining the event loop on a whiteboard. The AI coach answered every silly doubt without judging. 😄", avatar: "🧑‍💻" },
];

const FAQS = [
  ["Is DevPrep really free?", "Yes — every concept, the mock interviews, React Lab, playground, flashcards, quizzes, AI coach and the public API are free. Just sign up and verify your email."],
  ["How does the AI mock interview work?", "Pick a track (JavaScript, React or Full Stack) and level, and the AI interviewer asks 7 questions out loud — starting with 'introduce yourself'. You answer by speaking with your camera on (or typing). At the end you get a score per answer, honest feedback, model answers and a hire signal — and your video is saved so you can rewatch your own performance."],
  ["Does it cover machine coding rounds?", "Deeply — the React Lab runs the real CodeSandbox engine with 25 live challenges: Todo, Debounce Search, OTP Input, Autocomplete, Drag & Drop, Infinite Scroll, File Explorer Tree and more. Hot reload as you type, real npm packages, approach checklists, full solutions — and an AI reviewer that scores your submission against the requirements."],
  ["Does it cover React or only JavaScript?", "Both, fully. The React track has 27 concepts and 100+ interview Q&A: JSX, hooks deep-dives, Virtual DOM, performance, Redux, React 18 concurrent features, and the most-asked practical scenario questions."],
  ["I'm a complete beginner. Will I understand it?", "Absolutely. Concepts are organized basic → intermediate → advanced, and every concept's explanation is free to read without logging in. Start with JS Fundamentals and work up the roadmap."],
  ["How do I stay consistent?", "DevPrep is built for daily practice: streaks that grow every day you show up, XP and levels for everything you solve, 11 badges, a community leaderboard — and when you complete a full track, a certificate with your name you can add to LinkedIn."],
  ["What's the free public API?", "A dummyjson-style REST API (users, products, todos, posts, quotes) with zero setup — no key, no login, CORS open to every origin. Perfect for practicing fetch, axios, pagination and infinite scroll in your own projects."],
];

/* ---------- page ---------- */

export default function Landing() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ concepts: 81, categories: 11 });
  const [community, setCommunity] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    api("/news").then((d) => setNews((d.items || []).slice(0, 6))).catch(() => {});
  }, []);

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
          <span className="pulse-dot" /> {stats.concepts}+ concepts · AI mock interviews · live React editor · free API
        </div>
        <h1>
          Crack Your <span className="gradient-text shimmer">JavaScript & React</span>
          <br /> Interviews — In One Place
        </h1>
        <p className="hero-sub">
          Learn every concept with runnable code. Rehearse 315+ real questions with
          flashcards. Build components in a live CodeSandbox-powered editor. Then face an
          AI interviewer on camera and get scored like the real thing. Free, forever.
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
        <div><CountUp to={315} suffix="+" /><span>Interview Q&A</span></div>
        <div><CountUp to={46} /><span>Coding Challenges</span></div>
        <div><CountUp to={109} /><span>Quiz Questions</span></div>
        <div><CountUp to={100} suffix="%" /><span>Free Forever</span></div>
      </section>

      {/* WHAT IS DEVPREP — clear explanation + SEO text */}
      <section className="section seo-intro">
        <Reveal>
          <h2>What is <span className="gradient-text">DevPrep</span>?</h2>
          <div className="seo-text">
            <p>
              DevPrep is a <strong>free JavaScript and React interview preparation platform</strong>.
              Instead of scattered YouTube videos and blog posts, everything lives in one place:
              concepts explained the way interviewers expect you to explain them, real interview
              questions with model answers, and hands-on coding practice with instant feedback.
            </p>
            <p>
              The flow is simple — <strong>Learn</strong> a concept with runnable code,{" "}
              <strong>Rehearse</strong> it with flashcards and the Q&A bank,{" "}
              <strong>Practice</strong> it in the coding playground or the CodeSandbox-powered
              React Lab, and <strong>Prove</strong> it in an AI mock interview — on camera,
              scored like the real thing. Finish a track and earn a{" "}
              <strong>shareable certificate</strong> for your LinkedIn. Your progress, code,
              notes and interview recordings are all saved to your free account.
            </p>
          </div>
        </Reveal>
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

      {/* FREE API PROMO */}
      <section className="section pg-promo api-promo">
        <Reveal delay={120}>
          <div className="code-window pg-promo-window">
            <div className="code-titlebar">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              <span className="code-filename">your-project.js — works from anywhere</span>
            </div>
            <pre>{`// no key · no login · CORS open
fetch("https://prepjs-server.onrender.com/api/v1/products?limit=5")
  .then((res) => res.json())
  .then((data) => console.log(data.products));

// 👥 users  🛍 products  ✅ todos
// 📝 posts  💬 quotes — all free
// + search & pagination built in`}</pre>
          </div>
        </Reveal>
        <Reveal>
          <div className="pg-promo-text">
            <h2 style={{ textAlign: "left" }}>
              A <span className="gradient-text">free REST API</span> for your practice projects
            </h2>
            <p>
              Building a todo app, product list or infinite scroll? Don't mock data by hand —
              DevPrep ships a dummyjson-style API with <strong>210+ records</strong> across users,
              products, todos, posts and quotes. Pagination, search and simulated writes included.
              No key, no login, works from localhost, CodePen, Postman — anywhere.
            </p>
            <Link to="/api" className="btn btn-primary btn-lg btn-glow">🔌 Explore the Free API</Link>
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

      {/* TECH NEWS */}
      {news.length > 0 && (
        <section className="section">
          <Reveal>
            <h2>Stay current. <span className="gradient-text">Today's tech news.</span></h2>
            <p className="dev-section-sub">
              Fresh JavaScript & React news inside DevPrep — read full articles without leaving.
            </p>
          </Reveal>
          <div className="lnews-grid">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={i * 60}>
                <Link to="/news" className="lnews-card">
                  {n.image ? (
                    <img src={n.image} alt="" className="lnews-img" loading="lazy" />
                  ) : (
                    <div className="lnews-img lnews-img-fallback">📰</div>
                  )}
                  <div className="lnews-body">
                    <span className={`news-source ${n.source === "Hacker News" ? "hn" : "devto"}`}>
                      {n.source}
                    </span>
                    <h3>{n.title}</h3>
                    <span className="lnews-meta">▲ {n.points} · 💬 {n.comments}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="center-cta">
            <Link to="/news" className="btn btn-outline">📰 Read all tech news →</Link>
          </div>
        </section>
      )}

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
      <section className="section dev-section" id="developer">
        <div className="dev-bg-icons" aria-hidden="true">
          {["⚛️", "JS", "🟢", "🍃", "🐳", "TS", "{ }", "</>", "⚡", "🚀", "npm", "☁️"].map((s, i) => (
            <span key={i} style={{ "--i": i }}>{s}</span>
          ))}
        </div>
        <Reveal>
          <h2>Building <span className="gradient-text shimmer">Engineers</span>, Not Just Coders</h2>
          <p className="dev-section-sub">— from the developer behind DevPrep</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="dev-card">
            <div className="dev-photo-side">
              <div className="dev-photo-wrap">
                <div className="dev-ring" />
                <img src="/yasowant.jpg" alt="Yasowant Nayak" className="dev-photo" />
                <div className="dev-photo-glow" />
                <span className="dev-photo-badge">👨‍💻</span>
              </div>
              <span className="dev-open-badge"><span className="pulse-dot" /> Building in public</span>
            </div>
            <div className="dev-info">
              <h3>Yasowant Nayak</h3>
              <div className="dev-role-rotator">
                <span>Full Stack Software Engineer 🚀</span>
                <span>React.js & Node.js Specialist ⚛️</span>
                <span>Creator of DevPrep 🎓</span>
              </div>
              <p className="dev-loc">📍 Bangalore, India</p>

              <div className="dev-stats">
                <div><strong>3+</strong><span>years exp</span></div>
                <div><strong>8+</strong><span>enterprise orgs</span></div>
                <div><strong>50%</strong><span>faster releases</span></div>
                <div><strong>108</strong><span>concepts here</span></div>
              </div>

              <p className="dev-desc">
                I build production SaaS on React.js and Node.js — and I built DevPrep from
                the <strong>exact concepts and questions asked in real interviews</strong>,
                so you can walk in prepared for what actually comes up.
              </p>
              <div className="dev-tech">
                {["React.js", "Next.js", "TypeScript", "Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "Docker", "CI/CD"].map((t, i) => (
                  <span className="chip small dev-chip" style={{ "--d": `${i * 70}ms` }} key={t}>{t}</span>
                ))}
              </div>
              <div className="dev-links">
                <a href="https://yasowantdev.info" target="_blank" rel="noreferrer" className="btn btn-outline dev-link">🌐 Portfolio</a>
                <a href="https://www.linkedin.com/in/yasowant-nayak-154968269/" target="_blank" rel="noreferrer" className="btn btn-outline dev-link">💼 LinkedIn</a>
                <a href="https://github.com/Yasowant" target="_blank" rel="noreferrer" className="btn btn-outline dev-link">🐙 GitHub</a>
                <a href="mailto:yasowant1998@gmail.com" className="btn btn-outline dev-link">✉️ Email</a>
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
                Unlock all {stats.concepts}+ concepts, 315+ Q&A with flashcards, 46 coding
                challenges, AI mock interviews on camera, streaks & certificates — everything
                in one place.
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
              Free JavaScript & React interview prep — learn, practice, get interviewed
              by AI, earn your certificate.
            </p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/in/yasowant-nayak-154968269/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com/Yasowant" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://yasowantdev.info" target="_blank" rel="noreferrer">Portfolio</a>
              <a href="mailto:yasowant1998@gmail.com">Email</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Learn</h4>
            <Link to="/concepts?track=js">JavaScript Concepts</Link>
            <Link to="/concepts?track=react">React Concepts</Link>
            <Link to="/questions">Q&A Bank</Link>
            <Link to="/flashcards">Flashcards</Link>
            <Link to="/quiz">Quizzes</Link>
            <Link to="/news">Tech News</Link>
          </div>

          <div className="footer-col">
            <h4>Practice</h4>
            <Link to="/playground">Playground</Link>
            <Link to="/react-lab">React Lab</Link>
            <Link to="/visualizer">Event Loop Visualizer</Link>
            <Link to="/interview">AI Mock Interview</Link>
            <Link to="/api">Free API</Link>
          </div>

          <div className="footer-col">
            <h4>Achieve</h4>
            <Link to="/dashboard">Certificates 🎓</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/register">Create free account</Link>
            <a href="#developer">About the developer</a>
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
