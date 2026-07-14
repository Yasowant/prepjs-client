import Logo from "./Logo.jsx";

const PERKS = [
  ["📚", "76+ concepts — basics to internals"],
  ["⌨️", "VS Code playground in the browser"],
  ["📝", "Quizzes with instant explanations"],
  ["🤖", "AI coach for any doubt, 24/7"],
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo"><Logo size={42} /> Dev<span className="brand-accent">Prep</span></div>
          <h2>
            Crack your next<br />
            <span className="gradient-text">frontend interview</span>
          </h2>
          <ul className="auth-perks">
            {PERKS.map(([icon, text]) => (
              <li key={text}><span>{icon}</span> {text}</li>
            ))}
          </ul>
          <div className="auth-quote">
            <code>while (!offer) &#123; prep(); &#125;</code>
          </div>
        </div>
        <div className="auth-brand-orb" />
      </aside>
      <main className="auth-form-side">{children}</main>
    </div>
  );
}
