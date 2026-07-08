import styles from './ProofStrip.module.css'

const LOGOS = ['partner logo', 'partner logo', 'partner logo', 'partner logo', 'partner logo', 'partner logo']

export default function ProofStrip() {
  return (
    <section className={styles.strip}>
      <div className={`pg-inner ${styles.inner}`}>
        <span className={styles.label}>Built with 100+ small businesses</span>
        <div className={styles.viewport}>
          <div className={styles.track}>
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span className={styles.logo} key={i}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
