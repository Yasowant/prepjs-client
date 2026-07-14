import { useState } from "react";
import { Link } from "react-router-dom";

const SKILLS = {
  Frontend: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "Redux", "Tailwind CSS"],
  Backend: ["Node.js", "Express.js", "REST", "GraphQL", "WebSockets", "JWT", "RBAC"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
  "DevOps & Testing": ["Docker", "GitHub Actions", "CI/CD", "Vercel", "Jest", "React Testing Library"],
  "System Design": ["Scalability", "Caching", "High Availability", "Rate Limiting", "Multi-Tenant Architecture", "Event-Driven"],
};

const EXPERIENCE = [
  {
    role: "Full Stack Developer",
    company: "SPM Global Technologies — Bangalore",
    period: "Aug 2023 – Present",
    points: [
      "Cut feature development time 35% with a reusable React component library & shared design system",
      "Reduced page load times 40% via code splitting, lazy loading and memoization",
      "Accelerated releases 50% by automating CI/CD with GitHub Actions and Docker",
      "Scaled a multi-tenant platform to 8+ enterprise organizations with HA & fault tolerance",
      "Mentors junior developers and runs peer code reviews",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "JSpiders — Bangalore",
    period: "Sep 2022 – Jul 2023",
    points: [
      "Raised user engagement 20% with mobile-first, cross-browser React interfaces",
      "Increased online sales 30% in six months with a full-stack e-commerce application",
      "Designed RESTful APIs and CRUD flows with authentication and database integration",
    ],
  },
];

const PROJECTS = [
  {
    name: "Esscentra Prep — AI Interview & Exam Prep Planner",
    tech: "React · Node.js · Express · MongoDB · OpenAI",
    desc: "AI-powered planner that turns a resume or exam goal into a personalized day-by-day study plan, with streak analytics, reminders and tiered subscriptions.",
    link: "https://prep.esscentra.in",
  },
  {
    name: "PrepJS — this app! ⚡",
    tech: "React · Node.js · Express · MongoDB · OpenAI · Monaco",
    desc: "Complete JavaScript interview prep platform: 81+ concepts, quizzes, a VS Code playground with coding problems, and an AI coach.",
    link: null,
  },
  {
    name: "Survey SaaS Platform",
    tech: "React · TypeScript · TanStack Router · MongoDB · Recharts",
    desc: "Production multi-tenant survey builder with drag-and-drop forms, conditional logic and an analytics dashboard.",
    link: null,
  },
  {
    name: "SmaartQR — Live Emergency Response Platform",
    tech: "React.js · TypeScript · Tailwind CSS",
    desc: "QR-based platform routing people to verified Police, Ambulance, Fire and Civic services in seconds.",
    link: "https://smaartqr.com",
  },
];

const LINKS = [
  ["🌐", "Portfolio", "https://yasowantdev.info"],
  ["💼", "LinkedIn", "https://www.linkedin.com/in/yasowant-nayak-154968269/"],
  ["🐙", "GitHub", "https://github.com/Yasowant"],
  ["✉️", "Email", "mailto:yasowant1998@gmail.com"],
];

export default function About() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="page about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-photo-wrap">
          {imgOk ? (
            <img
              src="/yasowant.jpg"
              alt="Yasowant Nayak"
              className="about-photo"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="about-photo about-photo-fallback">YN</div>
          )}
          <div className="about-photo-glow" />
        </div>
        <div className="about-intro">
          <span className="hero-badge">👋 The developer behind PrepJS</span>
          <h1>Yasowant <span className="gradient-text">Nayak</span></h1>
          <p className="about-role">Full Stack Software Engineer · Bangalore, India</p>
          <p className="about-summary">
            Full Stack Engineer with 3+ years building production SaaS on React.js and Node.js —
            cutting feature development time 35%, release time 50%, and page loads 40% on a
            multi-tenant platform serving 8+ enterprise organizations. Strong in system design,
            REST/GraphQL APIs, CI/CD, and mentoring developers. PrepJS is built from the exact
            concepts and questions faced in real interviews.
          </p>
          <div className="about-links">
            {LINKS.map(([icon, label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="btn btn-outline">
                {icon} {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats">
        <div><strong>3+</strong><span>Years experience</span></div>
        <div><strong>8+</strong><span>Enterprise orgs served</span></div>
        <div><strong>15+</strong><span>API services designed</span></div>
        <div><strong>80%+</strong><span>Test coverage shipped</span></div>
      </section>

      {/* SKILLS */}
      <section className="about-section">
        <h2>🛠 Skills</h2>
        {Object.entries(SKILLS).map(([group, items]) => (
          <div className="about-skill-row" key={group}>
            <span className="about-skill-group">{group}</span>
            <div className="about-skill-chips">
              {items.map((s) => <span className="chip small" key={s}>{s}</span>)}
            </div>
          </div>
        ))}
      </section>

      {/* EXPERIENCE */}
      <section className="about-section">
        <h2>💼 Experience</h2>
        <div className="about-timeline">
          {EXPERIENCE.map((e) => (
            <div className="about-job" key={e.company}>
              <div className="about-job-head">
                <div>
                  <h3>{e.role}</h3>
                  <span className="about-job-company">{e.company}</span>
                </div>
                <span className="about-job-period">{e.period}</span>
              </div>
              <ul>
                {e.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="about-section">
        <h2>🚀 Projects</h2>
        <div className="about-projects">
          {PROJECTS.map((p) => (
            <div className="about-project" key={p.name}>
              <h3>
                {p.link
                  ? <a href={p.link} target="_blank" rel="noreferrer">{p.name} ↗</a>
                  : p.name}
              </h3>
              <span className="about-project-tech">{p.tech}</span>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION & CERTS */}
      <section className="about-section about-two-col">
        <div>
          <h2>🎓 Education</h2>
          <div className="about-edu">
            <strong>B.Tech, Electrical Engineering</strong>
            <span>Galgotias College of Engineering and Technology · 2016–2019</span>
          </div>
          <div className="about-edu">
            <strong>Diploma, Electrical Engineering</strong>
            <span>Utkalmani Gopabandhu Institute of Engineering · 2013–2016</span>
          </div>
        </div>
        <div>
          <h2>📜 Certifications</h2>
          <div className="about-edu"><strong>Full Stack Generative & Agentic AI with Python</strong><span>Udemy · 2026</span></div>
          <div className="about-edu"><strong>TypeScript: The Complete Developer's Guide</strong><span>Udemy · 2024</span></div>
          <div className="about-edu"><strong>React JS Masterclass: Zero to Job Ready</strong><span>Udemy · 2023</span></div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <p>Built PrepJS to help you crack what I've been asked in real interviews. 🤝</p>
        <Link to="/concepts" className="btn btn-primary btn-lg">Start Learning →</Link>
      </section>
    </div>
  );
}
