// Where the site's data comes from. Plain JS (not TS) so that
// scripts/build-data.mjs can import it on any Node 18+ without a TS loader.
//
// The data repo is the Bharatnomy *front* repo: the cleaned, per-state copy of
// the warehouse, already joined on LGD codes. To move to newer data, change
// DATA_REF to a newer commit of DATA_REPO and run `npm run data`.

export const DATA_REPO = 'https://github.com/sarveshkant2003-afk/bharatnomy-front';
export const DATA_REF = '5ced7f6577ce1abaef9bbc6ce8c41c20de32c687';

// Set DATA_LOCAL=/path/to/a/checkout to build from a local copy instead of
// cloning (offline work). The commit stamp is then read from that checkout.

// The site covers India. Today only Maharashtra has district data; adding a
// state means adding it here once its data is in the front repo.
export const STATE = { slug: 'maharashtra', name: 'Maharashtra', lgd: '27' };
export const STATES_MAPPED = [STATE];

// All-India state outlines for the home page, dissolved from the Census 2011
// district map (DataMeet) kept in the warehouse. Boundaries are those of 2011.
export const INDIA_BOUNDARIES = {
  repo: 'https://github.com/sarveshkant2003-afk/bharatnomy-data',
  ref: 'cd7ce2d673103cc0e606e3cc37e49a9ae75f849a',
  dir: '_sources/datameet-maps/raw',
  file: 'datameet-maps_census2011-districts_2011.shp',
  stateField: 'ST_NM',
};

// Paths inside the data repo.
export const BOUNDARIES_PATH = `states/${STATE.slug}/districts.geojson`;

// The datasets on the site (Datasets pages and Atlas). Adding a dataset = one
// entry here plus its metrics in metrics.mjs. Fields:
//   time        'year' (1951), 'fy' (2017-18 -> 2017) or 'date' (2026-11-24 -> 2026); the Atlas works on whole years
//   aggregate   set for tables with one row per plant or station: scripts/build-data.mjs adds them up by district
//   baseline    normal period for trend bands and "vs normal" (null = none)
//   views       Atlas views that make sense for this record
//   periods     default periods for the Atlas "Change" view
//   agency      original data publisher (for citations)
//   notes       margin notes on the dataset page
//   caveat      the Atlas "Read with care" note
const IMD_CAVEAT = "Figures are district averages of IMD's gridded data on 2011 boundaries. They are best compared across years and districts, not with a single weather station. Thane includes today's Palghar.";
export const DATASETS = [
  {
    slug: 'temperature',
    code: 'BN-DATA-CLM-001',
    lens: 'Climate adaptation & resilience',
    tab: 'Temperature',
    folder: 'CLM_temperature-indices_1951-to-2024_MH_BNY_DIST',
    path: `states/${STATE.slug}/climate-adaptation/CLM_temperature-indices_1951-to-2024_MH_BNY_DIST`,
    title: 'Temperature and heat by district',
    defaultMetric: 'days_tmax_above_p90',
    source: 'IMD gridded daily temperature (1° grid)',
    sourceUrl: 'https://imdpune.gov.in/lrfindex.php',
    sourceLink: 'IMD gridded data',
    agency: 'India Meteorological Department',
    computed: 'district indices computed by Bharatnomy',
    rowUnit: 'district per year',
    time: 'year', baseline: [1991, 2020], views: ['year', 'decade', 'change'],
    periods: { a: [1961, 1990], b: [1995, 2024] },
    keywords: 'heat hot warm temperature climate imd',
    caveat: IMD_CAVEAT,
    notes: [
      { label: '2011 boundaries', text: "Thane includes today's Palghar. The data uses 2011 boundaries, so we do too." },
      { label: 'Grid smoothing', text: 'A 1-degree grid cell is about 110 km wide, so it smooths out the hottest afternoons. Heat wave counts are low and best read as a trend.' },
      { label: 'Small districts', text: 'Mumbai City and Mumbai Suburban rest on very few grid cells, so their figures describe the surrounding area as much as the district.' },
    ],
  },
  {
    slug: 'rainfall',
    code: 'BN-DATA-CLM-002',
    lens: 'Climate adaptation & resilience',
    tab: 'Rainfall',
    folder: 'CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST',
    path: `states/${STATE.slug}/climate-adaptation/CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST`,
    title: 'Rainfall and monsoon by district',
    defaultMetric: 'rainfall_jun_sep_departure_pct',
    source: 'IMD gridded daily rainfall (0.25° grid)',
    sourceUrl: 'https://imdpune.gov.in/lrfindex.php',
    sourceLink: 'IMD gridded data',
    agency: 'India Meteorological Department',
    computed: 'district indices computed by Bharatnomy',
    rowUnit: 'district per year',
    time: 'year', baseline: [1971, 2020], views: ['year', 'decade', 'change'],
    periods: { a: [1961, 1990], b: [1996, 2025] },
    keywords: 'rain monsoon drought wet dry imd',
    caveat: IMD_CAVEAT,
    notes: [
      { label: '2011 boundaries', text: "Thane includes today's Palghar. The data uses 2011 boundaries, so we do too." },
      { label: 'Pune, 2005', text: "IMD's grid gives Pune an exceptional 2005 (4,342 mm against a 1971 to 2020 average of 1,011 mm). We keep it as IMD published it." },
      { label: 'Small districts', text: 'Mumbai City and Mumbai Suburban rest on very few grid cells, so their figures describe the surrounding area as much as the district.' },
    ],
  },
  {
    slug: 'power-stations',
    code: 'BN-DATA-ENG-001',
    lens: 'Energy policy & markets',
    tab: 'Power stations',
    folder: 'ENG_power-station-generation-co2_2017-18-to-2025-26_MH_BNY_DIST',
    path: `states/${STATE.slug}/energy-policy/ENG_power-station-generation-co2_2017-18-to-2025-26_MH_BNY_DIST`,
    title: 'Power stations, generation and CO2 by district',
    defaultMetric: 'co2_emissions_mt',
    source: 'CEA CO2 Baseline Database v22 (station-wise)',
    sourceUrl: 'https://cea.nic.in/cdm-co2-baseline-view?mappingId=234&lang=en',
    sourceLink: 'CEA CO2 Baseline Database',
    agency: 'Central Electricity Authority',
    computed: 'stations placed in districts and added up by Bharatnomy',
    rowUnit: 'power station per year',
    time: 'fy', aggregate: 'stations', baseline: null, views: ['year', 'change'],
    periods: { a: [2017, 2019], b: [2023, 2025] },
    stateLabel: 'Maharashtra total',
    noData: 'no CEA-listed station',
    keywords: 'energy electricity power plant station coal thermal hydro gas nuclear emissions carbon co2 cea',
    caveat: 'Totals of the grid-connected thermal, hydro and nuclear stations CEA lists, by the district each station stands in. Solar, wind and captive plants are not included. Thane includes today\'s Palghar (Dahanu, Tarapur, Surya).',
    notes: [
      { label: 'What is counted', text: 'Grid-connected thermal (coal, gas, oil), hydro and nuclear stations listed by CEA. Solar, wind and captive industrial plants are not in this table.' },
      { label: 'Districts', text: 'CEA gives no location. Each station takes the district of its coordinates in the WRI Global Power Plant Database, or is placed by hand where WRI lacks it; the reason is in the data repo.' },
      { label: '2011 boundaries', text: "On the map, Palghar's stations (Dahanu, Tarapur, Surya) are added to Thane, because the maps use 2011 boundaries." },
    ],
  },
  {
    slug: 'fly-ash',
    code: 'BN-DATA-ENG-002',
    lens: 'Energy policy & markets',
    tab: 'Fly ash',
    folder: 'ENG_fly-ash-power-stations_2025-26_MH_BNY_DIST',
    path: `states/${STATE.slug}/energy-policy/ENG_fly-ash-power-stations_2025-26_MH_BNY_DIST`,
    title: 'Fly ash from coal power plants by district',
    defaultMetric: 'ash_generation_lmt',
    source: 'CEA Fly Ash Year Book 2026 (plant-wise)',
    sourceUrl: 'https://cea.nic.in/divisionPage/516?lang=en',
    sourceLink: 'CEA fly ash reports',
    agency: 'Central Electricity Authority',
    computed: 'plants placed in districts and added up by Bharatnomy',
    rowUnit: 'coal power plant',
    time: 'fy', aggregate: 'plants', baseline: null, views: ['year'],
    periods: { a: [2025, 2025], b: [2025, 2025] },
    stateLabel: 'Maharashtra total',
    noData: 'no coal power plant',
    keywords: 'energy coal ash fly ash thermal power plant waste cement bricks pollution cea',
    caveat: "Ash from the 19 coal power plants CEA lists for Maharashtra in 2025-26, added up by district. Thane includes today's Palghar (Dahanu).",
    notes: [
      { label: 'One year', text: 'The Year Book is annual; this release covers 2025-26 only, so the Atlas shows a single year.' },
      { label: 'Above 100%', text: 'A plant can use more ash than it made in the year by drawing down ash stored in ponds from earlier years.' },
      { label: '2011 boundaries', text: 'On the map, Dahanu (Palghar) is added to Thane, because the maps use 2011 boundaries.' },
    ],
  },
  {
    slug: 'odf-plus',
    code: 'BN-DATA-CLM-003',
    lens: 'Climate adaptation & resilience',
    tab: 'Swachh Bharat',
    folder: 'WAT_odf-plus-villages_2022-to-2026_MH_MOJS_DIST',
    path: `states/${STATE.slug}/climate-adaptation/WAT_odf-plus-villages_2022-to-2026_MH_MOJS_DIST`,
    title: 'Swachh Bharat: ODF Plus villages by district',
    defaultMetric: 'odf_plus_model_villages_pct',
    source: 'Swachh Bharat Mission (Grameen) dashboard, Ministry of Jal Shakti',
    sourceUrl: 'https://sbm.gov.in/sbmgdashboard/statesdashboard.aspx',
    sourceLink: 'SBM-G dashboard',
    agency: 'Department of Drinking Water and Sanitation, Ministry of Jal Shakti',
    computed: 'shares recomputed by Bharatnomy after pooling Palghar into Thane',
    rowUnit: 'district per snapshot date',
    time: 'date', aggregate: 'odf', baseline: null, views: ['year', 'change'],
    periods: { a: [2022, 2022], b: [2026, 2026] },
    yearLabels: { 2022: '1 Apr 2022', 2026: '24 Nov 2026' },
    stateLabel: 'Maharashtra (rural)',
    noData: 'no villages (urban district)',
    keywords: 'sanitation swachh bharat sbm odf open defecation toilets waste villages rural water',
    caveat: "Rural only: Mumbai City and Mumbai Suburban have no villages. Two snapshots, 1 April 2022 and 24 November 2026. Thane includes today's Palghar.",
    notes: [
      { label: 'Two snapshots', text: 'The dashboard prints ODF Plus status on two dates only: 1 April 2022 and the day it was saved (24 November 2026).' },
      { label: 'Grades', text: 'Aspiring: open-defecation free plus solid or liquid waste management. Rising: both. Model: both, plus visible cleanliness.' },
      { label: '2011 boundaries', text: "On the map, Palghar's villages are added to Thane and the shares are recomputed, because the maps use 2011 boundaries." },
    ],
  },
];

// Districts created after 2011 are pooled into their 2011 parent on the maps.
export const FOLD = { '665': '497' };   // Palghar -> Thane

// Extra layers for the home page's Chapter III map only (not Atlas datasets yet).
// Air quality: CPCB daily AQI bulletins pooled by district (Bharatnomy).
// Power plants: WRI Global Power Plant Database v1.3 (2021), placed in districts.
export const HOME_LAYERS = {
  aqi: {
    slug: 'aqi',
    folder: 'ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST',
    path: `states/${STATE.slug}/climate-adaptation/ENV_aqi-days-by-category_2015-to-2026_MH_BNY_DIST`,
    years: [2016, 2025],          // 2015 starts in May and 2026 ends in October: part years left out
    source: 'CPCB National Air Quality Index daily bulletins',
    sourceUrl: 'https://cpcb.nic.in/AQI_Bulletin.php',
  },
  plants: {
    slug: 'power-plants',
    folder: 'ENG_power-plants_2021_MH_WRI_DIST',
    path: `states/${STATE.slug}/energy-policy/ENG_power-plants_2021_MH_WRI_DIST`,
    source: 'WRI Global Power Plant Database v1.3 (2021)',
    sourceUrl: 'https://datasets.wri.org/dataset/globalpowerplantdatabase',
  },
};
