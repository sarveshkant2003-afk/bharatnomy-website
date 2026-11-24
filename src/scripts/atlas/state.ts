// Atlas state: one object, mirrored to the URL with replaceState (MAP.md §6).
import { METRICS } from '../../config/metrics.mjs';
import { DATASETS } from '../../config/data.mjs';

export type View = 'year' | 'decade' | 'change';
export interface Metric {
  id: string; dataset: string; label: string; short: string; unit: string; scale: string; breaks: string;
  help: string; caveat?: string; fixed?: number[]; categories?: string[]; decimals: number; higherIs?: string; lowerIs?: string; keywords?: string;
}
export interface State {
  dataset: string; metric: string; view: View; year: number;
  a: [number, number]; b: [number, number];     // change periods
  district: string | null; compare: string[];
  classes: 'quantile' | 'equal'; sketch: boolean; table: boolean;
}

export const metrics = METRICS as Metric[];
export const datasets = DATASETS as any[];
export const metricById = (id: string) => metrics.find((m) => m.id === id)!;
export const metricsOf = (ds: string) => metrics.filter((m) => m.dataset === ds);
export const datasetOf = (ds: string) => datasets.find((d) => d.slug === ds)!;
/** Normal period for trend bands and "vs normal", or null when the record has none. */
export const baselineOf = (ds: string): [number, number] | null => datasetOf(ds).baseline ?? null;
export const viewsOf = (ds: string): View[] => datasetOf(ds).views ?? ['year', 'decade', 'change'];
/** "1951–2024", or "2017-18 to 2025-26" when the labels carry their own hyphens. */
export function spanLabel(ds: string, a: number, b: number): string {
  const x = yearLabel(ds, a), y = yearLabel(ds, b);
  return a === b ? x : x.includes('-') || x.includes(' ') ? `${x} to ${y}` : `${x}–${y}`;
}
/** Display label for a year: "2017-18" for financial years, "24 Nov 2026" for snapshot dates. */
export function yearLabel(ds: string, y: number): string {
  const d = datasetOf(ds);
  return d.yearLabels?.[y] ?? (d.time === 'fy' ? `${y}-${String(y + 1).slice(2)}` : String(y));
}

export function defaults(ds = 'temperature', lastYear = 2024): State {
  const d = datasetOf(ds);
  return {
    dataset: ds, metric: d.defaultMetric, view: 'year', year: lastYear,
    a: [...(d.periods?.a ?? [1961, 1990])] as [number, number], b: [...(d.periods?.b ?? [lastYear - 29, lastYear])] as [number, number],
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
  if ((v === 'year' || v === 'decade' || v === 'change') && viewsOf(ds).includes(v)) s.view = v;
  if (metricById(s.metric).breaks === 'categorical') s.view = 'year';
  const y = Number(q.get('year'));
  if (y >= 1900 && y <= lastYearOf(ds)) s.year = y;   // snapped to a year the record has once its file loads
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
