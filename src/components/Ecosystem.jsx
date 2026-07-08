import ImageSlot from './ImageSlot.jsx'
import { useReveal } from '../hooks/useReveal.js'
import styles from './Ecosystem.module.css'

const APPS = [
  {
    name: 'Pigui Business',
    tone: '#1c2749',
    slot: 'Business mascot',
    desc: 'Your numbers, explained. Sales, top customers, and what to do next — no spreadsheets.',
    cta: 'See your numbers',
    mascot: { headphones: false, wave: false },
  },
  {
    name: 'Pigui Scan',
    tone: '#2e9e92',
    slot: 'Scan mascot',
    desc: 'The counter app. Scan a customer’s QR to add points, redeem rewards, and record the sale.',
    cta: 'Scan at the counter',
    mascot: { headphones: false },
  },
  {
    name: 'Pigui Rewards',
    tone: '#ee7b2e',
    slot: 'Rewards mascot',
    desc: 'Loyalty customers love. AI picks the right reward for the right customer at the right time.',
    cta: 'Reward your regulars',
    mascot: { headphones: false, wave: false },
  },
]

export default function Ecosystem() {
  const ref = useReveal()

  return (
    <section className={styles.section} ref={ref}>
      <div className={`pg-inner ${styles.inner}`}>
        <header className={styles.header}>
          <h2 className={`${styles.title} pg-reveal`}>One Pigui, three superpowers</h2>
          <p className={`${styles.sub} pg-reveal`} style={{ '--pg-reveal-delay': '0.08s' }}>
            Everything you need to understand customers, make better decisions, and grow.
          </p>
        </header>

        <div className={styles.grid}>
          {APPS.map((app, i) => (
            <article
              className={`${styles.card} pg-shine pg-reveal`}
              key={app.name}
              style={{ '--acc': app.tone, '--pg-reveal-delay': `${i * 0.1}s`, borderTopColor: app.tone }}
            >
              <div className={styles.slot}>
                <ImageSlot tone={app.tone} radius={18} label={app.slot} mascot={app.mascot} />
              </div>
              <div className={styles.body}>
                <h3 className={styles.name} style={{ color: app.tone }}>
                  {app.name}
                </h3>
                <p className={styles.desc}>{app.desc}</p>
              </div>
              <button className={`pg-btn pg-btn--accent ${styles.cta}`}>{app.cta}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
