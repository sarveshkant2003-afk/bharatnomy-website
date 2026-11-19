// Atlas wiring: state → data → map, sketch, table, panel, ruler, URL.
import { type State, defaults, fromURL, toURL, metricById, metricsOf, datasets, baselineOf } from './state';
import { type District, type MetricFile, loadMetric, viewValues, scaleFor, baselineMean, decadeLabel } from './data';
import { createMap, type AtlasMap } from './map';
import { createRuler } from './ruler';
import { renderLegend, renderSketch, renderTable, savePNG, fmtVal } from './views';
import { renderPanel, periodLabel } from './panel';
import { u } from '../../lib/url';

async function boot() {
const root = document.querySelector<HTMLElement>('[data-atlas]')!;
const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 899px)');

const [districts, geo, stateGeo, stats] = await Promise.all([
  fetch(u('/data/districts.json')).then((r) => r.json()) as Promise<District[]>,
  fetch(u('/data/districts.geojson')).then((r) => r.json()),
  fetch(u('/data/state.geojson')).then((r) => r.json()),
  fetch(u('/data/stats.json')).then((r) => r.json()),
]);
const byLgd = Object.fromEntries(districts.map((d) => [d.lgd, d]));
const names = Object.fromEntries(districts.map((d) => [d.lgd, d.name]));
const centroids = Object.fromEntries(districts.map((d) => [d.lgd, [d.cx, d.cy] as [number, number]]));
const lastYear = (ds: string) => stats.datasets.find((d: any) => d.slug === ds)?.last_year ?? 2024;
const firstYear = (ds: string) => stats.datasets.find((d: any) => d.slug === ds)?.first_year ?? 1951;

let s: State = fromURL(lastYear, new Set(Object.keys(byLgd)));
let f: MetricFile;
let shown: Record<string, number | string | null> = {};
let colors: Record<string, string | null> = {};
let scale: ReturnType<typeof scaleFor>;

/* ---------------------------------------------------------- controls ---- */
function syncControls() {
  $$<HTMLButtonElement>('[data-ds]').forEach((b) => { const on = b.dataset.ds === s.dataset; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  $$<HTMLElement>('[data-metric-item]').forEach((li) => { li.hidden = li.dataset.dataset !== s.dataset; });
  $$<HTMLInputElement>('input[name="metric"]').forEach((i) => { i.checked = i.value === s.metric; });
  const cat = metricById(s.metric).breaks === 'categorical';
  $$<HTMLInputElement>('input[name="view"]').forEach((i) => { i.checked = i.value === s.view; i.disabled = cat && i.value !== 'year'; });
  $('[data-change-periods]').hidden = s.view !== 'change';
  const [fa, la] = [firstYear(s.dataset), lastYear(s.dataset)];
  $$<HTMLInputElement>('[data-period]').forEach((i) => {
    const [p, k] = i.dataset.period!.split('.'); i.min = String(fa); i.max = String(la);
    i.value = String((s as any)[p][+k]);
  });
  const div = metricById(s.metric).breaks !== 'quantile';
  $$<HTMLInputElement>('input[name="classes"]').forEach((i) => { i.checked = i.value === s.classes; i.disabled = div || s.view === 'change'; });
  $('[data-classes-note]').hidden = !(div || s.view === 'change');
  $<HTMLButtonElement>('[data-toggle="sketch"]').setAttribute('aria-pressed', String(s.sketch));
  $<HTMLButtonElement>('[data-toggle="table"]').setAttribute('aria-pressed', String(s.table));
  const m = metricById(s.metric);
  $('[data-help]').innerHTML = `<span class="label mnote-label">${m.short}</span>${m.help}${m.caveat ? ` <em>${m.caveat}</em>` : ''}`;
}

/* ------------------------------------------------------------ update ---- */
let atlas: AtlasMap;
let pending = 0;
async function update(opts: { animate?: boolean; panel?: boolean; fade?: number } = {}) {
  const ticket = ++pending;
  const m = metricById(s.metric);
  f = await loadMetric(s.dataset, s.metric);
  if (ticket !== pending) return;
  shown = viewValues(f, s);
  scale = scaleFor(f, m, s, shown);
  colors = Object.fromEntries(Object.entries(shown).map(([k, v]) => [k, v == null ? null : scale.color(v as any)]));
  atlas.setColors(colors, reduce ? 0 : opts.fade ?? (opts.animate ? 350 : 0));
  atlas.setSelection(s.district, s.compare, names, centroids);

  const period = periodLabel(f, s);
  $('[data-map-title]').textContent = s.view === 'change' ? `Change in ${m.label.replace(/ \(.*\)$/, '').toLowerCase()}` : m.label;
  $('[data-map-period]').textContent = s.view === 'decade' ? `${decadeLabel(s.year, f)} average` : period;
  const legendTitle = `${s.view === 'change' ? 'Change' : m.short}${scale.unit && scale.unit !== 'SPI' ? ' · ' + scale.unit.toUpperCase() : ''}`;
  renderLegend($('[data-legend]'), legendTitle, scale, Object.values(colors).some((c) => c == null));
  const ds = datasets.find((d) => d.slug === s.dataset)!;
  const source = `${ds.source}, ${f.years[0]}–${f.years[f.years.length - 1]} · district indices computed by Bharatnomy`;
  $('[data-source]').innerHTML = `SOURCE: ${source.toUpperCase()} · ${m.label.toUpperCase()} · ${period.toUpperCase()} · <a href="${u(`/datasets/${s.dataset}`)}">DATASET</a>`;
  ruler.set(s.year, f.state_mean, f.years, s.view === 'change');

  // views
  const showSketch = s.sketch && !s.table;
  $('[data-map]').hidden = showSketch || s.table;
  $('[data-sketch]').hidden = !showSketch;
  $('[data-table]').hidden = !s.table;
  if (showSketch) renderSketch($('[data-sketch]'), geo, stateGeo, shown, colors, s.district, s.compare, select);
  const rows = districts.map((d) => {
    const v = shown[d.lgd];
    const b = s.view !== 'change' && typeof v === 'number' ? baselineMean(f, d.lgd, s.dataset) : null;
    return { lgd: d.lgd, name: d.name, value: v, change: b == null || typeof v !== 'number' ? null : v - b };
  });
  const bl = baselineOf(s.dataset).join('–');
  if (s.table) renderTable($('[data-table]'), rows, m, s, scale.unit, colors, bl, select);
  if (root.dataset.tab === 'table') renderTable($('[data-table-m]'), rows, m, s, scale.unit, colors, bl, select);
  if (!s.table && !showSketch) requestAnimationFrame(() => atlas.resize());

  if (opts.panel !== false) await renderPanel($('[data-panel]'), {
    s, m, f, unit: scale.unit, shown, districts, byLgd, source,
    onCompare: (add, remove) => {
      if (add && !s.compare.includes(add) && s.compare.length < 3) s.compare.push(add);
      if (remove) s.compare = s.compare.filter((c) => c !== remove);
      commit({ panel: true });
    },
    onClear: () => { s.district = null; s.compare = []; commit({}); },
  });

  // screen-reader summary
  const ranked = Object.entries(shown).filter(([, v]) => typeof v === 'number').sort((a, b) => (b[1] as number) - (a[1] as number));
  const sr = ranked.length
    ? `${m.label}, ${period}. Highest: ${names[ranked[0][0]]}, ${fmtVal(ranked[0][1], m, s, scale.unit)}. Lowest: ${names[ranked[ranked.length - 1][0]]}, ${fmtVal(ranked[ranked.length - 1][1], m, s, scale.unit)}.`
    : `${m.label}, ${period}.`;
  clearTimeout((window as any).__srT);
  (window as any).__srT = setTimeout(() => { $('[data-sr]').textContent = sr; }, 400);
  toURL(s);
}

function commit(opts: { animate?: boolean; panel?: boolean } = {}) { syncControls(); update(opts); }

function select(lgd: string | null) {
  s.district = lgd;
  if (lgd) s.compare = s.compare.filter((c) => c !== lgd);
  if (lgd && mobile.matches) setTab('district');
  commit({});
}

/* ------------------------------------------------------------ events ---- */
$$<HTMLButtonElement>('[data-ds]').forEach((b) => {
  b.addEventListener('click', () => {
    if (b.dataset.ds === s.dataset) return;
    const keep = { district: s.district, compare: s.compare, view: s.view, year: s.year, sketch: s.sketch, table: s.table, classes: s.classes };
    s = { ...defaults(b.dataset.ds!, lastYear(b.dataset.ds!)), ...keep };
    s.year = Math.min(s.year, lastYear(s.dataset));
    commit({ animate: true });
  });
  b.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = $$<HTMLButtonElement>('[data-ds]'); const i = tabs.indexOf(b);
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click();
  });
});
root.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.name === 'metric') { s.metric = t.value; if (metricById(s.metric).breaks === 'categorical') s.view = 'year'; commit({ animate: true }); }
  if (t.name === 'view') { s.view = t.value as State['view']; commit({ animate: true }); }
  if (t.name === 'classes') { s.classes = t.value as State['classes']; commit({ animate: true }); }
  if (t.dataset.period) {
    const [p, k] = t.dataset.period.split('.');
    const v = Math.max(firstYear(s.dataset), Math.min(lastYear(s.dataset), Math.round(+t.value || 0)));
    const arr = [...(s as any)[p]] as [number, number]; arr[+k] = v;
    if (arr[0] > arr[1]) arr.reverse();
    (s as any)[p] = arr; commit({ animate: true });
  }
});
$$<HTMLButtonElement>('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.toggle as 'sketch' | 'table';
  s[k] = !s[k];
  if (k === 'sketch' && s.sketch) s.table = false;
  if (k === 'table' && s.table) s.sketch = false;
  commit({});
}));
$('[data-png]').addEventListener('click', () => {
  const m = metricById(s.metric);
  savePNG(s.sketch ? null : atlas.map.getCanvas(), s.sketch ? $<SVGSVGElement>('[data-sketch] svg') : null,
    $('[data-map-title]').textContent ?? m.label, `Maharashtra · ${$('[data-map-period]').textContent}`, scale,
    `${s.view === 'change' ? 'Change' : m.short}${scale.unit ? ' · ' + scale.unit : ''}`, $('[data-source]').textContent ?? '');
});

// search (native datalist: keyboard friendly)
const search = $<HTMLInputElement>('#district-search');
const pick = () => {
  const q = search.value.trim().toLowerCase();
  const d = districts.find((x) => x.name.toLowerCase() === q) ?? districts.find((x) => x.name.toLowerCase().startsWith(q));
  if (d && q) { select(d.lgd); search.value = ''; }
};
search.addEventListener('change', pick);
search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pick(); } });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !(e.target as HTMLElement).closest('input, select, textarea') && s.district) select(null);
});

// play: about four years a second; never starts on its own
const play = $<HTMLButtonElement>('[data-play]');
let timer = 0;
const PLAY_STEP = 900, PLAY_FADE = 800;
const stopPlay = () => { clearInterval(timer); timer = 0; $('[data-ruler]').classList.remove('is-playing'); play.setAttribute('aria-pressed', 'false'); play.querySelector('span')!.textContent = 'Play'; };
play.addEventListener('click', () => {
  if (timer) return stopPlay();
  if (s.view === 'change') return;
  if (s.year >= lastYear(s.dataset)) s.year = firstYear(s.dataset);
  play.setAttribute('aria-pressed', 'true'); play.querySelector('span')!.textContent = 'Pause';
  $('[data-ruler]').classList.add('is-playing');
  // one year about every 0.9 s; colours crossfade over most of each step so it reads as a glide
  timer = window.setInterval(() => {
    if (s.year >= lastYear(s.dataset)) return stopPlay();
    s.year++; update({ panel: !!s.district, fade: reduce ? 0 : PLAY_FADE });
  }, PLAY_STEP);
});

// mobile bottom sheet tabs
function setTab(t: string) {
  root.dataset.tab = t;
  $$<HTMLButtonElement>('[data-tab-btn]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tabBtn === t)));
  if (t === 'table') update({ panel: false });
}
$$<HTMLButtonElement>('[data-tab-btn]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tabBtn!)));

/* --------------------------------------------------------------- boot ---- */
const tip = $('[data-tip]');
const ruler = createRuler($('[data-ruler]'), (year, scrubbing) => {
  stopPlay();
  s.year = year;
  update({ panel: !scrubbing });
});
atlas = await createMap($('[data-map]'), geo, stateGeo, {
  onHover: (lgd, x, y) => {
    if (!lgd) { tip.hidden = true; return; }
    const m = metricById(s.metric);
    tip.textContent = `${names[lgd].toUpperCase()} · ${fmtVal(shown[lgd] ?? null, m, s, scale?.unit ?? m.unit).toUpperCase()}`;
    tip.hidden = false;
    tip.style.transform = `translate(${Math.round(x + 14)}px, ${Math.round(y - 30)}px)`;
  },
  onClick: (lgd) => select(lgd),
});
root.classList.add('is-ready');
syncControls();
await update({});

}

boot().catch((err) => {
  console.error(err);
  const el = document.querySelector('[data-atlas-error]');
  if (el) { el.removeAttribute('hidden'); }
});
