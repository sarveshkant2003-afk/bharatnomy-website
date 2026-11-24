# Rainfall indicators by district, Maharashtra, 1951 to 2025 — Maharashtra

One row per district per year: annual and seasonal rainfall with departure from normal, rainy and heavy-rain days, the wettest day and wettest 5 days, dry spells, and a drought index (SPI). Computed by Bharatnomy from IMD's daily gridded rainfall; IMD does not publish these indicators as a district table.

## Coverage

- **Rows:** 2,625
- **Period:** 1951 to 2025
- **Districts:** 35 of 36

## Source

- **Data:** India Meteorological Department (IMD), Pune. Daily rainfall on a 0.25 x 0.25 degree grid (Pai et al. 2014), 1951-2025
- **Link:** https://imdpune.gov.in/lrfindex.php (Gridded data: `Rainfall_25_Bin.html`)
- **Downloaded:** 28 Oct 2026
- **District boundaries:** Census 2011 district map from DataMeet (community-made, not official), used only to decide which grid cells fall in each district. See [`_sources/datameet-maps/`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/_sources/datameet-maps/)
- **Original files:** [`_sources/imd-gridded/`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/_sources/imd-gridded/) (not committed, 1.9 GB; download steps in its README)
- **Script:** [`pipelines/imd-gridded/build_district_indices.py`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/pipelines/imd-gridded/build_district_indices.py)

## How it is computed

- **District daily rainfall** = area-weighted average of the IMD grid cells that overlap the district's **2011 boundary**. Each cell counts in proportion to the share of its area inside the district (3 cells for Mumbai City, 45 for Ahilyanagar). Cells IMD marks as missing are skipped that day.
- All indicators below are computed from that district-average daily series, for calendar years.
- **Normal** (for departures and SPI) = 1971-2020, IMD's long period average.

| Indicator | Definition |
|---|---|
| Seasons | Pre-monsoon March-May; south-west monsoon June-September; north-east monsoon / post-monsoon October-December |
| Departure | (rainfall / 1971-2020 average - 1) x 100 |
| Rainy day | 2.5 mm or more (IMD) |
| Heavy / very heavy / extremely heavy rain day | 64.5 / 115.6 / 204.5 mm or more in the day (IMD) |
| Rx1day, Rx5day | Highest 1-day and highest 5-day total in the year (5-day windows lie within the calendar year) |
| Consecutive dry days | Longest run of days with less than 1 mm in the calendar year (ETCCDI CDD) |
| Monsoon dry spell | **Our definition:** 7 or more days in a row with less than 2.5 mm during June-September. IMD has no fixed district rule |
| SPI | Standardised Precipitation Index (McKee et al. 1993): the year's total placed on a gamma distribution fitted to 1971-2020 and converted to a standard normal score. Below -1 = moderately dry, below -1.5 = severely dry, below -2 = extremely dry |

## Columns

| Column | Type | Unit | Description |
|---|---|---|---|
| `state_ut` | text |  | Maharashtra, 27 |
| `lgd_state_code` | text |  | Maharashtra, 27 |
| `district` | text |  | District, by its current name and LGD code (from [`_reference/geography.csv`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/_reference/geography.csv)) |
| `lgd_district_code` | text |  | District, by its current name and LGD code (from [`_reference/geography.csv`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/_reference/geography.csv)) |
| `year` | text |  | Calendar year |
| `rainfall_annual_mm` | number | mm | Total rainfall in the year, mm |
| `rainfall_mar_may_mm` | number | mm | Pre-monsoon, south-west monsoon and north-east monsoon rainfall, mm |
| `rainfall_jun_sep_mm` | number | mm | Pre-monsoon, south-west monsoon and north-east monsoon rainfall, mm |
| `rainfall_oct_dec_mm` | number | mm | Pre-monsoon, south-west monsoon and north-east monsoon rainfall, mm |
| `rainy_days_2_5mm` | integer |  | Days with 2.5 mm or more |
| `heavy_rain_days_64_5mm` | integer |  | Days at or above 64.5 / 115.6 / 204.5 mm |
| `very_heavy_rain_days_115_6mm` | integer |  | Days at or above 64.5 / 115.6 / 204.5 mm |
| `extremely_heavy_rain_days_204_5mm` | integer |  | Days at or above 64.5 / 115.6 / 204.5 mm |
| `rx1day_mm` | number | mm | Highest 1-day and 5-day rainfall, mm |
| `rx5day_mm` | number | mm | Highest 1-day and 5-day rainfall, mm |
| `consecutive_dry_days` | integer |  | Longest run of days with less than 1 mm |
| `monsoon_dry_spells_7day` | integer |  | Number of dry spells (7+ days under 2.5 mm) in June-September |
| `monsoon_longest_dry_spell_days` | integer |  | Longest run of days under 2.5 mm in June-September |
| `rainfall_annual_departure_pct` | number | % | Departure from the 1971-2020 average, % |
| `rainfall_mar_may_departure_pct` | number | % | Departure from the 1971-2020 average, % |
| `rainfall_jun_sep_departure_pct` | number | % | Departure from the 1971-2020 average, % |
| `rainfall_oct_dec_departure_pct` | number | % | Departure from the 1971-2020 average, % |
| `spi_annual` | number |  | SPI of annual and June-September rainfall (unitless) |
| `spi_jun_sep` | number |  | SPI of annual and June-September rainfall (unitless) |
| `decade` | text |  | Decade of the year |
| `monsoon_category` | text |  | IMD category of June-September rainfall departure: large excess (60% or more), excess (20 to 59%), normal (-19 to +19%), deficient (-20 to -59%), large deficient (-60 to -99%), no rain |
| `monsoon_drought_class` | text |  | Drought class from `spi_jun_sep`: moderate (-1 to -1.49), severe (-1.5 to -1.99), extreme (-2 or less), none |

Units are read from the column name (warehouse convention). Empty cells (`null` in JSON) mean no value.

## Notes from the warehouse

These describe the full warehouse table (all states).

- **2011 boundaries.** Rows are the 35 districts of Census 2011. `Thane` includes today's Palghar (carved out in 2014); there is no Palghar row. Names and LGD codes are today's (Ahilyanagar = Ahmadnagar, Chhatrapati Sambhajinagar = Aurangabad, Dharashiv = Osmanabad, Beed = Bid).
- **Averages smooth out extremes.** Heavy-rain days and Rx1day are counted on the district average, so a downpour over part of a large district counts less than at a single rain gauge. Counts are lower than station-based ones and are best compared across years and districts, not with a single station's record.
- **IMD's grid gives Pune an exceptional 2005** (4,342 mm, against a 1971-2020 average of 1,011 mm; Satara 2,329 mm). In IMD's own file, 17 cells over the Pune-Satara Ghats exceed 5,000 mm that year. Kept as published; it raises Pune's 1971-2020 variability (see `CLM_rainfall-variability_*`).
- Small districts rest on few cells (Mumbai City 3, Mumbai Suburban 4), so their figures describe the surrounding area as much as the district; treat them with care.
- IMD's grid is built from rain-gauge records, and the number of gauges changes over time.
- Checks (5 Nov 2026): 2,625 rows = 35 districts x 75 years; no duplicate or empty keys; no blank values; seasons never add up to more than the annual total; heavy-rain days never exceed rainy days; Rx1day never exceeds Rx5day. Nagpur's annual rainfall agrees with the box average in `CLM_heat-indicators-nagpur_*` (correlation 0.97, means 1,135 vs 1,121 mm).

## Where this comes from

- Warehouse folder [`CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST) at commit `41650b8bb197`
- Filtered to `lgd_state_code` and cleaned by `build.py` in this repo. Files: `CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST.csv`, `CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST.json`.
