# Fly ash from coal power plants by district, Maharashtra, 2025-26 — Maharashtra

For each of Maharashtra's 19 coal power plants: the district it is in, the ash it produced in 2025-26 and how much ash was put to use (cement, bricks, roads, mine filling and so on).

## Coverage

- **Rows:** 19
- **Period:** 2025-26
- **Note:** The warehouse table covers FY2025-26; this state's rows cover 2025-26.
- **Districts:** 13 of 36
- 1 state-total row(s) from the warehouse table are left out; add up district rows instead.

## Source

- **Data:** Central Electricity Authority (CEA), *Fly Ash Generation at Coal / Lignite Based Thermal Power Stations and its Utilization in the Country*, Year Book 2026 (FY 2025-26), Table 5.9 (Maharashtra)
- **Built from:** [`ENG_fly-ash-power-plants_FY2025-26_STATES_CEA`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/ENG_fly-ash-power-plants_FY2025-26_STATES_CEA/) and the station-to-district lookup [`_reference/power-stations-maharashtra.csv`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/_reference/power-stations-maharashtra.csv) (Bharatnomy)
- **Downloaded:** 17 Nov 2026 (CEA file); districts assigned 24 Nov 2026
- **Script:** [`pipelines/power-stations-mh/build_station_districts_mh.py`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/pipelines/power-stations-mh/build_station_districts_mh.py); checks in `check_station_districts_mh.py`

## Bharatnomy calculation

This table is computed by Bharatnomy, not published as-is by the source. See the notes below.

## Columns

| Column | Type | Unit | Description |
|---|---|---|---|
| `state_ut` | text |  | Maharashtra, 27 |
| `lgd_state_code` | text |  | Maharashtra, 27 |
| `district` | text |  | District the plant is in; `State total` for CEA's printed Grand Total row |
| `lgd_district_code` | text |  | District the plant is in; `State total` for CEA's printed Grand Total row |
| `cea_co2_station` | text |  | The same plant's name in the CEA CO2 Baseline Database (links to `ENG_power-station-generation-co2_*_MH_BNY_DIST`) |
| `plant` | text |  | Plant name as printed in the Year Book |
| `year` | text |  | 2025-26 |
| `utility` | text |  | Owning company |
| `installed_capacity_mw` | integer |  | Installed capacity, MW |
| `ash_generation_lmt` | number |  | Ash generated, lakh tonnes (1 lakh tonnes = 100,000 t) |
| `ash_utilization_lmt` | number |  | Ash utilised, lakh tonnes |
| `ash_utilization_pct` | number | % | Ash utilised as % of ash generated; above 100 when ash stored in ponds from earlier years is also used |

Units are read from the column name (warehouse convention). Empty cells (`null` in JSON) mean no value.

## Notes from the warehouse

These describe the full warehouse table (all states).

- Year Book names differ from the CO2 database; each plant is tied to its CO2-database station by hand (list in the script). `APL` (Adani Electricity Mumbai, 500 MW) is Dahanu TPS. For every plant the capacity printed here equals the tied station's capacity in the CO2 database.
- Values are copied unchanged; only the district and `cea_co2_station` columns are added.
- Checks (24 Nov 2026): 20 rows (19 plants + State total); plants add up to the printed Grand Total for ash generated (339.45) and used (312.22 lakh tonnes).

## Where this comes from

- Warehouse folder [`ENG_fly-ash-power-stations_FY2025-26_MH_BNY_DIST`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/ff7d662c4206e81ed483c708cd23a4ab4c946d2c/ENG_fly-ash-power-stations_FY2025-26_MH_BNY_DIST) at commit `ff7d662c4206`
- Filtered to `lgd_state_code` and cleaned by `build.py` in this repo. Files: `ENG_fly-ash-power-stations_2025-26_MH_BNY_DIST.csv`, `ENG_fly-ash-power-stations_2025-26_MH_BNY_DIST.json`.
