// Atlas state: one object, mirrored to the URL with replaceState (MAP.md §6).
import { METRICS } from '../../config/metrics.mjs';
import { DATASETS } from '../../config/data.mjs';

export type View = 'year' | 'decade' | 'change';
export interface Metric {
  id: string; dataset: string; label: string; short: string; unit: string; scale: string; breaks: string;
  help: string; caveat?: string; fixed?: number[]; categories?: string[]; decimals: number; higherIs?: string; lowerIs?: string;
}
export interface State {
  dataset: string; metric: string; view: View; year: number;
  a: [number, number]; b: [number, number];     // change periods
  district: string | null; compare: string[];
  classes: 'quantile' | 'equal'; sketch: boolean; table: boolean;
}

export const metrics = METRICS as Metric[];
export const datasets = DATASETS;
export const metricById = (id: string) => metrics.find((m) => m.id === id)!;
export const metricsOf = (ds: string) => metrics.filter((m) => m.dataset === ds);
export const baselineOf = (ds: string): [number, number] => (ds === 'temperature' ? [1991, 2020] : [1971, 2020]);

export function defaults(ds = 'temperature', lastYear = 2024): State {
  const d = datasets.find((x) => x.slug === ds)!;
  return {
    dataset: ds, metric: d.defaultMetric, view: 'year', year: lastYear,
    a: [1961, 1990], b: [lastYear - 29, lastYear],
    district: null, compare: [], classes: 'quantile', sketch: false, table: false,
  };
}

const period = (s: string | null): [number, number] | null => {
  const m = s?.match(/^(\d{4})-(\d{4})$/);
  return m && +m[1] <= +m[2] ? [+m[1], +m[2]] : null;
};

/** Parse the URL; anything invalid silently falls back to defaults. */
export function fromURL(lastYearOf: (ds: string) => number, districts: Set<string>): State {
  const q = new URLSearchParams(location.search);
  const ds = datasets.some((d) => d.slug === q.get('dataset')) ? q.get('dataset')! : 'temperature';
  const s = defaults(ds, lastYearOf(ds));
  const m = q.get('metric');
  if (m && metricsOf(ds).some((x) => x.id === m)) s.metric = m;
  const v = q.get('view');
  if (v === 'year' || v === 'decade' || v === 'change') s.view = v;
  if (metricById(s.metric).breaks === 'categorical') s.view = 'year';
  const y = Number(q.get('year'));
  if (y >= 1951 && y <= lastYearOf(ds)) s.year = y;
  s.a = period(q.get('a')) ?? s.a;
  s.b = period(q.get('b')) ?? s.b;
  const d = q.get('district');
  if (d && districts.has(d)) s.district = d;
  s.compare = (q.get('compare') ?? '').split(',').filter((c) => districts.has(c) && c !== s.district).slice(0, 3);
  if (q.get('classes') === 'equal') s.classes = 'equal';
  s.sketch = q.get('sketch') === '1';
  s.table = q.get('table') === '1';
  return s;
}

export function toURL(s: State) {
  const q = new URLSearchParams();
  q.set('dataset', s.dataset); q.set('metric', s.metric); q.set('view', s.view);
  if (s.view === 'change') { q.set('a', s.a.join('-')); q.set('b', s.b.join('-')); } else q.set('year', String(s.year));
  if (s.district) q.set('district', s.district);
  if (s.compare.length) q.set('compare', s.compare.join(','));
  if (s.classes !== 'quantile') q.set('classes', s.classes);
  if (s.sketch) q.set('sketch', '1');
  if (s.table) q.set('table', '1');
  history.replaceState(null, '', `${location.pathname}?${q}`);
}
