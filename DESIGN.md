# DESIGN.md: the field notebook

## 1. The idea in one paragraph

Bharatnomy studies India state by state, district by district, the way a field surveyor would. The site is that surveyor's notebook: cool graph paper, ink line work, stamped reference codes, handwritten-feeling margin notes joined to the content by dashed leader lines, and small instrument panels that show **real readings from our datasets**. Two references shaped it:

- **Reference A (sketchbook travel page):** giant condensed headline that breaks out of the frame, ink line illustration with one blue accent, coordinates and file codes in the top strip, numbered waypoints joined by dashed lines, a small "conditions" panel with live readings, hint notes like "click the sun: transform the scene".
- **Reference B (community site):** graph-paper grid ground, highlighter marks behind headline words, tilted monospace sticker labels, a scrolling ticker strip, colour-blocked panels, dashed cut-out borders.

Take the **mechanics** of these references, never their content: no Greek islands, no pink, no cherries, no disco balls.

## 2. Tokens

Put these in `src/styles/tokens.css`. ScrollCraft's six tokens map onto ours (see SCROLL.md).

### Colour (one accent, by rule)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F2F3EF` | Page ground. Cool off-white, slightly grey-green. **Not cream.** Warm cream plus brass is a banned default |
| `--paper-raised` | `#FBFBF8` | Index cards, specimen tags, panels sitting on the page |
| `--grid-minor` | `rgba(22,24,28,0.02)` | 8px graph lines (texture only, barely visible) |
| `--grid-major` | `rgba(22,24,28,0.05)` | Every 5th line (40px) |
| `--ink` | `#16181C` | Text, outlines, sketch strokes. Off-black, never `#000` |
| `--ink-soft` | `#4C535C` | Secondary text, captions, source lines (7:1 on paper) |
| `--accent` | `#2346C7` | "Fountain-pen blue". The one accent: highlighted words, links, the active district, the pen line in the peak chapter (6.8:1 on paper) |
| `--accent-wash` | `rgba(35,70,199,0.14)` | Highlighter marks behind words, selection colour |
| `--accent-ink` | `#F7F8F4` | Text on accent fills |

Measured contrast on `--paper`: ink 15.9:1, ink-soft 7.0:1, accent 6.8:1. Re-measure on the rendered page.

### Lens colours (categorical, not accents)

Each of the five lenses owns one cardstock colour, used **only** for that lens's tab, its chapter marker and its sticker label. Never for UI chrome, buttons or links.

| Lens | Fill | Text on fill |
|---|---|---|
| Climate adaptation & resilience | `#A9432F` brick | `--paper` (5.3:1) |
| Energy policy & markets | `#D9A21B` turmeric | `--ink` (7.7:1) |
| Macroeconomic health | `#4A7556` sage | `--paper` (4.8:1) |
| Equity markets | `#3F5F8F` slate | `--paper` (5.8:1) |
| Commodity markets | `#7D4E7A` plum | `--paper` (5.8:1) |

### Data colour scales (maps and charts)

Build them with `d3-scale` and `d3-interpolate` in `src/lib/scales.ts`. Validate each for colour-blind safety and check that the lightest step is still distinguishable from `--paper` (give district polygons a 0.75px ink outline so the lightest class never disappears).

| Kind | Used for | Stops (light to dark) |
|---|---|---|
| Sequential warm | absolute temperature, heat days, warm nights | `#F6EBD3` `#F0C46E` `#E07E3C` `#B53D2C` `#6B1F1D` |
| Diverging (cool / warm) | temperature anomaly | `#2F5D9A` `#9DB7D5` `#EEEDE6` (zero) `#E5A07C` `#A8322A` |
| Sequential wet | rainfall totals, rainy days, heavy-rain days | `#EEF2E6` `#BCD9C6` `#6FB0AC` `#2C7C92` `#173F5C` |
| Diverging (dry / wet) | rainfall departure %, SPI | `#8A5626` `#D6A86E` `#EEEDE6` (zero) `#7FC0B8` `#1E6E73` |
| Categorical ordinal | monsoon category, drought class | derive from the dry/wet diverging scale, 5 classes |

Default classification: 5 quantile classes for sequential metrics, symmetric fixed breaks for diverging ones. The Atlas lets the user switch to equal interval (MAP.md).

### Type

Two families, as ScrollCraft's taste floor requires. Mono is the text family's own sibling and is used **only for data, codes and labels**, never as a costume for body copy.

| Role | Face | Use |
|---|---|---|
| Display | **Big Shoulders Display** (700 to 900) | Giant headlines (Reference A), chapter titles, big numbers. Tight tracking, line-height 0.9 to 0.98 |
| Text | **Geist** (400, 500, 600) | Body, UI, buttons |
| Data & labels | **Geist Mono** (400, 500) | Sticker labels, BN codes, coordinates, legends, axis ticks, table numbers, source lines |

Self-host via `@fontsource`. If Big Shoulders Display is unavailable, use **Archivo** at its condensed widths (`font-stretch: 62.5%`), weight 800. Never Inter.

Type scale (fluid with `clamp()`):
- `--t-mega`: `clamp(4.5rem, 14vw, 13rem)`: only the home title page and the Atlas title. Allowed to run off the grid and be clipped by the page edge.
- `--t-xl` 4 to 6rem: chapter titles. `--t-l` 2.4 to 3.2rem. `--t-m` 1.5 to 1.9rem.
- `--t-body` 1.0625rem, line-height 1.6, measure 62ch.
- `--t-label` 0.72rem mono, uppercase, letter-spacing 0.08em.
- Tabular numerals (`font-variant-numeric: tabular-nums`) on every number.

On the giant headlines, one word can be set in `--accent` (Reference A's "THE"). Use this at most once per page.

## 3. The page ground

> **Professional pass (19 Nov 2026, Sarvesh):** the first kit read as too playful. Grid lines were roughly halved in strength, tilts capped at 1° (stickers, tags) and 0.8° (index cards), legends sit straight, tape is rare, sketch outlines use a single calmer stroke (roughness about 0.75), lens tabs use mono labels. Keep to this restraint on every page.
>
> **Colour pass (19 Nov 2026, Sarvesh):** "make the website more colorful". Lens colours are no longer limited to tabs and stickers. Each lens also has a light tint (`--tint-clm`, `--tint-eng`, `--tint-mac`, `--tint-eqt`, `--tint-com`) used as section grounds (`.bleed-*`, `.ch-tint`), card and panel bands (`tone` prop on IndexCard and InstrumentPanel). A five-colour lens band sits under the instrument strip; the ticker is turmeric; the footer is slate (`--lens-eqt`). Still no gradients, and text stays at AA contrast. Map playback in the Atlas steps one year about every 0.9 s with an 0.8 s colour crossfade.

- `--paper` with a two-level graph grid drawn as a CSS background (`linear-gradient` lines, 8px minor and 40px major). No image tiles.
- A very faint paper grain (SVG `feTurbulence` noise at 2% opacity), fixed, behind everything. Must not shimmer on scroll.
- The 12-column layout grid snaps to the 40px major lines where possible, so content visibly sits on the paper.
- **Instrument strip** (top of every page, Reference A's header): one thin row, mono labels, separated by hairline rules:
  `BHARATNOMY` · nav links (`RESEARCH | DATASETS | ATLAS | ABOUT | STANDARDS`) · coordinates of the current focus (real values; the home page shows Maharashtra's centroid, the Atlas shows the selected district's centroid) · the page's BN code (`BN-DASH`, `BN-DATA` ...). It scrolls away with the page, so it is not a fixed bar. On mobile it collapses to wordmark + BN code + a "Contents" button that opens a full-page index styled like a notebook contents page.

## 4. Components

Build each as an Astro component and show them all on `/_kit`.

| Component | What it is | Rules |
|---|---|---|
| `StickerLabel` | Mono uppercase label on a paper-raised or lens-colour chip, rotated at most 1 degree, 1px ink border, optional "tape" corner (use sparingly) | Max one per viewport-height section. Rotation is fixed per instance (seeded), not random on every load |
| `MarginNote` | A short note in `--ink-soft` (Geist, italic) sitting in the page margin, with a `LeaderLine` to what it annotates | Notes carry real information: a caveat, a definition, a statistician's aside. Never decoration |
| `LeaderLine` | Dashed 1px ink SVG line with a small open-circle end, from a note to a point | Positioned from element geometry, recalculated on resize. Hidden below 900px (notes then sit inline under the thing they annotate) |
| `Highlighter` | `--accent-wash` stroke behind a word, slightly uneven (SVG path, not a rectangle) | One per heading at most |
| `Folio` | The chapter marker in the left margin: `BN-000 · CH. II · FIVE LENSES` | Sticky within its chapter on home; static elsewhere |
| `InstrumentPanel` | Reference A's "sea conditions" box: small bordered panel, mono title, 3 to 5 label/value rows, a "+" corner mark | Values always come from data with a year attached ("NAGPUR · 2024 · TMAX HIGHEST 46.1 °C") |
| `Ticker` | Reference B's marquee strip: one line of mono facts scrolling slowly between hairlines | Facts generated from data at build time (MAP.md lists how). Pauses on hover and focus. Static, wrapped list under reduced motion |
| `LensTab` | A notebook divider tab in the lens colour with the lens name; the whole lens "page" hangs off it | Used for the five lenses only |
| `SpecimenTag` | A dataset card styled as a museum specimen or luggage tag: punched hole, string line, dashed cut border, BN code, title, coverage (years, districts), formats, download links | Used on Datasets and the home page |
| `IndexCard` | Ruled card (blue rule lines, red margin line in `--ink-soft`, not red) for team members, research items | Square corners. No shadow, or a 1px offset ink shadow at most |
| `SketchMap` | rough.js rendering of district GeoJSON: hand-drawn outlines, optional hachure fill | See §5 |
| `TrendChart` | D3 line chart on graph paper: no chart junk, mono ticks, source line underneath, normal-period band shaded | Used in the Atlas panel and dataset pages |
| `Waypoint` | Numbered circle (`01`, `02`) joined by dashed path, Reference A's walking route | Only on maps, to mark districts the copy refers to. Not as section numbering |
| `Button` | Ink-outlined rectangle, Geist 500, mono arrow; primary is ink-filled | No pills, no gradients, no glow. Hover: 2px offset ink shadow appears. Focus: 2px accent outline, 2px offset |

## 5. Sketch rendering (the thing that makes this site unique)

Claude Code cannot draw good illustrations, so there are **no illustrations**. Instead, the "hand-drawn" look comes from **our real geography**: Maharashtra's 35 district polygons rendered with **rough.js**.

- Outline style: `roughness` 0.9 to 1.3, `bowing` 1, stroke `--ink` 1px. Seed every shape with a fixed seed (district LGD code) so the drawing is identical on every load.
- **Hachure density encodes data.** For sketch maps, fill each district with rough.js `hachure` where `hachureGap` is mapped from the metric (denser lines = higher value) and `fillStyle` stays ink. This is the site's visual signature: a statistician's hand-shaded map whose shading is the real data. Use it on the home page and as the "sketch view" toggle in the Atlas.
- Line-draw animation: animate `stroke-dashoffset` of the generated paths, driven by ScrollCraft's `--sc-p` on the home page. Under reduced motion, draw instantly.
- Interactive maps in the Atlas use MapLibre for precision (MAP.md), styled to sit on the same paper with the same ink outlines, so sketch view and precise view feel like two pages of the same notebook.

## 6. Motion

- `transform` and `opacity` only (plus `clip-path` for wipes, `stroke-dashoffset` for line drawing). Never animate layout properties. No `transition: all`.
- Entrances: 14px rise, 600ms, ease-out, staggered 40 to 70ms. Nothing bounces.
- Stickers do not wobble. Tilt is static.
- Map transitions between years: 250ms fill crossfade. Scrubbing the year slider updates without animation.
- `prefers-reduced-motion: reduce`: no line drawing, no ticker scroll, no parallax. Content complete and readable.

## 7. Browser surfaces

Selection colour `--accent-wash`, caret `--accent`, focus ring 2px `--accent` with 2px offset, link underline 1px with 3px offset (thickens on hover), thin ink scrollbar on the Atlas panels.

## 8. Imagery

None generated, none from stock. The only images are: rough.js sketch maps, D3 charts, the Bharatnomy wordmark (set in type until a logo exists), and real team photos if I supply them later (until then, team cards are type-only IndexCards; do not use avatars or initials circles).
