import ImageSlot from './ImageSlot.jsx'
import { useReveal } from '../hooks/useReveal.js'
import styles from './HowItWorks.module.css'

const STEPS = [
  [
    'Sign up & meet Pigui',
    'Create your account and tell Pigui about your business — like onboarding a new hire.',
  ],
  [
    'Launch your rewards',
    'Print your QR, staff install Pigui Scan. Customers join at the counter in one scan.',
  ],
  [
    'Grow on autopilot',
    'Pigui learns, suggests, and sends the nudges that bring customers back. You approve.',
  ],
]

export default function HowItWorks() {
  const ref = useReveal()

  return (
    <section className={styles.section} ref={ref}>
      <div className={`pg-inner ${styles.inner}`}>
        <header className={styles.header}>
          <h2 className={`${styles.title} pg-reveal`}>How it works</h2>
          <p className={`${styles.sub} pg-reveal`} style={{ '--pg-reveal-delay': '0.08s' }}>
            See Pigui in action — for you, your staff, and your customers.
          </p>
        </header>

        <div className={`${styles.video} pg-reveal`}>
          <ImageSlot
            variant="frame"
            radius={22}
            label="Drop a real product screenshot or video frame"
          />
          <button className={styles.play} aria-label="Play the 90-second demo">
            <span className={styles.playRing} />
            <span className={styles.playIcon}>▶</span>
          </button>
        </div>

        <div className={styles.steps}>
          {STEPS.map(([title, desc], i) => (
            <div
              className={`${styles.step} pg-reveal`}
              key={title}
              style={{ '--pg-reveal-delay': `${i * 0.1}s` }}
            >
              <span className={styles.num}>{i + 1}</span>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{title}</div>
                <div className={styles.stepDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
