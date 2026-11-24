# CONTENT.md: all the words

Source: the current bharatnomy.com. Before building, fetch bharatnomy.com and its inner pages and check this file against them. **For facts (names, roles, commitments, status), the live site wins.** For layout and tone, this file wins.

Rules for every string on the site:
- No em dashes. Period, comma, colon or parentheses.
- Plain, confident, specific. Short sentences. No banned filler words (CLAUDE.md).
- Numbers in copy marked `{{like_this}}` are **computed at build time** by `scripts/build-data.mjs` (MAP.md §6). Never type a number in by hand.
- If the computed numbers do not support a sentence, rewrite the sentence to say what the data actually shows, and tell me. Do not bend the data to fit the copy.

---

## Global

- **Wordmark:** BHARATNOMY (Big Shoulders Display, 800, tracked tight)
- **Tagline:** India's economy, read as one connected system.
- **Footer line:** Independent, evidence-based research for citizens and market actors.
- **Footer small print:** © 2026 Bharatnomy. We maintain no partisan political affiliation.
- **Contact:** namaste@bharatnomy.com. We only write when there is something real to share.
- **BN codes** (already used on the live site, keep them): BN-RES Research · BN-DATA Datasets · BN-DASH Atlas (dashboards) · BN-ABT About · BN-STD Standards · BN-JOB Careers. The home page is BN-000.

---

## Home (BN-000)

Structure and scroll behaviour are in SCROLL.md. Copy by chapter:

### Title page
- Headline (mega, two lines max): **India's economy, read as one connected system.** Highlighter on "one connected system".
- Sub (max 20 words): An independent research firm studying India layer by layer: economics, finance, law and policy, traced to primary data.
- Primary action: **Open the Atlas** (links to /atlas). Secondary text link: Browse the datasets.
- Sticker label near the headline: `FIELD NOTEBOOK · VOL. 01 · MAHARASHTRA`

### Chapter I · Field sketch (method)
- Title: **We start with one state.**
- Body: Before we say anything about India, we map one state properly. Maharashtra first, district by district, from the government's own daily records. Then the next state, with the same method.
- Margin notes (with leader lines to the sketch):
  - `{{district_count}}` districts, drawn on their 2011 boundaries.
  - Daily temperature since {{temp_first_year}}, daily rainfall since {{rain_first_year}}, from IMD's gridded records.
  - Thane includes today's Palghar. The data uses 2011 boundaries, so we do too.

### Chapter II · Five lenses
- Title: **Five lenses on one economy.**
- Intro line: The same district looks different through each lens. We read all five, and the links between them.
- Lens pages (name, one line, three focus words):
  1. **Climate adaptation & resilience.** How India's institutions are, and are not, preparing for a hotter, less predictable future. `INSTITUTIONAL READINESS · CLIMATE RISK · RESILIENCE INFRASTRUCTURE`
  2. **Energy policy & markets.** The economics of India's move from coal to renewables. `TRANSITION ECONOMICS · POLICY DESIGN · MARKET SIGNALS`
  3. **Macroeconomic health.** Growth, inflation and fiscal capacity, read plainly and traced to primary data. `GROWTH · INFLATION · FISCAL CAPACITY`
  4. **Equity markets.** What is moving Indian capital markets and why, separated from the market narrative. `MARKET DRIVERS · INVESTOR BEHAVIOUR`
  5. **Commodity markets.** The real-economy forces behind commodity prices. `PRICE FORMATION · SUPPLY DYNAMICS`
- Status sticker on lenses 2 to 5: `IN PREPARATION`. On lens 1: `FIRST DATA PUBLISHED`.

### Chapter III · Seventy-four summers (the peak)
- Title: **{{temp_year_span}} summers, shaded by hand.**
- Lines that appear as the decades are drawn (each line keyed to a decade in SCROLL.md):
  - In the {{decade_first}}, the average district had {{p90_days_first}} days a year hotter than its own 1991 to 2020 normal for that time of year.
  - By the {{decade_last}}, it had {{p90_days_last}}.
  - The darkest district on this map, {{hottest_change_district}}, gained {{hottest_change_days}} such days a year.
- Closing line: Every line of shading is a number you can download.
- Source line (mono, under the map): `SOURCE: IMD GRIDDED DAILY TEMPERATURE (1° GRID), {{temp_first_year}}–{{temp_last_year}} · DISTRICT INDICES COMPUTED BY BHARATNOMY · METRIC: DAYS WITH TMAX ABOVE THE 1991–2020 90TH PERCENTILE` (en dashes in year ranges are fine; em dashes are not)
- Margin note (statistician's aside): Why this measure and not "heat wave days"? A 1-degree grid cell is about 110 km wide, so it smooths out the hottest afternoons. Counting days above each district's own 90th percentile does not depend on absolute thresholds, so it is the fairer way to compare change over time.

### Chapter IV · Standards
- Title: **Every claim cited. Every dataset open.**
- Three short commitments (set as a dense asymmetric spread, not three cards):
  - **Accuracy.** Every published number traces back to a named primary source and a script anyone can rerun.
  - **Independence.** No partisan affiliation. Funding and ownership will be published in full.
  - **Corrections.** When we get something wrong, we say so on the page where it happened.
- Link: Read our editorial standards (→ /standards)

### Chapter V · Open the notebook (datasets)
- Title: **Take the data with you.**
- Body: Our first {n} datasets are live for Maharashtra's districts: temperature and rainfall every year since 1951, power station generation and CO2, fly ash from coal plants, and Swachh Bharat sanitation. CSV and JSON, with sources and methods attached. ({n} is computed from the data build.)
- Two SpecimenTags (content from MAP.md dataset metadata).
- Link: All datasets (→ /datasets)

### Colophon (close)
- Line set as running text, not a button island: **Bharatnomy is young, independent and building in the open. Write to us at namaste@bharatnomy.com.**
- Small type below: team names and roles (from About), "Set in Big Shoulders Display and Geist. Maps drawn from Census 2011 district boundaries (DataMeet). Data: India Meteorological Department."

---

## Atlas (BN-DASH)

- Title (mega): **ATLAS** with sticker `BN-DASH · MAHARASHTRA · DISTRICTS`
- Intro (one line): District-level climate records for Maharashtra. Pick a measure, move through the years, open any district.
- Empty panel state: Select a district on the map, or search for one.
- Table view toggle label: Show as table
- Sketch view toggle label: Sketch view
- Caveat note (always visible near the legend): Figures are district averages of IMD's gridded data on 2011 boundaries. They are best compared across years and districts, not with a single weather station.
- Full metric labels and help text: MAP.md §3.

---

## Datasets (BN-DATA)

- Title: **Datasets**
- Intro: Cleaned, documented and free. Every file carries its source, its method and the date we collected it.
- Planned (shown as dashed, empty specimen tags): Original survey data · Cleaned government data · Proprietary indices. Sticker: `COMING`.
- Formats line: CSV and JSON. Source and collection-date metadata in every release.
- Licence line: ask me before publishing. Until then show: "Licence: to be confirmed. Cite as: Bharatnomy (2026), [dataset name]."

## Research (BN-RES)

- Title: **Research**
- Status: No publications yet. A working paper is in progress.
- First project: **Tracking Heat Action Plans across Maharashtra.** In its architecture phase; topic selection is still being finalised.
- Output types (as three labels, not cards): Working papers · Reports · Policy briefs
- Notify line: We will write to you when the first paper is out. (Link mailto:namaste@bharatnomy.com, subject "Notify me")

## About (BN-ABT)

- Title: **About**
- Lead: Bharatnomy is an independent research firm that studies India's economy layer by layer, combining economics, finance, law and policy.
- Purpose: Rigorous, home-grown research should not be locked away. We make it readable so citizens and market actors can make informed decisions and hold government to account.
- Method: Multidisciplinary by design. A district's heat, its power supply, its prices and its markets are one system, so we read them together.
- Team (IndexCards):
  - **Srikar**, Partner & CEO. Trained in the natural sciences, with a master's in medical nanotechnology. Studied public policy at the University of Chicago. Focuses on qualitative, field-based research.
  - **Kartik**, Partner. A policy and social-impact professional who runs his own think-and-do tank. Previously with the World Bank in Washington, D.C., and the Government of Maharashtra. Studied public policy at the University of Chicago.
  - **Sanchit**, Partner. Background in finance and wealth management, with a practitioner's view of capital markets.
  - Check the live site for any other team members before building.

## Standards (BN-STD)

- Title: **Editorial standards**
- Sections: Accuracy · Independence · Methodology · Sourcing · Corrections · Funding. Fetch the full text from bharatnomy.com/standards (or the live equivalent) and use it verbatim, removing em dashes.
- Funding note: Funding and ownership details are not yet published. They will be, here.

## Careers (BN-JOB)

- Title: **Careers**
- Body: We have no formal hiring process yet. We like people who cross disciplines. Write to us and tell us what you want to work on.
- Link: namaste@bharatnomy.com (subject "Working with Bharatnomy")
