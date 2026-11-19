# MAP.md: the Atlas and the data pipeline

The Atlas (`/atlas`, BN-DASH) is the working heart of the site. The bar is set by CRAVIS's visualisation tool (cravis.ai/visualisation-tool): pick a measure, move through time, switch views, focus on a district, see its trend, all reflected in the URL. We match that level of function for **two datasets only** (temperature and rainfall, Maharashtra districts, historical observed data), presented in the notebook style from DESIGN.md.

Scope for now: no future projections, no grid-cell view, no other states, no other datasets. Build so that adding a dataset or metric is a config change (§3), not new code.

---

## 1. Find the data (do this first)

The data lives in the Bharatnomy data warehouse repo: **https://github.com/sarveshkant2003-afk/bharatnomy-data** (public). If I point you to a cleaner "front" repo later, switch to it via config.

Find these yourself and confirm them against their README files before writing any code:

- **Temperature:** district-level temperature and heat indicators for Maharashtra, one row per district per year. At the time of writing the folder is named like `CLM_temperature-indices_1951-to-2024_MH_BNY_DIST/` (CSV + README).
- **Rainfall:** district-level rainfall indicators for Maharashtra, one row per district per year. Folder named like `CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST/`.
- **District boundaries:** the DataMeet Census 2011 district shapefile under `_sources/datameet-maps/raw/` (`.shp/.shx/.dbf/.prj`). Its attribute table has `DISTRICT`, `ST_NM`, `ST_CEN_CD`, `DT_CEN_CD`, `censuscode`.
- **Join key:** `_reference/geography.csv` maps `census2011_district_code` to `lgd_district_code`. The dataset CSVs carry `lgd_district_code` (their census code column was dropped on 17 Nov 2026). So: shapefile `censuscode` → geography.csv → `lgd_district_code` → dataset rows.

Folder names may have changed since this was written. Search the repo, do not hardcode a guess. Report what you found (paths, row counts, district count, year range, column list) before going further.

Key facts from the READMEs that the site must respect:
- 35 districts on **2011 boundaries**. `Thane` includes today's Palghar; there is no Palghar row. Names and LGD codes are today's (Ahilyanagar, Chhatrapati Sambhajinagar, Dharashiv, Beed).
- Temperature: IMD 1.0° daily grid, 1951 to 2024. Rainfall: IMD 0.25° daily grid, 1951 to 2025.
- Normals: temperature percentiles use 1991 to 2020; rainfall departures and SPI use 1971 to 2020; the added anomaly columns use 1981 to 2010. Show the right baseline in each metric's help text.
- Caveats to surface: the 1° grid smooths extremes (heat wave day counts are low, read as trend); small districts (Mumbai City, Mumbai Suburban) rest on few cells; Pune's exceptional 2005 rainfall is kept as published.

## 2. Data pipeline (`scripts/build-data.mjs`, run with `npm run data`)

1. Clone or fetch the data repo at a pinned ref (`DATA_REPO` and `DATA_REF` in `src/config/data.ts`). Record the commit hash for the footer stamp.
2. Boundaries: convert the shapefile with **mapshaper** (npm): filter to Maharashtra (check the exact `ST_NM` spelling), reproject to WGS84 if needed, simplify (target under 250 KB, keep shapes, no slivers or gaps), 5-decimal precision. Join `lgd_district_code`, `district` name and computed centroid into properties. Also write a dissolved state outline. **Fail the build if any of the 35 districts does not join.**
3. Data: parse CSVs with `d3-dsv`. For each metric in the registry (§3), write `public/data/{dataset}/{metric}.json`:
   ```json
   { "metric": "days_tmax_above_p90", "unit": "days", "years": [1951, ...],
     "values": { "<lgd_code>": [12, 9, ...] }, "state_mean": [ ... ],
     "domain": [min, max], "source": "...", "updated": "..." }
   ```
   Small files, loaded only when that metric is chosen.
4. Copy each dataset's original CSV and README into `public/data/{dataset}/`, and write a full JSON version (array of row objects) for download.
5. Write `public/data/stats.json`: every `{{placeholder}}` used in CONTENT.md, plus ticker facts (§7). Definitions in §6.
6. Print a validation summary: rows per dataset, districts, years, null counts per metric, join results, file sizes.

## 3. Metric registry (`src/config/metrics.ts`)

One entry per metric: `id` (column name), `dataset`, `label`, `short` (for chips), `unit`, `scale` (DESIGN.md scale name), `breaks` (`quantile` | `diverging-symmetric` | `categorical`), `help` (one or two plain sentences including the baseline), `caveat` (optional). Start with:

**Temperature** (default metric: `days_tmax_above_p90`)

| Column | Label | Scale |
|---|---|---|
| `days_tmax_above_p90` | Unusually hot days (above the 1991 to 2020 90th percentile) | sequential warm |
| `nights_tmin_above_p90` | Unusually warm nights | sequential warm |
| `tmax_mean_anomaly_c` | Average daily maximum vs 1981 to 2010 (°C) | diverging cool/warm |
| `tmax_mean_c` | Average daily maximum (°C) | sequential warm |
| `tmin_mean_c` | Average daily minimum (°C) | sequential warm |
| `tmax_mean_mar_may_c` | Summer (March to May) average maximum (°C) | sequential warm |
| `tmax_highest_c` | Hottest day of the year (°C) | sequential warm |
| `days_tmax_40c_or_more` | Days at 40 °C or above | sequential warm |
| `heatwave_days` | Heat wave days (IMD criteria) | sequential warm, with the grid-smoothing caveat |

**Rainfall** (default metric: `rainfall_jun_sep_departure_pct`)

| Column | Label | Scale |
|---|---|---|
| `rainfall_jun_sep_departure_pct` | Monsoon rainfall vs 1971 to 2020 average (%) | diverging dry/wet |
| `rainfall_annual_mm` | Annual rainfall (mm) | sequential wet |
| `rainfall_jun_sep_mm` | Monsoon (June to September) rainfall (mm) | sequential wet |
| `rainy_days_2_5mm` | Rainy days (2.5 mm or more) | sequential wet |
| `heavy_rain_days_64_5mm` | Heavy rain days (64.5 mm or more) | sequential wet |
| `rx1day_mm` | Wettest day of the year (mm) | sequential wet |
| `monsoon_longest_dry_spell_days` | Longest monsoon dry spell (days) | sequential dry (brown half of dry/wet) |
| `spi_jun_sep` | Monsoon drought index (SPI) | diverging dry/wet, fixed breaks at -2, -1.5, -1, 1, 1.5, 2 |
| `monsoon_category` | Monsoon category (IMD) | categorical |

Confirm every column exists in the CSVs. Drop any that do not and tell me.

## 4. Atlas layout

**Desktop (1440px): a notebook spread.**

```
┌ instrument strip ─────────────────────────────────────────────────────────────┐
│ ATLAS (mega, clipped)                     sticker: BN-DASH · MAHARASHTRA        │
├──────────────┬───────────────────────────────────────────┬───────────────────┤
│ CONTROLS     │                                           │ DISTRICT PANEL     │
│ (left page   │            MAP (MapLibre)                 │ (right margin,     │
│  margin)     │   on graph paper, no basemap              │  index card)       │
│              │                                           │                    │
│ Dataset tabs │   legend = sticker, bottom-left           │ name, LGD code     │
│ Metric list  │   caveat margin note + leader line        │ InstrumentPanel    │
│ View mode    │   source line under the map               │ rank of 35         │
│ Classes      │                                           │ TrendChart         │
│ Sketch view  │                                           │ compare chips      │
│ Table view   │                                           │ downloads          │
├──────────────┴───────────────────────────────────────────┴───────────────────┤
│ YEAR RULER: a full-width ruler (mm-style ticks, decade labels in mono),        │
│ draggable cursor, play/pause, the state-average sparkline drawn along it       │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **Dataset tabs**: two notebook tabs (Temperature, Rainfall) in the Climate lens colour family; switching keeps year and district.
- **Metric list**: radio list, label + one-line help; full help in a MarginNote on focus.
- **View mode** (the CRAVIS "timeline" equivalent): `Single year` (default, latest year) · `Decade average` (pick a decade) · `Change` (difference between two periods, e.g. 1961 to 1990 vs 1995 to 2024, diverging scale, user can set both periods).
- **Classes**: Quantile (5) / Equal interval (5). Diverging metrics are always symmetric around zero.
- **Year ruler** (signature control of the Atlas): a horizontal ruler like the edge of a notebook ruler, with the statewide average drawn as a small ink sparkline along it, so the user sees where the hot or dry years were before choosing one. Drag, click, arrow keys (±1 year), Shift+arrows (±10), Home/End. Play button steps through years at about 4 per second.
- **District panel** (empty state from CONTENT.md until a district is chosen): name in display type, `LGD 517 · CENSUS 2011 BOUNDARY` in mono, InstrumentPanel with the chosen year's value for the active metric plus 2 or 3 related metrics, rank among 35 (`4th hottest of 35`), TrendChart for the whole record with a 10-year rolling mean, the baseline period shaded, the selected year marked. "Compare" adds up to 3 districts to the chart (each a different ink dash pattern plus a colour from the active scale's dark end). Downloads: this district's rows as CSV.
- **Table view** (toggle): replaces the map with a sortable table of 35 districts for the current metric and year (value, rank, change vs baseline), with a bar sparkline per row. This is also the accessible alternative to the map.
- **Sketch view** (toggle): swaps MapLibre for the rough.js SketchMap with hachure density encoding the current values (DESIGN.md §5). Same legend, same panel. It is the notebook version of the same data, and a good screenshot.

**Mobile (390px)**: map at the top (55vh), year ruler pinned under it, everything else in a bottom sheet with three tabs: Measure · District · Table. Tap a district to open the District tab.

## 5. Map implementation (MapLibre)

- Style with **no tile sources**. Background layer transparent so the CSS graph paper shows through the canvas. Sources: the district GeoJSON (with `promoteId` = LGD code) and the state outline.
- Layers: district fill (colour from `feature-state`, so changing year or metric is a `setFeatureState` loop, not a re-render), district outline (`--ink` 0.75px), hover outline (ink 1.75px), selected outline (`--accent` 2.5px), state outline (ink 1.5px).
- No symbol layers (they need a glyph server). District names appear in a hover tooltip styled as a small StickerLabel, and as HTML labels for the selected and compared districts.
- Fit to Maharashtra with padding; disable rotation and pitch; limit zoom to roughly 5.5 to 9; restrict pan bounds to the state plus a margin.
- Clicking outside any district clears the selection. `Esc` clears too.
- Export: "Save map as PNG" draws the canvas plus legend, title, year and source line onto one image (`preserveDrawingBuffer: true`).
- Screen-reader summary updated on every change: "Unusually hot days, 2024. Highest: Chandrapur, 41 days. Lowest: …" (values from data, not this example).

## 6. URL state

Everything shareable, like CRAVIS: `/atlas?dataset=temperature&metric=days_tmax_above_p90&view=year&year=2024&district=517&compare=518,519&classes=quantile&sketch=0&table=0`. Changes use `history.replaceState` (year scrubbing must not flood history). Invalid params fall back to defaults silently.

## 7. Computed numbers (`stats.json`) and ticker facts

Definitions for the CONTENT.md placeholders:
- `district_count`, `temp_first_year`, `temp_last_year`, `temp_year_span` (inclusive count), `rain_first_year`, `rain_last_year`.
- `decade_first`, `decade_last`: the first and last **complete** decades in the temperature data (for 1951 to 2024 that is the 1960s and the 2010s). Write them as "1960s".
- `p90_days_first`, `p90_days_last`: mean over districts of each district's decade-average `days_tmax_above_p90`, rounded to whole days.
- `hottest_change_district`, `hottest_change_days`: district with the largest increase in decade-average `days_tmax_above_p90` between those decades, and that increase.

Ticker facts (8 to 12, generated, each with year and district), for example: hottest day recorded in the latest year and where; the district with the most unusually hot days in the latest year; the latest monsoon's statewide departure; how many districts had a deficient monsoon in the latest year; the wettest single day in the latest year and where; the longest monsoon dry spell in the latest year. Format: `CHANDRAPUR · 2024 · HOTTEST DAY 46.3 °C` (illustrative format only; values come from data).

## 8. Quality checks for the Atlas

- All 35 districts render for every metric and year; nulls render as a hatched "no data" pattern with a legend entry.
- Year scrubbing is smooth (no re-fetch per year; one file per metric holds all years).
- Every map state has a matching table state with identical numbers.
- Keyboard: tab order is controls, map (focusable; arrow keys pan), district search combobox, panel, ruler. The district search is the keyboard way to select districts.
- Reduced motion: no play animation by default, no fill transitions.
