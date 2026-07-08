import PiguiMascot from './PiguiMascot.jsx'
import styles from './ImageSlot.module.css'

/**
 * ImageSlot — a polished, on-brand placeholder standing in for a real
 * image/render. Mirrors the design's "drop zone" intent, but styled so
 * the layout reads as finished. Swap for an <img> when real assets exist.
 *
 * variant:
 *   "mascot" — tinted gradient panel with the Pigui mascot (default)
 *   "frame"  — product-screenshot frame (used for the How-it-works video)
 */
export default function ImageSlot({
  variant = 'mascot',
  tone = '#3b57db',
  radius = 24,
  label,
  float = false,
  mascot = {},
  className = '',
  style = {},
}) {
  const cssVars = { '--slot-tone': tone, borderRadius: radius, ...style }

  if (variant === 'frame') {
    return (
      <div
        className={`${styles.slot} ${styles.frame} ${className}`}
        style={cssVars}
      >
        <ProductFrame />
        {label && <span className={styles.label}>{label}</span>}
      </div>
    )
  }

  return (
    <div className={`${styles.slot} ${styles.mascotSlot} ${className}`} style={cssVars}>
      <span className={styles.glow} aria-hidden="true" />
      <PiguiMascot
        tone={tone}
        className={`${styles.mascot} ${float ? styles.float : ''}`}
        {...mascot}
      />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}

/* A faux product screenshot — a rewards dashboard — so the video area
   reads as the real product, per the redesign brief. */
function ProductFrame() {
  return (
    <div className={styles.product} aria-hidden="true">
      <div className={styles.productBar}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.productTitle}>Pigui · Casa Verde Café</span>
        <span className={styles.livePill}>live</span>
      </div>
      <div className={styles.productBody}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Repeat visits</span>
            <span className={styles.statVal}>
              312 <em>↑18%</em>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>New members</span>
            <span className={styles.statVal}>
              47 <em>↑9%</em>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Points redeemed</span>
            <span className={styles.statVal}>1,240</span>
          </div>
        </div>
        <div className={styles.chart}>
          {[34, 46, 40, 58, 52, 72, 88].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%`, background: i >= 5 ? 'var(--slot-tone)' : undefined }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
