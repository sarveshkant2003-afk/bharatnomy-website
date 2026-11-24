// Lazy, cached metric files and the three views (year, decade average, change).
import { classify, type Classed } from '../../lib/scales';
import { u } from '../../lib/url';
import { type Metric, type State, baselineOf } from './state';

export interface MetricFile {
  metric: string; dataset: string; unit: string; years: number[];
  values: Record<string, (number | string | null)[]>;
  state_mean: (number | null)[] | null; domain: (number | string)[]; source: string;
}
export interface District { lgd: string; name: string; census2011: string; cx: number; cy: number }

const cache = new Map<string, Promise<MetricFile>>();
export function loadMetric(ds: string, id: string): Promise<MetricFile> {
  const k = `${ds}/${id}`;
  if (!cache.has(k)) cache.set(k, fetch(u(`/data/${k}.json`)).then((r) => { if (!r.ok) throw new Error(k); return r.json(); }));
  return cache.get(k)!;
}

const mean = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const between = (f: MetricFile, lgd: string, a: number, b: number) => mean(f.years.map((y, i) => (y >= a && y <= b ? (f.values[lgd]?.[i] as number) : null)));

export function decadeOf(year: number, f: MetricFile): [number, number] {
  const s = Math.floor(year / 10) * 10;
  return [Math.max(s, f.years[0]), Math.min(s + 9, f.years[f.years.length - 1])];
}
export function decadeLabel(year: number, f: MetricFile) {
  const [a, b] = decadeOf(year, f);
  return b - a === 9 ? `${a}s` : `${a}–${b} · partial`;
}

/** Values currently on the map, keyed by LGD code. */
export function viewValues(f: MetricFile, s: State): Record<string, number | string | null> {
  const out: Record<string, number | string | null> = {};
  const yi = f.years.indexOf(s.year);
  for (const lgd of Object.keys(f.values)) {
    if (s.view === 'year') out[lgd] = yi < 0 ? null : f.values[lgd][yi];
    else if (s.view === 'decade') { const [a, b] = decadeOf(s.year, f); out[lgd] = between(f, lgd, a, b); }
    else { const A = between(f, lgd, s.a[0], s.a[1]), B = between(f, lgd, s.b[0], s.b[1]); out[lgd] = A == null || B == null ? null : B - A; }
  }
  return out;
}

export function baselineMean(f: MetricFile, lgd: string, ds: string) {
  const bl = baselineOf(ds);
  return bl ? between(f, lgd, bl[0], bl[1]) : null;
}

/** The record's year nearest to y (records with gaps, e.g. two snapshot dates). */
export function nearestYear(f: MetricFile, y: number): number {
  return f.years.reduce((best, x) => (Math.abs(x - y) < Math.abs(best - y) ? x : best), f.years[0]);
}

/** Colour classes. Year/decade use every value in the record, so colours mean
 *  the same thing in every year; change is symmetric around zero. */
export function scaleFor(f: MetricFile, m: Metric, s: State, shown: Record<string, number | string | null>): Classed & { unit: string } {
  if (s.view === 'change') {
    // red = more heat or more CO2; teal = wetter or more villages covered
    const kind = m.dataset === 'rainfall' ? (m.id === 'monsoon_longest_dry_spell_days' ? 'wetdry_rev' : 'wetdry')
      : m.dataset === 'odf-plus' || m.id.startsWith('ash_utilization') ? 'wetdry' : 'anomaly';
    const unit = m.unit === '%' ? 'pts' : m.unit;
    return { ...classify({ kind: kind as any, breaks: 'diverging-symmetric', values: Object.values(shown) as number[], decimals: m.decimals, unit }), unit };
  }
  const all = m.breaks === 'categorical' ? [] : (Object.values(f.values).flat().filter((v) => typeof v === 'number') as number[]);
  return { ...classify({ kind: m.scale as any, breaks: m.breaks, values: all, method: s.classes, decimals: m.decimals, unit: m.unit, fixed: m.fixed, categories: m.categories }), unit: m.unit };
}
