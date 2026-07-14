// Lightweight CSS confetti — no dependencies.
const COLORS = ["#facc15", "#38bdf8", "#34d399", "#f87171", "#a78bfa", "#fb923c"];
const PIECES = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.8,
  duration: 2.4 + Math.random() * 2,
  size: 6 + Math.random() * 7,
  color: COLORS[i % COLORS.length],
  rotate: Math.random() * 360,
  round: Math.random() > 0.6,
}));

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.round ? "round" : ""}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.45),
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
