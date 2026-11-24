// Where the site's data comes from. Plain JS (not TS) so that
// scripts/build-data.mjs can import it on any Node 18+ without a TS loader.
//
// The data repo is the Bharatnomy *front* repo: the cleaned, per-state copy of
// the warehouse, already joined on LGD codes. To move to newer data, change
// DATA_REF to a newer commit of DATA_REPO and run `npm run data`.

export const DATA_REPO = 'https://github.com/sarveshkant2003-afk/bharatnomy-front';
export const DATA_REF = '9dca6105473249429fa8656ab8915c5445ffd5e2';

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

// The only two datasets on the site. Adding a dataset = one entry here plus
// its metrics in metrics.mjs.
export const DATASETS = [
  {
    slug: 'temperature',
    code: 'BN-DATA-CLM-001',
    lens: 'Climate adaptation & resilience',
    folder: 'CLM_temperature-indices_1951-to-2024_MH_BNY_DIST',
    path: `states/${STATE.slug}/climate-adaptation/CLM_temperature-indices_1951-to-2024_MH_BNY_DIST`,
    title: 'Temperature and heat by district',
    defaultMetric: 'days_tmax_above_p90',
    source: 'IMD gridded daily temperature (1° grid)',
    sourceUrl: 'https://imdpune.gov.in/lrfindex.php',
  },
  {
    slug: 'rainfall',
    code: 'BN-DATA-CLM-002',
    lens: 'Climate adaptation & resilience',
    folder: 'CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST',
    path: `states/${STATE.slug}/climate-adaptation/CLM_rainfall-indices_1951-to-2025_MH_BNY_DIST`,
    title: 'Rainfall and monsoon by district',
    defaultMetric: 'rainfall_jun_sep_departure_pct',
    source: 'IMD gridded daily rainfall (0.25° grid)',
    sourceUrl: 'https://imdpune.gov.in/lrfindex.php',
  },
];

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
