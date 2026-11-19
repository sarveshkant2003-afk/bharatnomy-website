// TrendChart as a pure SVG-string renderer, so the same code draws the chart
// at build time (dataset pages, kit) and in the browser (Atlas panel).
import { scaleLinear } from 'd3-scale';
import { line as d3line, curveLinear } from 'd3-shape';
import { extent, ticks } from 'd3-array';

export interface TrendSeries {
  label: string;
  values: (number | null)[];
  /** 'ink' main line, 'accent' pen line, or a dash pattern for compares */
  style?: 'ink' | 'accent' | 'faint';
  dash?: string;
  color?: string;
}

export interface TrendOpts {
  years: number[];
  series: TrendSeries[];
  width?: number;
  height?: number;
  unit?: string;
  decimals?: number;
  baseline?: [number, number];   // shaded normal period
  highlight?: number;            // marked year
  rolling?: number;              // rolling mean window (applied to series[0])
  zeroLine?: boolean;
  title?: string;                // accessible title
  desc?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export function rollingMean(v: (number | null)[], w: number): (number | null)[] {
  return v.map((_, i) => {
    if (i < w - 1) return null;
    const win = v.slice(i - w + 1, i + 1).filter((x): x is number => x != null);
    return win.length === w ? win.reduce((a, b) => a + b, 0) / w : null;
  });
}

export function renderTrend(o: TrendOpts): string {
  const W = o.width ?? 560, H = o.height ?? 220;
  const m = { t: 24, r: 12, b: 26, l: 40 };
  const years = o.years;
  const all = o.series.flatMap((s) => s.values).filter((v): v is number => v != null);
  let [lo, hi] = extent(all) as [number, number];
  if (o.zeroLine) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const padY = (hi - lo) * 0.08 || 1;
  const x = scaleLinear().domain([years[0], years[years.length - 1]]).range([m.l, W - m.r]);
  const y0 = lo >= 0 && lo - padY < 0 ? 0 : lo - padY;   // counts never go below zero
  const y = scaleLinear().domain([y0, hi + padY]).range([H - m.b, m.t]).nice(4);
  const d = o.decimals ?? 0;
  const yt = y.ticks(4);
  const xt = ticks(Math.ceil(years[0] / 10) * 10, Math.floor(years[years.length - 1] / 10) * 10, 8).filter((t) => t % 10 === 0);

  const mk = (vals: (number | null)[]) =>
    d3line<number | null>().defined((v) => v != null).x((_, i) => x(years[i])).y((v) => y(v as number)).curve(curveLinear)(vals) ?? '';

  const parts: string[] = [];
  parts.push(`<svg class="trend" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.title ?? 'Trend chart')}">`);
  if (o.desc) parts.push(`<desc>${esc(o.desc)}</desc>`);
  // baseline band
  if (o.baseline) {
    const [a, b] = o.baseline;
    parts.push(`<rect class="trend-band" x="${x(Math.max(a, years[0])).toFixed(1)}" y="${m.t}" width="${(x(Math.min(b, years[years.length - 1])) - x(Math.max(a, years[0]))).toFixed(1)}" height="${H - m.b - m.t}"/>`);
    parts.push(`<text class="trend-bandlabel" x="${(x(Math.max(a, years[0])) + 4).toFixed(1)}" y="${m.t + 10}">NORMAL ${a}–${b}</text>`);
  }
  // y grid + ticks
  for (const t of yt) {
    parts.push(`<line class="trend-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`);
    parts.push(`<text class="trend-tick" x="${m.l - 6}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end">${t.toLocaleString('en-IN', { maximumFractionDigits: Math.max(0, d) })}</text>`);
  }
  if (o.zeroLine && lo < 0 && hi > 0) parts.push(`<line class="trend-zero" x1="${m.l}" x2="${W - m.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`);
  // x ticks
  parts.push(`<line class="trend-axis" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/>`);
  for (const t of xt) {
    parts.push(`<line class="trend-axis" x1="${x(t).toFixed(1)}" x2="${x(t).toFixed(1)}" y1="${H - m.b}" y2="${H - m.b + 4}"/>`);
    parts.push(`<text class="trend-tick" x="${x(t).toFixed(1)}" y="${H - m.b + 15}" text-anchor="middle">${t}</text>`);
  }
  if (o.unit) parts.push(`<text class="trend-tick trend-unit" x="0" y="10">${esc(o.unit.toUpperCase())}</text>`);
  // highlight year
  if (o.highlight != null && years.includes(o.highlight)) {
    const hx = x(o.highlight).toFixed(1);
    parts.push(`<line class="trend-hl" x1="${hx}" x2="${hx}" y1="${m.t}" y2="${H - m.b}"/>`);
    parts.push(`<text class="trend-hllabel" x="${hx}" y="${m.t - 6}" text-anchor="end">${o.highlight}</text>`);
  }
  // series
  o.series.forEach((s, i) => {
    const cls = s.style === 'accent' ? 'trend-pen' : s.style === 'faint' ? 'trend-faint' : 'trend-ink';
    const extra = `${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}${s.color ? ` style="stroke:${s.color}"` : ''}`;
    parts.push(`<path class="${cls}" d="${mk(s.values)}"${extra}><title>${esc(s.label)}</title></path>`);
    if (i === 0 && o.rolling) parts.push(`<path class="trend-roll" d="${mk(rollingMean(s.values, o.rolling))}"><title>${o.rolling}-year rolling mean</title></path>`);
    if (i === 0 && o.highlight != null) {
      const k = years.indexOf(o.highlight);
      const v = s.values[k];
      if (v != null) parts.push(`<circle class="trend-dot" cx="${x(o.highlight).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"/>`);
    }
  });
  parts.push('</svg>');
  return parts.join('');
}
