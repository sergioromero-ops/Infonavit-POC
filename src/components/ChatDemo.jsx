import { useEffect, useRef, useState } from 'react'
import PiguiLogo from './PiguiLogo.jsx'
import { useReveal } from '../hooks/useReveal.js'
import styles from './ChatDemo.module.css'

const FEATURES = [
  ['Answers', ' — sales, stock, and customer questions in plain language'],
  ['Acts', ' — sends campaigns and rewards with your one-tap approval'],
  ['Learns', ' — every sale makes its suggestions sharper'],
]

/* phases: 0 user only · 1 typing · 2 full reply */
export default function ChatDemo() {
  const sectionRef = useReveal()
  const panelRef = useRef(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const el = panelRef.current
    if (!el) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setPhase(2)
      return
    }

    const timers = []
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          timers.push(setTimeout(() => setPhase(1), 550))
          timers.push(setTimeout(() => setPhase(2), 1750))
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={`pg-inner ${styles.grid}`}>
        {/* chat panel */}
        <div className={`${styles.panel} pg-reveal`} ref={panelRef}>
          <div className={styles.head}>
            <PiguiLogo size={34} radius="circle" />
            <div>
              <div className={styles.headName}>Pigui</div>
              <div className={styles.headStatus}>online · trained on your shop</div>
            </div>
          </div>

          <div className={`${styles.bubble} ${styles.user}`}>How were sales this week?</div>

          {phase < 2 ? (
            <div
              className={`${styles.bubble} ${styles.bot} ${styles.typing} ${
                phase >= 1 ? styles.show : ''
              }`}
              aria-label="Pigui is typing"
            >
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          ) : (
            <div className={`${styles.bubble} ${styles.bot} ${styles.pop}`}>
              Up <strong>12%</strong> 📈 — but Tuesdays are slow. 28 of your regulars haven't
              visited in 2 weeks. Want me to send them a double-points offer for Tuesday?
            </div>
          )}

          <div className={`${styles.actions} ${phase === 2 ? styles.pop : styles.hidden}`}>
            <button className="pg-btn pg-btn--outline-pill" style={pillStyle}>
              Edit offer
            </button>
            <button className="pg-btn pg-btn--solid-pill pg-shine" style={pillStyle}>
              Yes, send it
            </button>
          </div>

          <div className={styles.inputRow}>
            <span className={styles.inputHint}>Ask Pigui anything about your business…</span>
            <span className={styles.send}>↑</span>
          </div>
        </div>

        {/* copy */}
        <div className={styles.copy}>
          <div className={`${styles.eyebrow} pg-reveal`}>TALK &amp; CHAT WITH PIGUI</div>
          <h2 className={`${styles.title} pg-reveal`} style={{ '--pg-reveal-delay': '0.06s' }}>
            An assistant that knows your shop — and acts on it
          </h2>
          <p className={`${styles.sub} pg-reveal`} style={{ '--pg-reveal-delay': '0.12s' }}>
            Train Pigui on your menu, prices, and customers. Then it doesn't just answer — it spots
            the opportunity and does the work.
          </p>
          <ul className={styles.list}>
            {FEATURES.map(([strong, rest], i) => (
              <li
                className={`${styles.item} pg-reveal`}
                key={strong}
                style={{ '--pg-reveal-delay': `${0.16 + i * 0.06}s` }}
              >
                <span className={styles.check}>✓</span>
                <span>
                  <strong>{strong}</strong>
                  {rest}
                </span>
              </li>
            ))}
          </ul>
          <button
            className={`pg-btn pg-btn--primary pg-btn--lift pg-shine ${styles.cta} pg-reveal`}
            style={{ '--pg-reveal-delay': '0.34s' }}
          >
            Start training yours — free
          </button>
        </div>
      </div>
    </section>
  )
}

const pillStyle = { fontSize: 13, padding: '9px 16px', borderRadius: 999 }
