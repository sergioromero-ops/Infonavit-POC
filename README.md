# Pigui AI — Home Redesign

A modern, animated marketing landing page for **Pigui AI**, built in **React + Vite**.

This implements **Option 2a** from the Claude Design handoff — the brand-true redesign
of the real pigui.ai homepage. It keeps Pigui's blue brand, the pig mascot, and Poppins,
while fixing the messaging and hierarchy:

- **Hero** says what Pigui actually is, with a single clear CTA (_Sign up free_).
- **Chat demo** shows a real example conversation (with a live typing sequence) instead of an empty card.
- **Ecosystem** — each app (Business / Scan / Rewards) gets a one-line description, its own accent colour, and a clear CTA.
- **How it works** uses a real product frame in place of the stock "Earth from space" video.
- **Founding member** offer is a single, well-explained tier ($5 lifetime) instead of three competing money CTAs.

The last design instruction was _"make it more modern, with animations"_ — so the page adds
scroll-reveal, a mascot float, an animated typing indicator, a logo marquee, hover shine on
buttons, card lifts, and a pulsing play button. All motion respects `prefers-reduced-motion`.

## Getting started

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Requires Node 18+.

## Project structure

```
index.html                     # Vite entry; loads Poppins + sets meta/favicon
src/
  main.jsx                     # React root
  App.jsx                      # page composition (section order)
  styles/
    global.css                 # design tokens, base styles, keyframes, scroll-reveal
    ui.css                     # shared button system + hover "shine" sweep
  hooks/
    useReveal.js               # IntersectionObserver scroll-reveal (via data-shown)
  components/
    Nav.jsx                    # sticky header
    Hero.jsx                   # headline, CTAs, floating mascot + stat card
    ProofStrip.jsx             # "built with 100+ small businesses" logo marquee
    ChatDemo.jsx               # example conversation w/ typing→reply sequence
    Ecosystem.jsx              # Business / Scan / Rewards cards
    HowItWorks.jsx             # product-frame "video" + 3 steps
    FoundingMember.jsx         # $5 lifetime founding-member offer
    Footer.jsx
    ImageSlot.jsx              # polished on-brand placeholder for real renders
    PiguiMascot.jsx            # original geometric SVG mascot (tintable)
    PiguiLogo.jsx              # the blue app mark
```

## Design tokens

The palette and type come straight from the design (see `src/styles/global.css`):

| Token | Value | Use |
| --- | --- | --- |
| `--pg-blue` | `#3B57DB` | primary brand / CTAs |
| `--pg-ink` | `#252B3D` | headings & body text |
| `--pg-muted` | `#5F6579` | secondary text |
| `--pg-surface` | `#F4F5FB` | alternating section background |
| `--pg-navy` | `#1C2749` | Pigui Business accent / dark sections |
| `--pg-teal` | `#2E9E92` | Pigui Scan accent |
| `--pg-orange` | `#EE7B2E` | Pigui Rewards accent |
| `--pg-gold` | `#F0C766` | founding-member accent |

Type: **Poppins** (headings, brand, body), loaded from Google Fonts in `index.html`.

## Images

The mascot / product spots are **polished placeholders** (`ImageSlot`), matching the design's
own "drop zone" approach. Each renders an original tintable SVG mascot (`PiguiMascot`) plus a
labelled slot. To ship real art, replace the `ImageSlot` usage with an `<img>` — the layout
box (size / radius / aspect-ratio) is already in place.

## Source design

The original Claude Design handoff bundle is preserved for reference:

- `DESIGN_HANDOFF.md` — the original handoff instructions
- `chats/` — the design conversation transcript
- `project/` — the exported HTML/CSS prototypes (Option 2a is the one built here) + assets
