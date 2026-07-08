import ImageSlot from './ImageSlot.jsx'
import { useReveal } from '../hooks/useReveal.js'
import styles from './FoundingMember.module.css'

const PERKS = [
  'Lifetime access to every Pigui app — locked in before public pricing',
  'Direct line to the team — your feedback shapes the roadmap',
  'Earn up to $200 for structured feedback sessions',
]

export default function FoundingMember() {
  const ref = useReveal()

  return (
    <section className={styles.section} ref={ref}>
      <div className="pg-inner">
        <div className={`${styles.card} pg-reveal`}>
          <div className={styles.art}>
            <div className={styles.slot}>
              <ImageSlot
                tone="#f0c766"
                radius={20}
                label="Drop mascot or founder photo"
                mascot={{ wave: true, headphones: false }}
              />
            </div>
            <span className={styles.badge}>EARLY ACCESS</span>
          </div>

          <div className={styles.copy}>
            <div className={`${styles.eyebrow} pg-reveal`}>HELP BUILD PIGUI</div>
            <h2 className={`${styles.title} pg-reveal`} style={{ '--pg-reveal-delay': '0.06s' }}>
              Become a founding member — <span className={styles.gold}>$5, lifetime access</span>
            </h2>

            <ul className={styles.perks}>
              {PERKS.map((perk, i) => (
                <li
                  className={`${styles.perk} pg-reveal`}
                  key={perk}
                  style={{ '--pg-reveal-delay': `${0.12 + i * 0.06}s` }}
                >
                  <span className={styles.check}>✓</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className={`${styles.actions} pg-reveal`} style={{ '--pg-reveal-delay': '0.32s' }}>
              <button className={`pg-btn pg-btn--gold pg-btn--lift pg-shine ${styles.cta}`}>
                Get lifetime access — $5
              </button>
              <button className={styles.link}>or try it for $1 today</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
