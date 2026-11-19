# PAGES.md: every page, section by section

All pages use `layouts/Notebook.astro`: paper ground, graph grid, instrument strip at top, footer at bottom. Copy comes from CONTENT.md. Components from DESIGN.md.

Every page gets its own layout. If two pages start to look like the same template with different words, change one of them.

---

## Sitemap

| Path | Code | Purpose |
|---|---|---|
| `/` | BN-000 | Home. ScrollCraft chaptered page (SCROLL.md) |
| `/atlas` | BN-DASH | Interactive district maps (MAP.md) |
| `/datasets` | BN-DATA | Dataset index |
| `/datasets/[slug]` | BN-DATA | One page per dataset |
| `/research` | BN-RES | Research status |
| `/about` | BN-ABT | Purpose, method, team |
| `/standards` | BN-STD | Editorial standards |
| `/careers` | BN-JOB | Careers |
| `/404` | BN-404 | Not found |

---

## Shared shell

**Instrument strip (top):** see DESIGN.md §3. Current page link gets a hand-drawn underline in `--accent`.

**Footer: "the back cover"**
- A full-width band of slightly darker paper (`--paper` mixed 4% toward ink) with the major grid only.
- Left: wordmark at `--t-xl`, clipped by the bottom edge of the page (Reference A's giant type, cropped).
- Right column, mono: links grouped as `READ` (Research, Datasets, Atlas) and `ABOUT US` (About, Standards, Careers), email, footer line, small print.
- A real "last updated" stamp: the build date and the data repo commit hash the data came from (`DATA @ a1b2c3d · BUILT 19 NOV 2026`). This is a true, useful version stamp for a data site.

---

## `/datasets` (BN-DATA)

Layout: **a specimen drawer.**
- Header: title at `--t-xl`, left-aligned, intro to its right on the 5-column offset, StickerLabel `2 LIVE · 3 PLANNED`.
- The SpecimenTags hang from a horizontal "string" line drawn across the page (SVG dashed line), at slightly different heights and fixed small rotations, like tags on a line. Live tags are solid; planned ones are dashed outlines with `COMING`.
- Each live tag: BN code (e.g. `BN-DATA-CLM-001`), title, coverage line computed from the data (e.g. `MAHARASHTRA · 35 DISTRICTS · 1951–2024`), column count, formats (`CSV · JSON`), size, two download links, link to its page.
- Below the drawer: a plain, dense, sortable **table** of all datasets (name, lens, geography, years, rows, updated, formats). Researchers want the table; the drawer is for everyone else.
- Mobile: the string becomes vertical; tags stack down it.

## `/datasets/[slug]` (one per dataset)

Layout: **a lab report page.**
- Left 8 columns: title, one-paragraph summary (from the README's first paragraph), then sections in this order: What is in it · How it is computed · Columns (a real table: column, meaning, unit) · Notes and caveats · Changes · How to cite.
- Right 4 columns (sticky on desktop): InstrumentPanel with coverage facts, download buttons (CSV, JSON, the README as `.md`), "Open in Atlas" (deep link with this dataset's default metric), source link to IMD, link to the build script in the GitHub repo.
- One small SketchMap of the latest year's default metric, with hachure, and a TrendChart of the state average over all years. Both carry source lines.
- Margin notes pull the caveats out of the README (Thane/Palghar, 1-degree grid smoothing, the Pune 2005 rainfall outlier).
- Content is generated from the dataset README at build time, so updating the data repo updates the page.

## `/research` (BN-RES)

Layout: **a lab notebook entry with almost nothing in it yet, and honest about it.**
- Big title, then one IndexCard pinned slightly off-grid: the Heat Action Plan project, status sticker `ARCHITECTURE PHASE`.
- A ruled "contents" list of the three output types with dotted leaders ending in the word `pending` instead of a page number (for example `Working papers ........ pending`).
- The notify line as running text with a mailto link.
- Keep it short. An empty section dressed up as a full one is the kind of filler we are avoiding.

## `/about` (BN-ABT)

Layout: **a two-page spread.**
- Left page: Lead paragraph at `--t-l`, then Purpose and Method as body text at 62ch, with one MarginNote ("Why five lenses? Because a heat wave is also an electricity bill and a food price.").
- Right page: the team as three IndexCards, stacked with slight overlaps and fixed rotations, name in display type, role in mono, bio in Geist.
- Below the spread: a small "how we work" diagram drawn with rough.js: five lens circles connected around one district outline (no icons, no emoji). Keep it simple and static.

## `/standards` (BN-STD)

Layout: **a numbered rulebook, the one place where numbers carry meaning.**
- Left margin: a sticky table of contents (Accuracy, Independence, Methodology, Sourcing, Corrections, Funding) that highlights the current section.
- Main column: each section as a clause (`§1 Accuracy` …) at 62ch measure, with the live site's full text.
- Funding section has a StickerLabel `TO BE PUBLISHED` rather than pretending.

## `/careers` (BN-JOB)

Layout: **a single note pinned to the page.** One IndexCard, centred-left, slightly rotated, with the careers text and email. A strip of tape across its top corner. Nothing else. Short pages are allowed to be short.

## `/404` (BN-404)

A SketchMap of Maharashtra with a Waypoint marked "You are here?" off the edge of the map in the Arabian Sea. Text: "This page is not on our map." Link back home and to the Atlas.

---

## Navigation and links

- Every dataset mention anywhere links to its dataset page.
- Every chart and map links to the Atlas view that reproduces it (Atlas state lives in the URL, see MAP.md).
- External links (IMD, GitHub) open in the same tab and are marked with a small mono `↗`.
