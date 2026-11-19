// Build-time loaders for public/data/ (written by `npm run data`).
// Only used in .astro frontmatter, never shipped to the browser.
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

function read<T>(rel: string): T {
  const f = path.join(DATA_DIR, rel);
  if (!fs.existsSync(f)) throw new Error(`Missing ${rel}. Run \`npm run data\` first.`);
  return JSON.parse(fs.readFileSync(f, 'utf8')) as T;
}

export interface District { lgd: string; name: string; census2011: string; cx: number; cy: number }
export interface MetricFile {
  metric: string; dataset: string; label: string; unit: string;
  years: number[]; values: Record<string, (number | string | null)[]>;
  state_mean: (number | null)[] | null; domain: (number | string)[];
  p05_p95: [number, number] | null; source: string; updated: string;
}
export interface DatasetMeta {
  slug: string; code: string; lens: string; folder: string; path: string; title: string;
  defaultMetric: string; source: string; sourceUrl: string;
  rows: number; districts: number; columns: number; first_year: number; last_year: number;
  csv_kb: number; json_kb: number; metrics: string[];
}
export interface Stats {
  district_count: number; temp_first_year: number; temp_last_year: number; temp_year_span: number;
  rain_first_year: number; rain_last_year: number; decade_first: string; decade_last: string;
  p90_days_first: number; p90_days_last: number; hottest_change_district: string;
  hottest_change_district_lgd: string; hottest_change_days: number; districts_warmer_last_decade: number;
  monsoon_latest_avg_departure_pct: number; monsoon_latest_deficient: number; monsoon_latest_excess: number;
  state_centroid: [number, number];
  states_mapped: string[];
  india_boundaries: { states_2011: number; commit: string };
  data: { repo: string; commit: string; short: string; date: string; built: string };
  ticker: { lgd: string | null; year: number; text: string }[];
  datasets: DatasetMeta[];
}
export interface DecadeFrames {
  metric: string;
  decades: { label: string; start: number; first: number; last: number; years: number; complete: boolean }[];
  values: Record<string, (number | null)[]>;
}

let _stats: Stats | undefined;
export const stats = (): Stats => (_stats ??= read<Stats>('stats.json'));
export const districts = (): District[] => read<District[]>('districts.json');
export const districtsGeo = (): GeoJSON.FeatureCollection => read('districts.geojson');
export const stateGeo = (): GeoJSON.FeatureCollection => read('state.geojson');
export const indiaGeo = (): GeoJSON.FeatureCollection => read('india-states.geojson');
export const metricFile = (dataset: string, metric: string): MetricFile => read(`${dataset}/${metric}.json`);
export const decadeFrames = (): DecadeFrames => read('temperature/decades_days_tmax_above_p90.json');
export const readme = (dataset: string): string => fs.readFileSync(path.join(DATA_DIR, dataset, 'README.md'), 'utf8');

/** Values for one year as { lgd: value }. */
export function yearSlice(m: MetricFile, year: number): Record<string, number | string | null> {
  const i = m.years.indexOf(year);
  return Object.fromEntries(Object.entries(m.values).map(([k, v]) => [k, i < 0 ? null : v[i]]));
}
