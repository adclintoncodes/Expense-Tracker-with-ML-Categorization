export function PiggyBank({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 140"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* coin */}
      <g className="origin-center animate-coin-drop">
        <ellipse cx="108" cy="18" rx="14" ry="14" fill="#FBBF24" />
        <ellipse cx="108" cy="18" rx="9" ry="9" fill="#F59E0B" opacity="0.35" />
        <text
          x="108"
          y="22"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#92400E"
          fontFamily="Outfit, sans-serif"
        >
          $
        </text>
      </g>

      {/* body */}
      <ellipse cx="78" cy="88" rx="58" ry="42" fill="#F9A8D4" />
      <ellipse cx="78" cy="88" rx="48" ry="34" fill="#F472B6" opacity="0.35" />

      {/* snout */}
      <ellipse cx="128" cy="92" rx="18" ry="14" fill="#FBCFE8" />
      <circle cx="122" cy="90" r="2.5" fill="#BE185D" opacity="0.55" />
      <circle cx="132" cy="90" r="2.5" fill="#BE185D" opacity="0.55" />

      {/* ear */}
      <ellipse cx="48" cy="58" rx="14" ry="16" fill="#F472B6" />
      <ellipse cx="50" cy="60" rx="7" ry="8" fill="#FBCFE8" />

      {/* eye */}
      <circle cx="98" cy="76" r="5" fill="#1E1B4B" />
      <circle cx="99.5" cy="74.5" r="1.6" fill="#fff" />

      {/* legs */}
      <rect x="48" y="118" width="12" height="14" rx="4" fill="#DB2777" />
      <rect x="88" y="118" width="12" height="14" rx="4" fill="#DB2777" />

      {/* slot */}
      <rect x="62" y="62" width="28" height="5" rx="2.5" fill="#9D174D" opacity="0.55" />

      {/* shine */}
      <path
        d="M42 78c8-16 22-24 38-26"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  )
}
