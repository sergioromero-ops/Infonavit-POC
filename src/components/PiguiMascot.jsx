/**
 * PiguiMascot — an original, geometric CSS/SVG rendition of the Pigui
 * pig mascot. Tintable per ecosystem accent. Used inside ImageSlot as a
 * polished stand-in for the real 3D render (which drops in later).
 */
export default function PiguiMascot({
  tone = '#3b57db',
  shade = 'rgba(0,0,0,0.16)',
  headphones = true,
  wave = true,
  className,
  style,
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      role="img"
      aria-label="Pigui mascot"
    >
      <defs>
        <radialGradient id="pgBody" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* waving arm (behind head, upper right) */}
      {wave && (
        <g
          style={{
            transformOrigin: '150px 118px',
            animation: 'piguiWave 2.6s ease-in-out infinite',
          }}
        >
          <rect x="140" y="70" width="26" height="52" rx="13" fill={tone} />
          <rect x="140" y="70" width="26" height="52" rx="13" fill={shade} opacity="0.35" />
          <circle cx="153" cy="66" r="15" fill={tone} />
        </g>
      )}

      {/* ears */}
      <path d="M58 46 L44 20 L82 40 Z" fill={tone} />
      <path d="M142 46 L156 20 L118 40 Z" fill={tone} />
      <path d="M58 46 L44 20 L82 40 Z" fill={shade} opacity="0.28" />
      <path d="M142 46 L156 20 L118 40 Z" fill={shade} opacity="0.28" />

      {/* head */}
      <ellipse cx="100" cy="104" rx="66" ry="60" fill={tone} />
      <ellipse cx="100" cy="104" rx="66" ry="60" fill="url(#pgBody)" />

      {/* cheeks */}
      <circle cx="62" cy="120" r="12" fill="#ff9db2" opacity="0.55" />
      <circle cx="138" cy="120" r="12" fill="#ff9db2" opacity="0.55" />

      {/* eyes */}
      <ellipse cx="80" cy="92" rx="11" ry="13" fill="#ffffff" />
      <ellipse cx="120" cy="92" rx="11" ry="13" fill="#ffffff" />
      <circle cx="82" cy="94" r="5.5" fill="#1a1f2e" />
      <circle cx="122" cy="94" r="5.5" fill="#1a1f2e" />
      <circle cx="84" cy="92" r="1.8" fill="#ffffff" />
      <circle cx="124" cy="92" r="1.8" fill="#ffffff" />

      {/* snout */}
      <ellipse cx="100" cy="122" rx="30" ry="22" fill="#ffb0c2" />
      <ellipse cx="100" cy="122" rx="30" ry="22" fill={shade} opacity="0.12" />
      <ellipse cx="90" cy="122" rx="5" ry="7" fill="#7a2e42" />
      <ellipse cx="110" cy="122" rx="5" ry="7" fill="#7a2e42" />

      {/* headphones */}
      {headphones && (
        <>
          <path
            d="M40 104 A60 60 0 0 1 160 104"
            fill="none"
            stroke="#1a1f2e"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <rect x="30" y="96" width="20" height="34" rx="9" fill="#1a1f2e" />
          <rect x="150" y="96" width="20" height="34" rx="9" fill="#1a1f2e" />
        </>
      )}
    </svg>
  )
}
