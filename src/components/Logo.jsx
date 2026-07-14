export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="DevPrep logo">
      <defs>
        <linearGradient id="dpGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#dpGrad)" />
      <rect x="5" y="5" width="54" height="54" rx="12" fill="#0b0f1a" />
      <g stroke="#38bdf8" strokeWidth="2.6" fill="none" opacity="0.9">
        <ellipse cx="32" cy="32" rx="22" ry="9.5" />
        <ellipse cx="32" cy="32" rx="22" ry="9.5" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="22" ry="9.5" transform="rotate(120 32 32)" />
      </g>
      <path
        d="M35 17 L23 35 h7.5 L28 47 L41 29 h-7.5 L36 17 Z"
        fill="#facc15"
        stroke="#0b0f1a"
        strokeWidth="1.5"
      />
    </svg>
  );
}
