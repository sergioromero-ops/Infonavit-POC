/**
 * PiguiLogo — the blue app mark: a rounded blue tile holding a white
 * "screen" with two dot eyes. Scales proportionally from `size`.
 */
export default function PiguiLogo({ size = 36, radius, bg = '#3b57db', fg = '#fff' }) {
  const faceW = Math.round(size * 0.44)
  const faceH = Math.round(size * 0.28)
  const dot = Math.max(2, size * 0.083)
  const tileRadius = radius === 'circle' ? '50%' : radius ?? Math.round(size * 0.3)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: tileRadius,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <div
        style={{
          width: faceW,
          height: faceH,
          borderRadius: faceH / 2,
          background: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: dot * 0.7,
        }}
      >
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: bg }} />
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: bg }} />
      </div>
    </div>
  )
}
