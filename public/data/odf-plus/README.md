# ODF Plus village status by district, all states, April 2022 and November 2026 — Maharashtra

How many villages in each district the Swachh Bharat Mission (Grameen) counts as ODF Plus, split into its three grades, on two dates: 1 April 2022 and 24 November 2026. ODF Plus means a village that stays open-defecation free and also manages its solid and liquid waste. The three grades are **Aspiring** (ODF sustained plus solid *or* liquid waste management), **Rising** (both solid and liquid waste management) and **Model** (both, plus visual cleanliness and IEC).

## Coverage

- **Rows:** 68
- **Period:** 2022 to 2026
- **Districts:** 34 of 36
- 2 state-total row(s) from the warehouse table are left out; add up district rows instead.

## Source

- **Data:** Department of Drinking Water and Sanitation, Ministry of Jal Shakti: Swachh Bharat Mission (Grameen) dashboard
- **Table taken from:** "States/UTs Wise ODF Plus Status" on the states dashboard, and the district-wise data the same page embeds for its map (page dated 24-Nov-2026)
- **Link:** https://sbm.gov.in/sbmgdashboard/statesdashboard.aspx
- **Downloaded:** 24 Nov 2026 (saved page: `_sources/mojs-sbmg/raw/mojs-sbmg_states-dashboard_2026-11-24.html`)
- **Scripts:** [`pipelines/mojs-sbmg/`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/pipelines/mojs-sbmg/) (`fetch_dashboard.sh`, `build_odf_plus.py`, `check_odf_plus.py`)

## Columns

| Column | Type | Unit | Description |
|---|---|---|---|
| `state_ut` | text |  | State / UT and its LGD code |
| `lgd_state_code` | text |  | State / UT and its LGD code |
| `district` | text |  | District as spelled on the dashboard (`State total` and `All India` rows are the dashboard's printed totals) |
| `lgd_district_code` | text |  | LGD district code (added by Bharatnomy from `_reference/geography.csv`, see Notes) |
| `sbm_district_code` | text |  | The dashboard's own district code: the Census 2011 code for districts that existed in 2011, an SBM number for newer ones (e.g. Palghar 732) |
| `date` | text |  | Snapshot date: `2022-04-01` or `2026-11-24` |
| `total_villages` | integer |  | Villages in the district on the dashboard (current count; the dashboard prints only one) |
| `odf_plus_villages` | integer |  | Villages declared ODF Plus, any grade |
| `odf_plus_aspiring_villages` | integer |  | Villages in each ODF Plus grade |
| `odf_plus_rising_villages` | integer |  | Villages in each ODF Plus grade |
| `odf_plus_model_villages` | integer |  | Villages in each ODF Plus grade |
| `odf_plus_villages_pct` | number | % | Share of `total_villages` that is ODF Plus / ODF Plus Model, % as published (district rows only) |
| `odf_plus_model_villages_pct` | number | % | Share of `total_villages` that is ODF Plus / ODF Plus Model, % as published (district rows only) |

Units are read from the column name (warehouse convention). Empty cells (`null` in JSON) mean no value.

## Notes from the warehouse

These describe the full warehouse table (all states).

- Field names on the page are misleading: the district fields without a suffix hold the 1 April 2022 snapshot and those ending `1Sep2022` hold the current one. This was checked against the printed state table: the district sums match it exactly for every state and both dates.
- Rural only: districts with no villages (Mumbai, Mumbai Suburban, Delhi's districts, Chandigarh) are not on the dashboard.
- LGD codes: 622 districts matched by Census 2011 code, 134 by name (new districts and renamed ones, e.g. Palghar -> 665); every match is listed in `_sources/mojs-sbmg/match_log.txt`. All 756 dashboard districts got a code; no two share one.
- **Source oddity:** in 10 district rows for 2022-04-01 (9 in Tamil Nadu, Mahabubnagar in Telangana) ODF Plus villages exceed `total_villages` and the published share is above 100%. The 2022 counts were probably made on an older village list than today's `total_villages`. Values are kept as published.
- The dashboard also shows daily and weekly increments and state-level assets (soak pits, compost pits, plastic waste units, GOBARdhan plants); assets are national/state totals only and are not in this table.
- Checks (24 Nov 2026): 1,582 rows (756 districts x 2 dates, plus 35 state totals and All India x 2); no duplicate or empty keys; grades add up to ODF Plus villages in every row; district sums equal the printed state totals and those equal the printed All India total; published shares equal ODF Plus / total villages to 2 dp. Failing by design of the source: the 10 rows above.

## Where this comes from

- Warehouse folder [`WAT_odf-plus-villages_2022-to-2026_STATES_MOJS_DIST`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/WAT_odf-plus-villages_2022-to-2026_STATES_MOJS_DIST) at commit `ff7d662c4206`
- Filtered to `lgd_state_code` and cleaned by `build.py` in this repo. Files: `WAT_odf-plus-villages_2022-to-2026_MH_MOJS_DIST.csv`, `WAT_odf-plus-villages_2022-to-2026_MH_MOJS_DIST.json`.
