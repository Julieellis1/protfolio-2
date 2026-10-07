# Origin Template — Design Study

How the "Origin" portfolio template is designed. This is the approved
reference design; future portfolio/demo builds should internalize these
patterns rather than invent new ones.

## Design language: dark editorial

- Canvas: near-black `#050505`; panels `#111` / `#0b0b0b`; text `#f5f5f5`,
  secondary `#aaa`, muted `#8a8a8a`.
- One accent only: burnt orange `#f9452d`. Used sparingly: logo dot,
  selection color, marquee stars, odometer suffixes, CTA arrow chips,
  "Let's Talk" pulse dot, scroll drip line, contact-line hover.
- Everything else stays monochrome. Restraint is the luxury signal.
- Borders: hairlines `rgba(255,255,255,.07)`; glass panels
  `rgba(255,255,255,.025)` with 2rem backdrop blur; radius `8px`.

## Typography

- Inter only, weights 200-600. Body is Inter 200, 1rem/1.7.
- Headlines: light weights (200-300), tight negative tracking
  (-.01em to -.05em), sentence case except display moments.
- Micro-labels (`.sub`): `.8rem`, uppercase, `.13rem` tracking, weight 400,
  gray. Used for eyebrows, indexes, captions, meta.
- Display moments go huge and uppercase: hero roll at 12vw/500, section
  titles at 8.89vw/600, footer giant at 16.5vw/600 with outline stroke.
- Emphasis inside headlines is tonal, not colorful: the `.hl` span renders
  the second clause in gray.

## Layout rhythm

- Outer padding `--pad:4.5rem`, wide sections `--pad-wide:9rem`.
- Vertical rhythm from spacers (`sp-10` = 10rem, `sp-4` = 4.4vw), not
  margins on components.
- Sections breathe: one idea per viewport, centered titles, generous
  whitespace before and after.
- Grids are hairline-bordered (clients 5-col, metrics 4-col, apps 3-col).

## Signature interactions (GSAP + Lenis + ScrollTrigger)

1. Preloader: light panel, "AT." logo, 000 counter, wipes upward.
2. Custom cursor: difference-blend dot + ring; grows on hover; becomes a
   "View Work" tag over project media.
3. Rolling text links: two stacked spans, translateY(-100%) on hover.
4. Hero: 5-line vertical word roll (Adebiyi / Thompson / Designer /
   Developer) + full-bleed image reveal driven by thumbnail hover
   (clip-path polygon animation) + glass "Available for work" pill marquee.
5. Marquee band: giant uppercase band, one word outlined
   (`-webkit-text-stroke`), star separators in accent.
6. Clients grid: cell floods light from bottom on hover, name turns black.
7. Manifesto: word-by-word scroll scrub (opacity .14 to 1).
8. Services: 600vh pinned section, 3D rotating cube with 6 image faces,
   exclusion-blend text swapping per service (01/05 - 05/05), progress bar.
9. Image strips: two counter-scrolling infinite marquee rows.
10. Works: full-viewport cards, media revealed by animated clip-path,
    arched textPath project name in exclusion blend, info bar bottom.
11. Metrics: odometer digit roll with accent suffix.
12. App cards: radial accent glow follows the mouse.
13. Process rows: invert to light on hover; floating image preview follows
    the cursor, swapping per step.
14. CTA: pinned 4-column image grid with 3D tilt on scroll under a dark
    overlay, centered message + solid button.
15. Footer: giant outlined "THOMPSON".
16. Studio page: draggable 3D prism (6 faces), scroll-pinned statement with
    parallax portrait.

## Image treatment

- All images `object-fit: cover`, 8px radius, often under a dark gradient
  for legibility. 3D faces get a hairline white border.
- Photography: dark, low-key, grayscale-leaning, shallow depth of field,
  subtle grain. The single warm accent may appear as practical light.
- Portraits: dark grayscale studio shots, 4/5 aspect, parallax on scroll
  (120% height, anchored top).
- Project covers: browser-chrome mockup on near-black with the site
  screenshot, project name letterspaced beneath. Consistent framing across
  all 11 covers.
- Abstracts (services cube, strips, backgrounds): pure dark compositions,
  geometric or light-trail motifs, orange glow used once per image max,
  never any text or logos inside the image.

## Content voice

- Plain-spoken, honest, first person. "Real projects, across ten industries
  and counting." "Every number is a real project. All live, all hand-built."
  "No stock case studies, no padded figures." "No fluff."
- Stats are real and modest (11+ sites, 3 apps, 94+ pages, 10 industries).
- Every project links to a live URL; chips say "Live site".

## Technical

- Static HTML/CSS/JS, no build step. GSAP 3.13 + ScrollTrigger + CustomEase
  + Lenis via CDN. Inter via Google Fonts.
- `prefers-reduced-motion` and `.no-js` fallbacks; aria labels on
  interactive imagery; lazy loading below the fold.
- Mobile: hamburger menu, grids collapse, hover-preview elements hidden,
  cube/prism scale down.

## Asset manifest (2026-10-07 restoration)

- `assets/img/works/*.webp` (11): supplied, valid.
- `assets/img/hero-portrait.jpg`, `assets/img/about-portrait.jpg`:
  restored from the user's real dark-grayscale portraits
  (`~/workspace/Teta-portfolio-repo/assets/img/`). Never AI-generate the
  user's face; reuse supplied photos.
- 13 generated abstracts: `service-strategy`, `service-identity`,
  `service-design`, `service-motion`, `studio-1/2/3`, `hero-bg-1/2`,
  `hero-thumb-1/3`, `work-pulse`, `work-nebula` (all `.webp`).
