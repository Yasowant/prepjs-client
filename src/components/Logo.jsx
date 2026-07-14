export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="PrepJS logo">
      <defs>
        <linearGradient id="pjGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#pjGrad)" />
      <rect x="5" y="5" width="54" height="54" rx="12" fill="#0b0f1a" />
      <text x="11" y="43" fontFamily="monospace" fontSize="26" fontWeight="bold" fill="#38bdf8">{"{"}</text>
      <path d="M37 9 L20 36 h9 L26 55 L45 27 h-10 L40 9 Z" fill="#facc15" />
      <text x="44" y="43" fontFamily="monospace" fontSize="26" fontWeight="bold" fill="#38bdf8">{"}"}</text>
    </svg>
  );
}
