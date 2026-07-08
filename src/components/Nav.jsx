import { useEffect, useState } from 'react'
import PiguiLogo from './PiguiLogo.jsx'
import styles from './Nav.module.css'

const LINKS = ['Home', 'Ecosystem', 'How it works', 'Community']

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`pg-inner ${styles.inner}`}>
        <a className={styles.brand} href="#top">
          <PiguiLogo size={36} radius={11} />
          <span className={styles.brandName}>Pigui AI</span>
        </a>

        <nav className={styles.links}>
          {LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className={l === 'Home' ? styles.linkActive : styles.link}
            >
              {l}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <button className={`pg-btn pg-btn--outline ${styles.login}`}>Log in</button>
          <button className={`pg-btn pg-btn--primary-sm pg-shine ${styles.signup}`}>
            Sign up free
          </button>
        </div>
      </div>
    </header>
  )
}
