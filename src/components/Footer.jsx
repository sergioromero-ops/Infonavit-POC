import PiguiLogo from './PiguiLogo.jsx'
import styles from './Footer.module.css'

const COLS = [
  { title: 'Product', links: ['Pigui Business', 'Pigui Scan', 'Pigui Rewards', 'Pricing'] },
  { title: 'Support', links: ['FAQ', 'Schedule a meeting', 'Contact support', 'Our offices'] },
  { title: 'Company', links: ['Community', 'Security', 'Privacy policy', 'Terms & conditions'] },
]
const SOCIALS = ['Tk', 'In', 'Fb', 'Ig', 'Yt']

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`pg-inner ${styles.grid}`}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <PiguiLogo size={32} radius={10} />
            <span className={styles.brandName}>Pigui AI</span>
          </div>
          <address className={styles.address}>
            hello@pigui.ai
            <br />
            16870 W Bernardo Drive, Suite 400
            <br />
            San Diego, California 92127, USA
          </address>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <a className={styles.social} key={s} href="#" aria-label={s}>
                {s}
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <nav className={styles.col} key={col.title}>
            <div className={styles.colTitle}>{col.title}</div>
            <div className={styles.links}>
              {col.links.map((l) => (
                <a className={styles.link} key={l} href="#">
                  {l}
                </a>
              ))}
            </div>
          </nav>
        ))}
      </div>

      <div className={styles.barWrap}>
        <div className={`pg-inner ${styles.bar}`}>
          <span>© 2026 Pigui AI — All rights reserved</span>
          <span>Made with 💙 for small business</span>
        </div>
      </div>
    </footer>
  )
}
