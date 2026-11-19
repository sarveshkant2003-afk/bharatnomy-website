// Sketch view, table view, legend and the PNG export.
import { frameFor, sketchDistricts } from '../../lib/sketch';
import { fmt, signed, withUnit } from '../../lib/format';
import type { Classed } from '../../lib/scales';
import type { Metric, State } from './state';
import type { District } from './data';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export function fmtVal(v: number | string | null, m: Metric, s: State, unit: string): string {
  if (v == null) return 'no data';
  if (typeof v === 'string') return v;
  if (s.view === 'change') return `${signed(v, m.decimals)}${unit === '%' || unit === 'pts' ? ' pts' : unit && unit !== 'SPI' ? ' ' + unit : ''}`;
  const dec = s.view === 'decade' ? Math.max(1, m.decimals) : m.decimals;
  if (m.breaks === 'diverging-symmetric' || m.breaks === 'fixed') return `${signed(v, dec)}${unit === '%' ? '%' : unit && unit !== 'SPI' ? ' ' + unit : ''}`;
  return withUnit(v, unit, dec);
}

/* ------------------------------------------------------------ legend ---- */
export function renderLegend(el: HTMLElement, title: string, c: Classed, hasNoData: boolean) {
  el.innerHTML = `<p class="label legend-title">${esc(title)}</p><ul class="legend-list">${c.legend
    .map((e) => `<li><span class="legend-swatch" style="background:${e.color}"></span><span class="mono">${esc(e.label)}</span></li>`).join('')}${hasNoData ? '<li><span class="legend-swatch legend-swatch--nodata"></span><span class="mono">no data</span></li>' : ''}</ul>`;
}

/* ------------------------------------------------------- sketch view ---- */
let sketchCache: { fc: GeoJSON.FeatureCollection; frame: ReturnType<typeof frameFor> } | null = null;
export function renderSketch(el: HTMLElement, fc: GeoJSON.FeatureCollection, state: GeoJSON.FeatureCollection, shown: Record<string, number | string | null>, colors: Record<string, string | null>, selected: string | null, compare: string[], onPick: (lgd: string) => void) {
  const W = 760, H = 560;
  if (!sketchCache || sketchCache.fc !== fc) sketchCache = { fc, frame: frameFor(state, W, H, 16) };
  const nums = Object.values(shown).filter((v): v is number => typeof v === 'number').sort((a, b) => a - b);
  const range: [number, number] | undefined = nums.length ? [nums[0], nums[nums.length - 1]] : undefined;
  const vals = Object.fromEntries(Object.entries(shown).map(([k, v]) => [k, typeof v === 'number' ? (range && range[0] < 0 ? Math.abs(v) : v) : v == null ? null : 0.5]));
  const absRange: [number, number] | undefined = range ? (range[0] < 0 ? [0, Math.max(Math.abs(range[0]), Math.abs(range[1]))] : range) : undefined;
  const ds = sketchDistricts(fc, { frame: sketchCache.frame, values: vals as any, range: absRange ?? [0, 1], roughness: 0.7 });
  el.innerHTML = `<svg class="sketch sketch--color atlas-sketch-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sketch view of the current map. Hachure density and colour encode the values.">${ds.map((d) => `<g class="sk-d${d.lgd === selected ? ' is-selected' : ''}${compare.includes(d.lgd) ? ' is-compare' : ''}" data-lgd="${d.lgd}" tabindex="-1"><path class="sk-hit" d="${d.plain}" style="fill:${colors[d.lgd] ?? 'url(#sk-nodata)'}"/>${d.hatch.length ? `<path class="sk-hatch" d="${d.hatch.join(' ')}"/>` : ''}<path class="sk-line" d="${d.outline.join(' ')}"/><title>${esc(d.name)}</title></g>`).join('')}<defs><pattern id="sk-nodata" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4C535C" stroke-width="1"/></pattern></defs></svg>`;
  el.querySelectorAll<SVGGElement>('.sk-d').forEach((g) => g.addEventListener('click', () => onPick(g.dataset.lgd!)));
}

/* -------------------------------------------------------- table view ---- */
let sortKey: 'rank' | 'name' | 'value' | 'change' = 'rank', sortAsc = true;
export function renderTable(el: HTMLElement, rows: { lgd: string; name: string; value: number | string | null; change: number | null }[], m: Metric, s: State, unit: string, colors: Record<string, string | null>, baselineLabel: string, onPick: (lgd: string) => void) {
  const num = rows.filter((r) => typeof r.value === 'number') as { value: number }[];
  const maxAbs = Math.max(1e-9, ...num.map((r) => Math.abs(r.value)));
  const ranked = [...rows].sort((a, b) => (typeof b.value === 'number' ? b.value : -Infinity) - (typeof a.value === 'number' ? a.value : -Infinity));
  const rank = new Map(ranked.map((r, i) => [r.lgd, typeof r.value === 'number' ? i + 1 : null]));
  const key = (r: typeof rows[number]) => sortKey === 'name' ? r.name : sortKey === 'value' ? (typeof r.value === 'number' ? r.value : String(r.value)) : sortKey === 'change' ? (r.change ?? -Infinity) : (rank.get(r.lgd) ?? 999);
  const sorted = [...rows].sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * (sortAsc ? 1 : -1); });
  const th = (k: typeof sortKey, label: string, cls = '') => `<th scope="col" class="${cls}" ${sortKey === k ? `aria-sort="${sortAsc ? 'ascending' : 'descending'}"` : ''}><button type="button" data-k="${k}">${label}</button></th>`;
  const showChange = s.view !== 'change' && m.breaks !== 'categorical';
  el.innerHTML = `<table class="dense atlas-table"><caption class="visually-hidden">${esc(m.label)}, all districts</caption><thead><tr>${th('rank', 'Rank', 'r')}${th('name', 'District')}${th('value', s.view === 'change' ? 'Change' : 'Value', 'r')}${showChange ? th('change', `vs ${baselineLabel}`, 'r') : ''}<th scope="col">Bar</th></tr></thead><tbody>${sorted.map((r) => {
    const v = r.value;
    const w = typeof v === 'number' ? Math.round((Math.abs(v) / maxAbs) * 100) : 0;
    return `<tr${r.lgd === s.district ? ' class="is-sel"' : ''}><td class="num r">${rank.get(r.lgd) ?? '–'}</td><td><button type="button" class="linkish" data-pick="${r.lgd}">${esc(r.name)}</button></td><td class="num r">${esc(fmtVal(v, m, s, unit))}</td>${showChange ? `<td class="num r">${r.change == null ? '–' : esc(signed(r.change, m.decimals))}</td>` : ''}<td class="bar-cell"><span class="bar${typeof v === 'number' && v < 0 ? ' neg' : ''}" style="width:${w}%;background:${colors[r.lgd] ?? 'transparent'}"></span></td></tr>`;
  }).join('')}</tbody></table>`;
  el.querySelectorAll<HTMLButtonElement>('th button').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k as typeof sortKey;
    sortAsc = sortKey === k ? !sortAsc : k === 'name' || k === 'rank';
    sortKey = k;
    renderTable(el, rows, m, s, unit, colors, baselineLabel, onPick);
  }));
  el.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => b.addEventListener('click', () => onPick(b.dataset.pick!)));
}

/* -------------------------------------------------------- PNG export ---- */
export async function savePNG(canvas: HTMLCanvasElement | null, sketchSvg: SVGSVGElement | null, title: string, subtitle: string, legend: Classed, legendTitle: string, source: string) {
  const W = 1600, H = 1100, out = document.createElement('canvas');
  out.width = W; out.height = H;
  const g = out.getContext('2d')!;
  g.fillStyle = '#F2F3EF'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(22,24,28,0.05)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  let img: CanvasImageSource | null = canvas;
  if (sketchSvg) {
    const xml = new XMLSerializer().serializeToString(sketchSvg).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      .replace(/class="sk-line"/g, 'fill="none" stroke="#16181C" stroke-width="0.9"').replace(/class="sk-hatch"/g, 'fill="none" stroke="#16181C" stroke-width="0.55" opacity="0.4"');
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    await im.decode();
    img = im;
  }
  if (img) {
    const iw = (img as any).width, ih = (img as any).height;
    const box = { x: 60, y: 170, w: 1100, h: 780 };
    const k = Math.min(box.w / iw, box.h / ih);
    g.drawImage(img, box.x + (box.w - iw * k) / 2, box.y + (box.h - ih * k) / 2, iw * k, ih * k);
  }
  g.fillStyle = '#16181C';
  g.font = '800 64px "Big Shoulders Display", Archivo, sans-serif';
  g.fillText(title, 60, 100);
  g.font = '500 20px "Geist Mono", monospace';
  g.fillStyle = '#4C535C';
  g.fillText(subtitle.toUpperCase(), 60, 140);
  // legend
  let y = 220;
  g.fillStyle = '#16181C'; g.font = '500 16px "Geist Mono", monospace';
  g.fillText(legendTitle.toUpperCase(), 1200, y); y += 20;
  for (const e of legend.legend) {
    g.fillStyle = e.color; g.fillRect(1200, y, 36, 20); g.strokeStyle = '#16181C'; g.strokeRect(1200.5, y + 0.5, 36, 20);
    g.fillStyle = '#16181C'; g.font = '400 16px "Geist Mono", monospace'; g.fillText(e.label, 1250, y + 15); y += 30;
  }
  g.fillStyle = '#4C535C'; g.font = '400 14px "Geist Mono", monospace';
  const words = source.toUpperCase().split(' '); let line = '', ly = 1010;
  for (const w of words) { if (g.measureText(line + w).width > 1480) { g.fillText(line, 60, ly); ly += 22; line = ''; } line += w + ' '; }
  g.fillText(line, 60, ly);
  g.fillStyle = '#16181C'; g.font = '800 22px "Big Shoulders Display", sans-serif'; g.fillText('BHARATNOMY', W - 190, H - 30);
  const blob: Blob = await new Promise((r) => out.toBlob((b) => r(b!), 'image/png'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bharatnomy-atlas-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export { fmt, esc };
