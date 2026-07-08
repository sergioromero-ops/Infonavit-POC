import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal: reveals every descendant carrying `.pg-reveal`
 * once it scrolls into view. Elements can set a stagger via the
 * CSS custom property `--pg-reveal-delay` (or the data-delay attr).
 *
 * Returns a ref to attach to the section root.
 */
export function useReveal(options = {}) {
  const rootRef = useRef(null)
  const { threshold = 0.14, rootMargin = '0px 0px -8% 0px' } = options

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const targets = root.classList.contains('pg-reveal')
      ? [root, ...root.querySelectorAll('.pg-reveal')]
      : [...root.querySelectorAll('.pg-reveal')]

    if (!targets.length) return

    // Reveal via a data attribute rather than a class: React owns the
    // className/style of these nodes and would wipe an imperatively-added
    // class on its next re-render. It never manages arbitrary data-*, so
    // `data-shown` survives re-renders.
    const show = (el) => el.setAttribute('data-shown', '')

    // No IntersectionObserver (or reduced motion handled in CSS) → show all.
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach(show)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin },
    )

    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return rootRef
}
