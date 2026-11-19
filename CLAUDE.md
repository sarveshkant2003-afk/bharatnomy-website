# Bharatnomy website: build instructions

You are building the public website for **Bharatnomy** (bharatnomy.com), an independent research firm that reads India's economy as one connected system across five lenses. The site must look like nothing an AI template produces. It is designed as a **field researcher's notebook of India**: graph paper, ink sketches, margin notes, stamped labels, and real instrument readings taken from Bharatnomy's own datasets.

This file is the entry point. Read every spec file before writing code, in this order:

1. `CLAUDE.md` (this file): stack, rules, workflow, definition of done
2. `DESIGN.md`: the visual system (tokens, type, components, sketch rendering)
3. `CONTENT.md`: all copy. Use it; do not invent marketing text
4. `PAGES.md`: every page, section by section
5. `MAP.md`: the Atlas (interactive district maps) and the data pipeline
6. `SCROLL.md`: the home page, built with the ScrollCraft skill

If two files disagree, the more specific file wins (`SCROLL.md` beats `DESIGN.md` for the home page, `MAP.md` beats `PAGES.md` for the Atlas). If something is genuinely undecided, ask me. Do not fill gaps with generic defaults.

---

## Stack (fixed, a colleague maintains this site)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro** (latest stable), static output | No React unless an island truly needs it. Prefer `.astro` components plus small vanilla TS modules |
| Maps | **MapLibre GL JS** | No basemap tiles, no API keys. Districts are drawn from our own GeoJSON on the paper background |
| Charts | **D3** (`d3-scale`, `d3-shape`, `d3-array`, `d3-axis`) | Hand-built SVG charts. No Chart.js, no Recharts, no default chart styling |
| Sketch rendering | **rough.js** | Hand-drawn outlines and hachure fills, driven by real data (see DESIGN.md) |
| Scroll engine | **ScrollCraft** (`engine/scrollcraft.js` + `.css`) | Home page only. See SCROLL.md |
| Styling | Plain CSS with custom properties (tokens in DESIGN.md) | No Tailwind, no component library, no CSS-in-JS |
| Fonts | Self-hosted via `@fontsource` packages | See DESIGN.md |
| Hosting | Vercel (or GitHub Pages), static | Must build with `npm run build` and nothing else |

Node 18+. Keep dependencies few and boring. Every dependency must be justified in `HANDOVER.md`.

---

## Project structure

```
/
├── CLAUDE.md, DESIGN.md, CONTENT.md, PAGES.md, MAP.md, SCROLL.md   (these specs, keep them in the repo)
├── HANDOVER.md                 (you write this at the end, for the maintaining colleague)
├── .scrollcraft.json           { "workspace": "scrollcraft" }
├── scrollcraft/                (ScrollCraft workspace: BRIEF.md, FINGERPRINTS.md, lab/ screenshots)
├── scripts/
│   └── build-data.mjs          (pulls data from the GitHub data repo, writes public/data/)
├── public/
│   ├── data/                   (generated: GeoJSON + per-metric JSON + CSV copies)
│   ├── scrollcraft/            (engine files, copied unedited)
│   └── fonts/ (if not using @fontsource)
└── src/
    ├── styles/tokens.css, base.css, components.css
    ├── components/             (StickerLabel, MarginNote, LeaderLine, SpecimenTag, InstrumentPanel,
    │                             Ticker, LensTab, Folio, Highlighter, SketchMap, TrendChart ...)
    ├── layouts/Notebook.astro  (shared page shell: paper, grid, instrument strip, footer)
    ├── lib/                    (data loaders, colour scales, formatters, rough helpers)
    └── pages/
        ├── index.astro         (Home, ScrollCraft)
        ├── atlas.astro         (BN-DASH, the map explorer)
        ├── datasets/index.astro and datasets/[slug].astro  (BN-DATA)
        ├── research.astro      (BN-RES)
        ├── about.astro         (BN-ABT)
        ├── standards.astro     (BN-STD)
        └── careers.astro       (BN-JOB)
```

---

## Workflow (do these in order, check in with me after each phase)

**Phase 0: setup**
- Scaffold Astro. Install MapLibre, D3 modules, rough.js, fonts.
- Install ScrollCraft: `/plugin marketplace add nateherkai/scroll-craft` then `/plugin install nateherk-design`. If plugins are unavailable, clone `https://github.com/nateherkai/scroll-craft` and read `plugins/nateherk-design/skills/scroll-craft/SKILL.md` directly. Run its `doctor.mjs` and `workspace.mjs --ensure`.

**Phase 1: data** (MAP.md, "Data pipeline")
- Find the temperature and rainfall datasets in the GitHub data repo yourself, confirm their columns against their READMEs, build district GeoJSON, write `public/data/`. Print a summary (rows, districts, years, any join failures). Stop and show me the summary.

**Phase 2: design system** (DESIGN.md)
- Tokens, base styles, the paper/grid background, every component in the component list. Build a hidden `/_kit` page that shows every component in every state. Screenshot it and show me before building pages.

**Phase 3: inner pages** (PAGES.md): Datasets, Research, About, Standards, Careers.

**Phase 4: Atlas** (MAP.md).

**Phase 5: Home** (SCROLL.md). Follow the ScrollCraft skill's procedure. The brief is already answered in SCROLL.md, so do not re-interview me; record it in `scrollcraft/BRIEF.md`.

**Phase 6: verify**: ScrollCraft's `shoot.mjs` on the home page (desktop, 390px mobile, reduced motion), plus manual screenshots of every other page at 1440px and 390px. Look at every screenshot. Fix, re-shoot.

**Phase 7: handover**: write `HANDOVER.md` (how to run, how data is rebuilt, how to add a dataset or metric, where each component lives, known limitations).

---

## The anti-slop rules (ship-blockers)

The last attempts looked generic. These are the patterns that made them generic. None of them may appear anywhere on the site.

**Layout**
- No centred hero with a headline, subline and two buttons.
- No row of three (or four) identical feature cards with icons.
- No alternating image-left / text-right zigzag sections.
- No "trusted by" logo strip, no testimonial carousel, no pricing-style tiers.
- No generic stats band (big number, small grey label, four across).
- No full-width sections that are all the same height and all centred.
- Layout is asymmetric and annotated: content sits on a 12-column grid with deliberate offsets, margin notes live in the margins, things overlap the grid on purpose.

**Surface**
- No gradients of any kind on backgrounds, buttons or text. No purple, no violet-to-blue.
- No glassmorphism, blur panels, neon glow, soft drop shadows on cards.
- No rounded-corner "SaaS cards" with `border-radius: 16px` and a shadow. Our cards are paper: square or 2px corners, 1px ink borders, dashed cut lines, tape, stamps.
- No emoji as icons. No generic icon packs as decoration. Icons only where they carry meaning, drawn in the ink style (rough.js or hand-tuned SVG).
- No stock photography. No AI-generated people.
- No custom cursors. No "scroll down" arrows or mouse icons.

**Type and copy**
- No Inter, Poppins, Montserrat, Roboto, Open Sans. Fonts are in DESIGN.md.
- No em dashes in any visible text. Use a period, comma, colon or parentheses.
- No filler words: elevate, empower, seamless, unlock, leverage, cutting-edge, revolutionize, supercharge, harness, journey, dive in, insights at your fingertips.
- No invented numbers. Every number on the site is computed from our data at build time or quoted from CONTENT.md. If a number cannot be sourced, the element does not exist.
- No lorem ipsum, no placeholder text left anywhere. If CONTENT.md lacks copy you need, ask.

**Data honesty (this is a research firm, so this is the brand)**
- Every chart and map shows its source line (dataset name, original source, years) and links to the dataset page.
- Colour scales have legends with units. Diverging scales centre on a meaningful value (zero anomaly, zero departure).
- Caveats from the dataset READMEs (1-degree grid smooths extremes, 2011 boundaries, Thane includes Palghar) are shown where they matter, as margin notes, not hidden.

---

## Quality floor

- Accessibility: WCAG 2.1 AA contrast measured on the render, visible focus on everything, full keyboard use of the Atlas, `prefers-reduced-motion` honoured everywhere (motion stops, meaning stays), every map has an equivalent sortable table view.
- Performance: Lighthouse performance 90+ on inner pages. Home page under 1.5 MB on first load excluding fonts. Data files lazy-loaded per metric.
- Responsive: designed for 1440px and 390px separately, not just shrunk. The Atlas on mobile is a bottom-sheet layout (MAP.md).
- Semantic HTML: real headings in order, real links, real buttons, `lang="en"`.

## Definition of done

- `npm run build` succeeds from a clean clone; `npm run data` regenerates `public/data/` from the data repo.
- Every page in PAGES.md exists and matches its spec.
- The Atlas works for both datasets, every listed metric, every year, with district click, trend chart, compare, table view and downloads.
- ScrollCraft verification passes on the home page, and you have looked at the contact sheets.
- No item from the anti-slop list appears anywhere (grep for em dashes and banned words before finishing).
- `HANDOVER.md` is written.
