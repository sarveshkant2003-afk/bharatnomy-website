# SCROLL.md: the home page, built with ScrollCraft

The home page (`/`, BN-000) is built with the **ScrollCraft** skill by nateherkai (https://github.com/nateherkai/scroll-craft). Install it as described in CLAUDE.md Phase 0, then **read its `SKILL.md` and every reference it tells you to read** (`uniqueness.md`, `feel.md`, `devices.md`, `taste.md`, `hero-depth.md`, `worlds.md`, `verify.md`). Follow its procedure. This file supplies everything the procedure asks the human for, plus the decisions we already made together, so you do **not** need to interview me again.

Only the home page uses ScrollCraft. The inner pages and the Atlas use normal Astro pages with the shared design system. Do not put pinned scroll acts on them.

---

## 1. How ScrollCraft fits into Astro

- **Engine:** copy `engine/scrollcraft.js` and `engine/scrollcraft.css` into `public/scrollcraft/` **unedited** (the skill forbids editing the engine). Note the skill version in HANDOVER.md.
- **Loading:** in `src/pages/index.astro`, link the CSS in `<head>`, load the JS with `<script is:inline src="/scrollcraft/scrollcraft.js"></script>` at the end of `<body>`, then `<script is:inline>ScrollCraft.mount(document.body);</script>`. Do not enable Astro's client-side router (View Transitions) on the home page; if it is ever enabled sitewide, call the instance's `destroy()` on `astro:before-swap`.
- **Markup:** write real semantic HTML in `.astro` components, marked up with `data-sc-*` attributes. Anything bespoke (the signature move) is your own JS reading the act's `--sc-p` custom property.
- **Workspace:** add `.scrollcraft.json` at the repo root with `{ "workspace": "scrollcraft" }`. Write the brief to `scrollcraft/builds/bharatnomy-home/BRIEF.md` and screenshots to `scrollcraft/builds/bharatnomy-home/lab/`. The actual page lives in `src/pages/index.astro`, not in the builds folder.
- **Assets:** none are generated. No kie.ai key is needed; skip that part of the skill. Every visual is type, rough.js geometry from our real district boundaries, or D3. Say so in the report.
- **Tokens:** map ScrollCraft's tokens onto ours in `index.astro`:
  ```css
  :root {
    --sc-canvas: #F2F3EF;  --sc-surface: #FBFBF8;
    --sc-ink:    #16181C;  --sc-ink-soft: #4C535C;
    --sc-accent: #2346C7;  --sc-accent-ink: #F7F8F4;
    --sc-font-display: "Big Shoulders Display", "Archivo", system-ui, sans-serif;
    --sc-font-text:    "Geist", system-ui, sans-serif;
  }
  ```

---

## 2. The brief (answers to ScrollCraft's Step 0 and Step 1)

Record this in `BRIEF.md` under the heading **"Interviewed in planning (Sarvesh + Claude, 19 Nov 2026)"**. These are real decisions, not self-authored guesses.

**1. Vibe in three to five words, plus references.**
A surveyor's field notebook of India. Precise, hand-made, curious, honest. References: a sketchbook travel page (giant condensed headline breaking the frame, ink line art with one blue accent, coordinates and file codes in the header, numbered waypoints on a dashed route, a small live "conditions" panel) and a community site's graph-paper ground with highlighter marks, tilted mono sticker labels and a ticker strip. Take the mechanics, not the content.

**2. The scroll journey, section by section.**
Title page that says what Bharatnomy is. Then how we work (one state at a time, Maharashtra first, from primary data). Then the five lenses. Then the proof: seventy-four years of Maharashtra's heat, drawn as you scroll. Then what we promise (every claim cited, every dataset open). Then the datasets you can take. Then a quiet sign-off with the email.

**3. The energy curve.**
Calm and confident at the top. Quiet and precise in the method chapter. Broadening through the lenses. The peak is the heat chapter: the loudest visual change on the page, but done with ink, not noise. Steady and serious through standards. Open and inviting at the datasets. Warm and still at the close.

**4. Feeling stage by stage, and the one moment.**
See §4 (feeling curve). The one moment: watching Maharashtra's map fill with denser and denser hand-drawn shading, decade by decade, and realising the shading is the real data.

**5. One thing this site should do that no site they have seen does.**
Draw its data by hand in front of you. The map is not a picture of the data; its pen strokes are the data.

**6. How far from premium-minimal.**
Editorial with a dense, annotated streak: paper, folios, measure and restraint, plus margin notes, stamps and stickers that make it feel used and alive. Not dark, not minimal-luxury, not playful-bouncy.

**7. One unbroken world, or distinct scenes?**
Distinct chapters. Each chapter is a page of the notebook with a hard change of ground. Not a continuous flight.

**8. Assets we already have.**
No photography, no footage, no logo yet. We have real data and real geography: the 35 Maharashtra district boundaries (Census 2011, DataMeet) and district-level temperature and rainfall records from 1951 (IMD, computed by Bharatnomy). That is the art.

**Step 1 answers**
- *What is this, and who is it for?* The home page of Bharatnomy, an independent research firm reading India's economy through five lenses. For citizens, journalists, researchers and market actors who want evidence, not narrative.
- *What must the visitor believe by the end?* Bharatnomy does the careful work from primary data, and shows all of it.
- *What does the visitor do next?* **Open the Atlas.** One label, used everywhere on the page.
- *Art direction:* the technical-drawing / illustrated world, justified because the brand's identity is the hand-made survey and the drawings are generated from real geometry and real data, not decoration. No clay, no photoreal.

---

## 3. Grammar: **Chaptered editorial** (uniqueness.md §2.2)

Why it wins: Bharatnomy is long-form substance (research, method, standards). The visitor should feel they read something rigorous, which is exactly this grammar.

Why the other seven lose (write this in the report):
- *Filmic one-shot:* no footage, and a carried-along film fights a research firm's tone. Also the grammar with the burden of proof.
- *Live surface:* the Atlas is the live surface and has its own page. The home page is an argument, not a tool.
- *Continuous world:* there is no single place to fly through; the subject is a set of districts and lenses.
- *Typographic poster:* too thin to carry five lenses and a data story.
- *Gallery / catalog:* no image collection to show.
- *Split stage:* workable, but our material is sequential chapters, not a held comparison.
- *Rhythmic cutlist:* too loud and fast for a firm whose brand is care.

Grammar rules we accept (from the skill): no fixed top bar (the instrument strip scrolls away; the **Folio** in the left margin is the persistent navigation, showing `BN-000 · CH. III · SEVENTY-FOUR SUMMERS` and updating as chapters pass); the hero is a **title page** (type on paper, no media above the fold); hard cuts between chapter grounds, no colour drift; no full-bleed scrub hero, no spotlight, no magnet, no pinned crossfading type stacks; the close is a **colophon** with the action set as running text.

Chapter grounds (hard cuts): Title, I and II on `--paper`; III on `--paper-raised` with a stronger graph grid (the "drafting sheet"); IV inverted (`--ink` ground, `--paper` text, accent switches to its light stop `#93A9F5`, measure it, restate `color` on the section as taste.md requires); V and the colophon back on `--paper`.

---

## 4. Journey, feeling curve, peak

**Journey (beats)**
1. Recognition: this is a different kind of research firm.
2. Method: one state at a time, from primary data.
3. Range: five lenses on one economy.
4. Substance (the peak): seventy-four summers, shaded by hand.
5. Trust: every claim cited, every dataset open.
6. Invitation: take the data.
7. Commitment: open the Atlas, write to us.

**Feeling curve (write before the score; add to BRIEF.md)**

| Chapter | Feeling | What on screen causes it |
|---|---|---|
| Title page | Intrigue | A huge condensed headline cropped by the page edge, a highlighter stroke, a stamped sticker, real coordinates. Nothing moves except the headline assembling |
| I · Field sketch | Calm focus | Maharashtra's outline drawing itself in ink as you scroll, margin notes arriving with leader lines |
| II · Five lenses | Breadth | Five notebook pages sliding past sideways, each with its coloured divider tab |
| (authored silence) | Held breath | Peak opens on a blank, unshaded map of the 1950s base for about a third of a viewport. This is deliberate, not dead scroll |
| III · Seventy-four summers | Unease turning to awe (**peak**) | The map re-shades decade by decade, denser each time, while the blue pen draws the statewide line along the graph paper below |
| IV · Standards | Steadiness | Hard cut to an ink page. Three dense commitments in an asymmetric spread |
| V · Open the notebook | Invitation | Specimen tags wipe up into view on their string |
| Colophon | Warm resolve | Small type, a signed-off line, the email, the Atlas link. It holds; it does not fade into the footer |

**Peak:** "You scroll and the map of Maharashtra literally darkens with ink, decade by decade, and the ink is the data." Lives in Chapter III, which gets the largest scroll span on the page by a visible margin.

**Tell-someone sentence:** "It's the site where Maharashtra's map gets hand-shaded in ink as you scroll, and the shading is seventy-four years of real heat records."

---

## 5. Score (device per chapter)

| Chapter | Device | Span (vh) | Why this one |
|---|---|---|---|
| Title page | `flow` + `kinetic` (lines), greet cue `"0 1 0 0"` | ~1 | The headline assembles once; the page is still a page. Hero layering is typographic: paper plane, headline plane, highlighter beneath words, sticker plane overlapping the headline, with slight differential `parallax` between sticker and headline |
| I · Field sketch | `reveal` (chapter-boundary wipe) + custom line-draw from `--sc-p` + `parallax` margin notes | ~1.8 (flow act) | Drawing the state is a change of state, which is what `reveal` is for |
| II · Five lenses | `pan` | ~4.2 | Lateral travel reads as range. Rail = heading item + 5 lens pages + closing note, so the overflow is healthy. Measure `scrollWidth - innerWidth` at 1440 and 390 |
| III · Seventy-four summers | `pin` + **signature move** + `count` | ~6 (largest) | The argument advances while the frame holds |
| IV · Standards | `flow` + `in`, stagger 60ms | natural height | Contrast with the pinned peak; a document moment |
| V · Open the notebook | `reveal` (`up`, on the tag row wrapper) | natural height | The datasets becoming available is a change of state |
| Colophon | `flow`, static, holds | natural height | The close resolves and stays |

Checks: at least four device families (kinetic, reveal, pan, pin, count, flow, parallax); never the same family twice in a row; zero `scrub` acts; Chapter III is the peak and has the largest span; the act before it (II) is calmer. Total length should land around 15 to 16vh with 7 acts, outside the 13.6 to 13.8vh band the skill flags.

Cue rules to respect: the hero uses the greet form; Chapter III is a middle pinned act, so its final cue must close with a two-value window ending at 1 (only the last act may hold); the colophon holds.

---

## 6. Signature move: "The hand-shaded census"

Bespoke to this site. Coded in the page, not the engine.

**What happens.** Chapter III pins. On the left 7 columns: the rough.js sketch map of Maharashtra's 35 districts. Below it, across the full width, a strip of graph paper with year ticks from 1951 to the last year. As `--sc-p` advances through the act:
1. The decade label (mono, large, top-left of the map) steps 1960s, 1970s … 2010s. Then a final frame labelled `2020–2024 · PARTIAL` (label it as partial, do not pretend it is a full decade).
2. Each district's **hachure fill is replaced by that decade's frame**, where hachure density encodes the district's decade-average `days_tmax_above_p90` (denser = more unusually hot days). The state visibly darkens with ink across the decades if the data shows warming. If it does not, the page shows what it does show, and you tell me.
3. The **blue pen line** (`--accent`, 2px, rough.js line, low roughness) draws the statewide annual series along the graph-paper strip via `stroke-dashoffset`, its tip reaching the decade currently shown. A small pen-nib marker rides the tip.
4. The CONTENT.md lines for Chapter III arrive keyed to decades (first at the first frame, second at the last full decade, third at the final frame) and **stay** (they accumulate down the right column; they do not crossfade). Numbers in them use `data-sc-count` with values from `stats.json`.
5. Pointer bonus (desktop, `(hover: hover)` only): hovering a district shows a tiny tally card (`CHANDRAPUR · 1960s 9 · 2010s 23 DAYS`, values from data) on a leader line.

**How to build it so it stays fast.**
- Pre-render every decade frame **at build time**: run rough.js's generator (`rough.generator()`) in Node inside an Astro component, with fixed seeds (LGD code + decade), and emit each frame as an inline SVG `<g>` of paths. No rough.js in the browser for this act.
- At runtime, a small script reads the act's `--sc-p`, picks the current and next frame, and crossfades them with `opacity` (or wipes with `clip-path` from the bottom, like ink spreading). Only two frames are visible at once.
- Hachure gap mapping: linear from the metric's 5th to 95th percentile across all decade frames, clamped; gap range roughly 14px (sparse) to 2.5px (dense). Keep a 0.75px ink outline on every district. Show a hachure legend sticker (`SPARSE = FEW HOT DAYS · DENSE = MANY`).
- Reduced motion: show the first and last full decades side by side as two static small multiples with the three lines below. Same meaning, no animation.
- Mobile: map on top, the lines below it, graph-paper strip under the map at full width. Span about 5.

Source line and the statistician's margin note from CONTENT.md sit under the map for the whole act.

---

## 7. ScrollCraft hard rules that matter most here

- No scroll cue, arrow or mouse icon anywhere.
- No `01 / 06` counters. The folio's chapter numbers are allowed because this is the chaptered-editorial grammar, where sequence is information.
- At most one eyebrow per three chapters. Headings carry themselves.
- No em dashes anywhere visible.
- No invented statistics. Every `data-sc-count` value comes from `stats.json`.
- `transform` and `opacity` only (plus `clip-path` and `stroke-dashoffset`). No `transition: all`.
- No gradient text, glow or zero-blur offset shadows.
- The close resolves and holds; it is not just the footer.
- Run the fingerprint gate (the registry starts empty, so this build has nothing to clear) and append this build's row to `scrollcraft/FINGERPRINTS.md` afterwards.

## 8. Verification (ScrollCraft Step 5, adapted for Astro)

```bash
npm run build && npm run preview          # serves on http://localhost:4321
cd scrollcraft/builds/bharatnomy-home && npm i playwright-core
node <skill>/scripts/shoot.mjs --url http://localhost:4321 --out lab/shots
node <skill>/scripts/shoot.mjs --url http://localhost:4321 --out lab/mobile --width 390 --height 844
node <skill>/scripts/shoot.mjs --url http://localhost:4321 --out lab/reduced --reduced-motion
```

Then read `sheet.png` for each run yourself. Check specifically: the authored silence at the start of Chapter III is the only near-static stretch; the pan rail has real overflow at both widths; every decade frame of the signature move appears; Chapter III's lines never overlap the next chapter during the un-pin; contrast on the inverted Standards chapter; the colophon holds on the last screen. Do the feel check (one word per chapter, then compare with §4). Report what you verified and what you could not (a real phone is not covered by headless Chrome).
