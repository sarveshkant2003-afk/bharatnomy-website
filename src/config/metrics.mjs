// Metric registry (MAP.md §3). One entry per column shown in the Atlas.
// Adding a metric = adding an entry here and running `npm run data`.
//
// scale:  warm | anomaly | wet | wetdry | dry | category | soot | power | clean   (see src/lib/scales.ts)
// keywords: extra words the Atlas measure search matches (optional)
// breaks: quantile | diverging-symmetric | fixed | categorical

/** @typedef {{ id:string, dataset:string, label:string, short:string, unit:string,
 *   scale:string, breaks:string, help:string, caveat?:string, fixed?:number[],
 *   categories?:string[], decimals:number, higherIs?:string, lowerIs?:string, keywords?:string }} Metric */

const GRID_TEMP = 'A 1-degree grid cell is about 110 km wide, so it smooths out the hottest afternoons. Read this as a trend, not as a station count.';
const SMALL = 'Mumbai City and Mumbai Suburban rest on very few grid cells, so their figures describe the surrounding area as much as the district.';

/** @type {Metric[]} */
export const METRICS = [
  // ---------------------------------------------------------------- temperature
  {
    id: 'days_tmax_above_p90', dataset: 'temperature',
    label: 'Unusually hot days (above the 1991 to 2020 90th percentile)', short: 'Hot days',
    unit: 'days', scale: 'warm', breaks: 'quantile', decimals: 0,
    higherIs: 'hottest', lowerIs: 'least hot',
    help: "Days when the maximum temperature beat the district's own 90th percentile for that time of year, measured over 1991 to 2020. It does not depend on a fixed threshold, so it is the fairest way to compare change over time.",
  },
  {
    id: 'nights_tmin_above_p90', dataset: 'temperature',
    label: 'Unusually warm nights', short: 'Warm nights',
    unit: 'nights', scale: 'warm', breaks: 'quantile', decimals: 0,
    higherIs: 'warmest nights', lowerIs: 'coolest nights',
    help: "Nights when the minimum temperature beat the district's own 1991 to 2020 90th percentile for that time of year.",
  },
  {
    id: 'tmax_mean_anomaly_c', dataset: 'temperature',
    label: 'Average daily maximum vs 1981 to 2010 (°C)', short: 'Tmax anomaly',
    unit: '°C', scale: 'anomaly', breaks: 'diverging-symmetric', decimals: 2,
    higherIs: 'warmest against normal', lowerIs: 'coolest against normal',
    help: "The year's average daily maximum minus the district's 1981 to 2010 average. Above zero is hotter than normal.",
  },
  {
    id: 'tmax_mean_c', dataset: 'temperature',
    label: 'Average daily maximum (°C)', short: 'Avg max',
    unit: '°C', scale: 'warm', breaks: 'quantile', decimals: 1,
    higherIs: 'hottest', lowerIs: 'coolest',
    help: 'The average of every daily maximum temperature in the year.',
  },
  {
    id: 'tmin_mean_c', dataset: 'temperature',
    label: 'Average daily minimum (°C)', short: 'Avg min',
    unit: '°C', scale: 'warm', breaks: 'quantile', decimals: 1,
    higherIs: 'warmest', lowerIs: 'coolest',
    help: 'The average of every daily minimum temperature in the year.',
  },
  {
    id: 'tmax_mean_mar_may_c', dataset: 'temperature',
    label: 'Summer (March to May) average maximum (°C)', short: 'Summer max',
    unit: '°C', scale: 'warm', breaks: 'quantile', decimals: 1,
    higherIs: 'hottest', lowerIs: 'coolest',
    help: 'The average daily maximum across March, April and May.',
  },
  {
    id: 'tmax_highest_c', dataset: 'temperature',
    label: 'Hottest day of the year (°C)', short: 'Hottest day',
    unit: '°C', scale: 'warm', breaks: 'quantile', decimals: 1,
    higherIs: 'hottest', lowerIs: 'coolest',
    help: 'The highest daily maximum of the year, on the district average.',
    caveat: GRID_TEMP,
  },
  {
    id: 'days_tmax_40c_or_more', dataset: 'temperature',
    label: 'Days at 40 °C or above', short: '40 °C days',
    unit: 'days', scale: 'warm', breaks: 'quantile', decimals: 0,
    higherIs: 'hottest', lowerIs: 'least hot',
    help: 'Days when the district-average maximum reached 40 °C or more.',
    caveat: GRID_TEMP,
  },
  {
    id: 'heatwave_days', dataset: 'temperature',
    label: 'Heat wave days (IMD criteria)', short: 'Heat waves',
    unit: 'days', scale: 'warm', breaks: 'quantile', decimals: 0,
    higherIs: 'most heat wave days', lowerIs: 'fewest heat wave days',
    help: "Days meeting IMD's heat wave rule for the plains: 40 °C or more and at least 4.5 °C above the 1991 to 2020 normal, or 45 °C or more.",
    caveat: "IMD's rule is written for weather stations. On a 1-degree grid the hottest afternoons are smoothed out, so these counts are far lower than station counts and are best read as a trend.",
  },

  // ------------------------------------------------------------------- rainfall
  {
    id: 'rainfall_jun_sep_departure_pct', dataset: 'rainfall',
    label: 'Monsoon rainfall vs 1971 to 2020 average (%)', short: 'Monsoon departure',
    unit: '%', scale: 'wetdry', breaks: 'diverging-symmetric', decimals: 1,
    higherIs: 'wettest against normal', lowerIs: 'driest against normal',
    help: "June to September rainfall compared with the district's 1971 to 2020 average, IMD's long period average. Zero is a normal monsoon.",
  },
  {
    id: 'rainfall_annual_mm', dataset: 'rainfall',
    label: 'Annual rainfall (mm)', short: 'Annual rain',
    unit: 'mm', scale: 'wet', breaks: 'quantile', decimals: 0,
    higherIs: 'wettest', lowerIs: 'driest',
    help: 'Total rainfall in the calendar year.',
    caveat: "IMD's grid gives Pune an exceptional 2005 (4,342 mm against a 1971 to 2020 average of 1,011 mm). We keep it as IMD published it.",
  },
  {
    id: 'rainfall_jun_sep_mm', dataset: 'rainfall',
    label: 'Monsoon (June to September) rainfall (mm)', short: 'Monsoon rain',
    unit: 'mm', scale: 'wet', breaks: 'quantile', decimals: 0,
    higherIs: 'wettest', lowerIs: 'driest',
    help: 'Total rainfall from June to September, the south-west monsoon.',
  },
  {
    id: 'rainy_days_2_5mm', dataset: 'rainfall',
    label: 'Rainy days (2.5 mm or more)', short: 'Rainy days',
    unit: 'days', scale: 'wet', breaks: 'quantile', decimals: 0,
    higherIs: 'most rainy days', lowerIs: 'fewest rainy days',
    help: "Days with 2.5 mm of rain or more, IMD's definition of a rainy day.",
  },
  {
    id: 'heavy_rain_days_64_5mm', dataset: 'rainfall',
    label: 'Heavy rain days (64.5 mm or more)', short: 'Heavy rain days',
    unit: 'days', scale: 'wet', breaks: 'quantile', decimals: 0,
    higherIs: 'most heavy rain days', lowerIs: 'fewest heavy rain days',
    help: "Days with 64.5 mm or more on the district average, IMD's heavy rain threshold.",
    caveat: 'Counted on the district average, so a downpour over part of a large district counts less than at a single rain gauge.',
  },
  {
    id: 'rx1day_mm', dataset: 'rainfall',
    label: 'Wettest day of the year (mm)', short: 'Wettest day',
    unit: 'mm', scale: 'wet', breaks: 'quantile', decimals: 1,
    higherIs: 'wettest', lowerIs: 'driest',
    help: 'The highest one-day rainfall of the year, on the district average.',
  },
  {
    id: 'monsoon_longest_dry_spell_days', dataset: 'rainfall',
    label: 'Longest monsoon dry spell (days)', short: 'Dry spell',
    unit: 'days', scale: 'dry', breaks: 'quantile', decimals: 0,
    higherIs: 'longest dry spell', lowerIs: 'shortest dry spell',
    help: 'The longest run of days under 2.5 mm between June and September. This is our definition; IMD has no fixed district rule.',
  },
  {
    id: 'spi_jun_sep', dataset: 'rainfall',
    label: 'Monsoon drought index (SPI)', short: 'SPI',
    unit: 'SPI', scale: 'wetdry', breaks: 'fixed', decimals: 2,
    fixed: [-2, -1.5, -1, 1, 1.5, 2],
    higherIs: 'wettest', lowerIs: 'driest',
    help: "June to September rainfall placed on the district's 1971 to 2020 distribution. Below -1 is moderately dry, below -1.5 severely dry, below -2 extremely dry.",
  },
  {
    id: 'monsoon_category', dataset: 'rainfall',
    label: 'Monsoon category (IMD)', short: 'Category',
    unit: '', scale: 'category', breaks: 'categorical', decimals: 0,
    categories: ['large deficient', 'deficient', 'normal', 'excess', 'large excess'],
    help: "IMD's class for the June to September departure from the 1971 to 2020 average: large deficient (-60 to -99%), deficient (-20 to -59%), normal (-19 to +19%), excess (+20 to +59%), large excess (+60% or more).",
  },
  // ------------------------------------------------------ power stations (CEA)
  {
    id: 'co2_emissions_mt', dataset: 'power-stations',
    label: 'CO2 emitted by power stations (million tonnes)', short: 'Power CO2',
    unit: 'Mt', scale: 'soot', breaks: 'quantile', decimals: 2,
    higherIs: 'most CO2', lowerIs: 'least CO2', keywords: 'carbon dioxide emissions greenhouse',
    help: 'CO2 emitted in the financial year by the CEA-listed power stations standing in the district, added up. Coal stations account for almost all of it.',
  },
  {
    id: 'net_generation_gwh', dataset: 'power-stations',
    label: 'Electricity generated by power stations (GWh)', short: 'Generation',
    unit: 'GWh', scale: 'power', breaks: 'quantile', decimals: 0,
    higherIs: 'most generation', lowerIs: 'least generation', keywords: 'electricity output energy',
    help: 'Net electricity sent out in the financial year by the thermal, hydro and nuclear stations in the district, added up. Solar and wind are not included.',
  },
  {
    id: 'coal_generation_gwh', dataset: 'power-stations',
    label: 'Electricity from coal stations (GWh)', short: 'Coal power',
    unit: 'GWh', scale: 'power', breaks: 'quantile', decimals: 0,
    higherIs: 'most coal power', lowerIs: 'least coal power', keywords: 'coal thermal',
    help: 'Net generation of the stations whose main fuel is coal, added up by district.',
  },
  {
    id: 'co2_intensity_t_per_mwh', dataset: 'power-stations',
    label: 'CO2 per unit of electricity (tonnes per MWh)', short: 'CO2 intensity',
    unit: 't/MWh', scale: 'soot', breaks: 'quantile', decimals: 2,
    higherIs: 'most CO2 per unit', lowerIs: 'least CO2 per unit', keywords: 'emission factor carbon intensity',
    help: "The district's station CO2 divided by its station generation. Close to 1 where coal dominates, near 0 where hydro or nuclear does.",
    caveat: 'Computed by Bharatnomy from the CEA totals; districts with only small stations can swing from year to year.',
  },
  {
    id: 'stations_generating', dataset: 'power-stations',
    label: 'Power stations that generated electricity', short: 'Stations',
    unit: 'stations', scale: 'power', breaks: 'quantile', decimals: 0,
    higherIs: 'most stations', lowerIs: 'fewest stations', keywords: 'plants count number',
    help: 'CEA-listed stations in the district with net generation above zero that year.',
  },
  // ------------------------------------------------------------- fly ash (CEA)
  {
    id: 'ash_generation_lmt', dataset: 'fly-ash',
    label: 'Ash produced by coal power plants (lakh tonnes)', short: 'Ash produced',
    unit: 'lakh t', scale: 'soot', breaks: 'quantile', decimals: 2,
    higherIs: 'most ash', lowerIs: 'least ash', keywords: 'fly ash waste pollution coal',
    help: 'Ash produced in 2025-26 by the coal power plants in the district, added up. One lakh tonnes is 100,000 tonnes.',
  },
  {
    id: 'ash_utilization_lmt', dataset: 'fly-ash',
    label: 'Ash put to use (lakh tonnes)', short: 'Ash used',
    unit: 'lakh t', scale: 'clean', breaks: 'quantile', decimals: 2,
    higherIs: 'most ash used', lowerIs: 'least ash used', keywords: 'utilisation utilization cement bricks roads',
    help: 'Ash used in cement, bricks, roads, mine filling and similar work in 2025-26, added up by district.',
  },
  {
    id: 'ash_utilization_pct', dataset: 'fly-ash',
    label: 'Share of ash put to use (%)', short: 'Ash used (%)',
    unit: '%', scale: 'clean', breaks: 'quantile', decimals: 1,
    higherIs: 'highest share used', lowerIs: 'lowest share used', keywords: 'utilisation utilization share percent',
    help: 'Ash used divided by ash produced, for the district\'s plants together.',
    caveat: 'Above 100% when ash stored in ponds from earlier years is also used.',
  },
  {
    id: 'coal_capacity_mw', dataset: 'fly-ash',
    label: 'Coal power plant capacity (MW)', short: 'Coal capacity',
    unit: 'MW', scale: 'power', breaks: 'quantile', decimals: 0,
    higherIs: 'most capacity', lowerIs: 'least capacity', keywords: 'installed capacity megawatt coal thermal',
    help: 'Installed capacity of the coal power plants in the district, as printed in the Year Book.',
  },
  // ------------------------------------------------- Swachh Bharat (SBM-G)
  {
    id: 'odf_plus_model_villages_pct', dataset: 'odf-plus',
    label: 'Villages at the ODF Plus Model grade (%)', short: 'ODF Plus Model',
    unit: '%', scale: 'clean', breaks: 'quantile', decimals: 1,
    higherIs: 'highest share', lowerIs: 'lowest share', keywords: 'sanitation swachh bharat open defecation free waste',
    help: 'Share of villages at the top ODF Plus grade: open-defecation free, solid and liquid waste managed, and visibly clean.',
  },
  {
    id: 'odf_plus_villages_pct', dataset: 'odf-plus',
    label: 'Villages declared ODF Plus, any grade (%)', short: 'ODF Plus',
    unit: '%', scale: 'clean', breaks: 'quantile', decimals: 1,
    higherIs: 'highest share', lowerIs: 'lowest share', keywords: 'sanitation swachh bharat open defecation free',
    help: 'Share of villages declared ODF Plus at any grade (Aspiring, Rising or Model).',
  },
  {
    id: 'odf_plus_model_villages', dataset: 'odf-plus',
    label: 'Villages at the ODF Plus Model grade (count)', short: 'Model villages',
    unit: 'villages', scale: 'clean', breaks: 'quantile', decimals: 0,
    higherIs: 'most villages', lowerIs: 'fewest villages', keywords: 'sanitation swachh bharat number count',
    help: 'Number of villages at the ODF Plus Model grade.',
  },
  {
    id: 'total_villages', dataset: 'odf-plus',
    label: 'Villages on the Swachh Bharat (Grameen) dashboard', short: 'Villages',
    unit: 'villages', scale: 'clean', breaks: 'quantile', decimals: 0,
    higherIs: 'most villages', lowerIs: 'fewest villages', keywords: 'rural villages count',
    help: 'Villages the dashboard counts in the district. It prints one current count, used for both dates.',
  },
];

export const SMALL_DISTRICT_NOTE = SMALL;
