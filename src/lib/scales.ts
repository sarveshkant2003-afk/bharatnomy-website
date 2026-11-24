// Data colour scales (DESIGN.md §2). Used at build time and in the Atlas.
import { scaleThreshold } from 'd3-scale';
import { quantile } from 'd3-array';

export const STOPS = {
  warm: ['#F6EBD3', '#F0C46E', '#E07E3C', '#B53D2C', '#6B1F1D'],
  anomaly: ['#2F5D9A', '#9DB7D5', '#EEEDE6', '#E5A07C', '#A8322A'],
  wet: ['#EEF2E6', '#BCD9C6', '#6FB0AC', '#2C7C92', '#173F5C'],
  wetdry: ['#8A5626', '#D6A86E', '#EEEDE6', '#7FC0B8', '#1E6E73'],
  // brown half of dry/wet, light to dark, for "longer dry spell = darker"
  dry: ['#F1EBDD', '#E2CDA6', '#D6A86E', '#B07B42', '#8A5626'],
  // reversed dry/wet, for changes where a bigger number is drier (longer dry spells)
  wetdry_rev: ['#1E6E73', '#7FC0B8', '#EEEDE6', '#D6A86E', '#8A5626'],
  // ordinal monsoon category: large deficient .. large excess
  category: ['#8A5626', '#D6A86E', '#EEEDE6', '#7FC0B8', '#1E6E73'],
  // CO2 and ash: paper to soot
  soot: ['#ECEAE2', '#C8C3B6', '#958E7F', '#5F594F', '#2A2723'],
  // electricity and capacity: the energy lens ochre, light to dark
  power: ['#F6EED3', '#EBCF86', '#D9A21B', '#9A7212', '#57410B'],
  // sanitation and ash use: light to deep green
  clean: ['#EFF0DD', '#C9DFAF', '#86BC7C', '#468C58', '#1F5A39'],
} as const;

export type ScaleKind = keyof typeof STOPS;
export const NO_DATA = 'url(#nodata)';

export interface Classed {
  color: (v: number | string | null) => string | null;
  /** legend entries, light to dark (or dry to wet) */
  legend: { color: string; label: string; from?: number; to?: number }[];
  breaks: number[];
}

const nice = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

/** Pretty step for symmetric diverging breaks. */
function niceStep(maxAbs: number): number {
  const raw = maxAbs / 2.5;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/**
 * Build a 5-class scale.
 * - quantile / equal: sequential metrics (values = every value currently shown)
 * - diverging-symmetric: breaks at ±step/2 and ±1.5 step around zero
 * - fixed: metric.fixed breaks (SPI), mapped to 5 colours
 * - categorical: metric.categories in order
 */
export function classify(opts: {
  kind: ScaleKind;
  breaks: string;
  values: number[];
  method?: 'quantile' | 'equal';
  decimals?: number;
  unit?: string;
  fixed?: number[];
  categories?: string[];
}): Classed {
  const stops = [...STOPS[opts.kind]];
  const d = opts.decimals ?? 0;
  const u = opts.unit === '%' ? '%' : opts.unit && opts.unit !== 'SPI' ? ` ${opts.unit}` : '';

  if (opts.breaks === 'categorical') {
    const cats = opts.categories ?? [];
    const map = new Map(cats.map((c, i) => [c, stops[i]]));
    return {
      color: (v) => (v == null ? null : map.get(String(v)) ?? null),
      legend: cats.map((c, i) => ({ color: stops[i], label: c })),
      breaks: [],
    };
  }

  const vals = opts.values.filter((v) => v != null && !Number.isNaN(v)).sort((a, b) => a - b);
  let breaks: number[];

  if (opts.breaks === 'fixed' && opts.fixed) {
    // SPI: -2,-1.5,-1 | 1,1.5,2 → 5 classes: <=-1.5, -1.5..-1, -1..1, 1..1.5, >=1.5
    // (the outermost ±2 break is shown in the legend text of the end classes)
    const f = opts.fixed;
    breaks = [f[1], f[2], f[3], f[4]];
    const s = scaleThreshold<number, string>().domain(breaks).range(stops);
    return {
      color: (v) => (v == null ? null : s(+v)),
      legend: [
        { color: stops[0], label: `below ${f[1]} (severe, extreme below ${f[0]})` },
        { color: stops[1], label: `${f[1]} to ${f[2]} (moderately dry)` },
        { color: stops[2], label: `${f[2]} to ${f[3]} (near normal)` },
        { color: stops[3], label: `${f[3]} to ${f[4]} (moderately wet)` },
        { color: stops[4], label: `above ${f[4]} (very wet, extreme above ${f[5]})` },
      ],
      breaks,
    };
  }

  if (opts.breaks === 'diverging-symmetric') {
    const maxAbs = Math.max(Math.abs(vals[0] ?? 1), Math.abs(vals[vals.length - 1] ?? 1)) || 1;
    const step = niceStep(maxAbs);
    breaks = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step];
    const s = scaleThreshold<number, string>().domain(breaks).range(stops);
    const f = (x: number) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(nice(x, 2)).toLocaleString('en-IN');
    return {
      color: (v) => (v == null ? null : s(+v)),
      legend: [
        { color: stops[0], label: `below ${f(breaks[0])}${u}`, to: breaks[0] },
        { color: stops[1], label: `${f(breaks[0])} to ${f(breaks[1])}${u}`, from: breaks[0], to: breaks[1] },
        { color: stops[2], label: `${f(breaks[1])} to ${f(breaks[2])}${u} (near zero)`, from: breaks[1], to: breaks[2] },
        { color: stops[3], label: `${f(breaks[2])} to ${f(breaks[3])}${u}`, from: breaks[2], to: breaks[3] },
        { color: stops[4], label: `above ${f(breaks[3])}${u}`, from: breaks[3] },
      ],
      breaks,
    };
  }

  // sequential
  const lo = vals[0] ?? 0, hi = vals[vals.length - 1] ?? 1;
  const n = (x: number) => x.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d });
  // Many exact zeros (e.g. CO2 of a hydro-only district): zero gets its own class
  // and the positive values share the other four, so the classes stay readable.
  const zeros = vals.filter((v) => v === 0).length;
  if (opts.method !== 'equal' && lo === 0 && zeros >= vals.length * 0.15 && zeros < vals.length) {
    const pos = vals.filter((v) => v > 0);
    const step = 10 ** -d;
    breaks = [step / 2, ...[0.25, 0.5, 0.75].map((p) => nice(quantile(pos, p) ?? step, d))];
    for (let i = 1; i < breaks.length; i++) if (breaks[i] <= breaks[i - 1]) breaks[i] = breaks[i - 1] + step;
    const sz = scaleThreshold<number, string>().domain(breaks).range(stops);
    const e = [0, pos[0], breaks[1], breaks[2], breaks[3], hi];
    return {
      color: (v) => (v == null ? null : sz(+v)),
      legend: [
        { color: stops[0], label: `0${u} (none)`, from: 0, to: 0 },
        ...[1, 2, 3, 4].map((i) => ({ color: stops[i], label: i === 4 ? `${n(e[4])}${u} or more` : `${i === 1 ? 'above 0' : n(e[i])} to under ${n(e[i + 1])}${u}`, from: e[i], to: e[i + 1] })),
      ],
      breaks,
    };
  }
  if (opts.method === 'equal') {
    const w = (hi - lo) / 5;
    breaks = [1, 2, 3, 4].map((i) => nice(lo + w * i, d));
  } else {
    breaks = [0.2, 0.4, 0.6, 0.8].map((p) => nice(quantile(vals, p) ?? lo, d));
  }
  // collapse duplicate breaks (many equal values) so classes stay ordered
  for (let i = 1; i < breaks.length; i++) if (breaks[i] <= breaks[i - 1]) breaks[i] = breaks[i - 1] + 10 ** -d;
  const s = scaleThreshold<number, string>().domain(breaks).range(stops);
  const edges = [lo, ...breaks, hi];
  return {
    color: (v) => (v == null ? null : s(+v)),
    legend: stops.map((c, i) => ({
      color: c,
      label: i === 0 ? `under ${n(edges[1])}${u}` : i === 4 ? `${n(edges[4])}${u} or more` : `${n(edges[i])} to under ${n(edges[i + 1])}${u}`,
      from: edges[i], to: edges[i + 1],
    })),
    breaks,
  };
}

/** Darkest usable stop of a scale (for compare lines etc.). */
export const darkEnd = (k: ScaleKind) => STOPS[k][4];
