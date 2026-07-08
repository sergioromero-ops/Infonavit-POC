import ImageSlot from './ImageSlot.jsx'
import { useReveal } from '../hooks/useReveal.js'
import styles from './Hero.module.css'

export default function Hero() {
  const ref = useReveal()

  return (
    <section className={styles.hero} id="top" ref={ref}>
      <div className={`pg-inner ${styles.grid}`}>
        {/* copy */}
        <div className={styles.copy}>
          <span className={`${styles.badge} pg-reveal`}>
            <span className={styles.pulseDot} />
            AI built for small business
          </span>

          <h1 className={`${styles.title} pg-reveal`} style={{ '--pg-reveal-delay': '0.06s' }}>
            Meet the AI team that brings customers <span className={styles.accent}>back</span>
          </h1>

          <p className={`${styles.sub} pg-reveal`} style={{ '--pg-reveal-delay': '0.12s' }}>
            Pigui chats with you like a partner, runs your rewards program, and learns your
            business — so first-time buyers become regulars, on autopilot.
          </p>

          <div className={`${styles.ctaRow} pg-reveal`} style={{ '--pg-reveal-delay': '0.18s' }}>
            <button className={`pg-btn pg-btn--primary pg-btn--lift pg-shine ${styles.primary}`}>
              Sign up free
            </button>
            <button className={styles.textLink}>
              Meet Penny &amp; Pigui <span className={styles.arrow}>→</span>
            </button>
          </div>

          <p className={`${styles.fine} pg-reveal`} style={{ '--pg-reveal-delay': '0.24s' }}>
            Free to start · No credit card · Set up in minutes
          </p>
        </div>

        {/* mascot */}
        <div className={`${styles.art} pg-reveal`} style={{ '--pg-reveal-delay': '0.15s' }}>
          <div className={styles.slotWrap}>
            <ImageSlot
              tone="#3b57db"
              radius={24}
              float
              label="Drop the Pigui mascot render here"
            />
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>↺</span>
            <div>
              <div className={styles.statTop}>+38% repeat visits</div>
              <div className={styles.statBot}>members vs. non-members</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
