# Air quality days by district, Maharashtra, 2015 to 2026 — Maharashtra

Per Maharashtra district and year: how many city-days the CPCB daily AQI bulletin put the district's monitored cities in each AQI category, the share of city-days with AQI above 100, and the mean and highest AQI. Pooled by Bharatnomy over the cities of each district.

## Coverage

- **Rows:** 154
- **Period:** 2015 to 2026
- **Districts:** 25 of 36

## Source

- **Data:** Central Pollution Control Board (CPCB), National Air Quality Index daily bulletins (4 pm)
- **Built from:** [`ENV_aqi-daily_2015-to-2026_STATES_CPCB_CITY`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/ENV_aqi-daily_2015-to-2026_STATES_CPCB_CITY/) and the city-to-district lookup [`_reference/aqi-cities-maharashtra.csv`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/_reference/aqi-cities-maharashtra.csv)
- **Link:** https://cpcb.nic.in/AQI_Bulletin.php
- **Downloaded:** 28 Oct 2026 (bulletins); counted 24 Nov 2026
- **Script:** [`pipelines/cpcb-aqi/build_aqi_days_district_mh.py`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/pipelines/cpcb-aqi/build_aqi_days_district_mh.py)

## How it is computed

A city-day is one bulletin city on one day. Each city is assigned to one district (lookup above, made by hand). Counts are summed over the district's cities, so Thane, with up to eight bulletin cities, has up to eight city-days per date. `city_days_aqi_above_100_pct` = `city_days_aqi_above_100` / `city_days_reported` x 100. `aqi_mean` is the mean over all city-days.

## Columns

| Column | Type | Unit | Description |
|---|---|---|---|
| `state_ut` | text |  | Maharashtra, 27 |
| `lgd_state_code` | text |  | Maharashtra, 27 |
| `district` | text |  | Current LGD district name and code |
| `lgd_district_code` | text |  | Current LGD district name and code |
| `year` | text |  | Calendar year |
| `cities` | text |  | Bulletin cities counted, `; `-separated |
| `city_days_reported` | integer |  | City-days in the bulletin that year |
| `city_days_good` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_satisfactory` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_moderate` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_poor` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_very_poor` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_severe` | integer |  | City-days in each AQI category as printed: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500) |
| `city_days_aqi_above_100` | integer |  | City-days with AQI above 100 (Moderate or worse), counted from the AQI value |
| `city_days_aqi_above_100_pct` | number | % | Share of reported city-days with AQI above 100, % |
| `aqi_mean` | number |  | Mean and highest AQI over the city-days |
| `aqi_highest` | integer |  | Mean and highest AQI over the city-days |

Units are read from the column name (warehouse convention). Empty cells (`null` in JSON) mean no value.

## Notes from the warehouse

These describe the full warehouse table (all states).

- Only districts with a bulletin city appear: 9 districts from 2015-16 (Mumbai, Mumbai Suburban, Thane, Pune, Nagpur, Nashik, Solapur, Chandrapur, Chhatrapati Sambhajinagar), about 25 from 2023. A missing district-year means no monitor in the bulletin, not clean air.
- 2015 starts on 1 May, 2026 ends on 27 Oct: both are part years.
- The bulletin city `Mumbai` covers stations in both Mumbai and Mumbai Suburban districts and is counted in both, so the two rows are identical.
- `Navi Mumbai` and `Belapur` are counted in Thane (most of the Navi Mumbai area); `Virar` and `Boisar` in Palghar (carved from Thane in 2014).
- `Aurangabad`: the bulletin printed the name without a state until it started adding `(Bihar)` on 6 May 2022. Plain `Aurangabad` is counted as Chhatrapati Sambhajinagar before that date, or on days when `Aurangabad (Bihar)` also appears; 13 other plain-label days are left out as ambiguous. The bulletin has no Maharashtra Aurangabad in 2023-2025.
- Checks (24 Nov 2026): 154 rows (district x year), no duplicate keys; category city-days add up to `city_days_reported` in every row; shares within 0-100.

## Where this comes from

- Warehouse folder [`ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST`](https://github.com/sarveshkant2003-afk/bharatnomy-data/tree/41650b8bb1975a4f4e082ba172d8b5dfb8f7db8a/ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST) at commit `41650b8bb197`
- Filtered to `lgd_state_code` and cleaned by `build.py` in this repo. Files: `ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST.csv`, `ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST.json`.
