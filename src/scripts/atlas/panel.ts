// District panel: name, LGD, readings for the period, rank, trend, compare, download.
import { renderTrend } from '../../lib/trend';
import { ordinal } from '../../lib/format';
import { STOPS } from '../../lib/scales';
import { type Metric, type State, metricById, baselineOf, datasets } from './state';
import { type MetricFile, type District, loadMetric, viewValues, decadeLabel } from './data';
import { fmtVal, esc } from './views';
import { u } from '../../lib/url';

const RELATED: Record<string, string[]> = {
  temperature: ['tmax_highest_c', 'days_tmax_40c_or_more', 'tmax_mean_anomaly_c'],
  rainfall: ['rainfall_jun_sep_mm', 'rainfall_jun_sep_departure_pct', 'rx1day_mm'],
};
export const DASHES = ['', '6 3', '2 3', '9 3 2 3'];

export function periodLabel(f: MetricFile, s: State) {
  return s.view === 'year' ? String(s.year) : s.view === 'decade' ? decadeLabel(s.year, f) : `${s.b[0]}–${s.b[1]} vs ${s.a[0]}–${s.a[1]}`;
}

export async function renderPanel(el: HTMLElement, ctx: {
  s: State; m: Metric; f: MetricFile; unit: string; shown: Record<string, number | string | null>;
  districts: District[]; byLgd: Record<string, District>; source: string;
  onCompare: (add: string | null, remove: string | null) => void; onClear: () => void;
}) {
  const { s, m, f, unit, shown, byLgd } = ctx;
  if (!s.district) {
    el.innerHTML = `<div class="panel-empty"><p class="t-lead">Select a district on the map, or search for one.</p><p class="soft">Each district panel shows the readings for the period on the map, its rank among ${ctx.districts.length}, and its full record since ${f.years[0]}.</p></div>`;
    return;
  }
  const d = byLgd[s.district];
  const v = shown[s.district];
  // rank among districts (numeric metrics)
  let rankLine = '';
  if (typeof v === 'number') {
    const sorted = Object.values(shown).filter((x): x is number => typeof x === 'number').sort((a, b) => b - a);
    const r = sorted.indexOf(v) + 1;
    const word = s.view === 'change' ? 'largest increase' : m.higherIs ?? 'highest';
    rankLine = `${ordinal(r)} ${word} of ${sorted.length}`;
  }
  // readings: the active metric plus related ones (same period)
  const rows: { label: string; value: string; note?: string }[] = [{ label: m.short, value: fmtVal(v, m, s, unit), note: rankLine.toUpperCase() }];
  if (s.view !== 'change') {
    for (const id of RELATED[m.dataset].filter((x) => x !== m.id).slice(0, 3)) {
      const rm = metricById(id);
      try {
        const rf = await loadMetric(m.dataset, id);
        rows.push({ label: rm.short, value: fmtVal(viewValues(rf, s)[s.district] ?? null, rm, s, rm.unit) });
      } catch { /* skip a related metric that failed to load */ }
    }
  }
  const period = periodLabel(f, s);

  // trend: selected + compared districts, whole record
  let chart = '';
  if (m.breaks === 'categorical') {
    const stops = STOPS.category, cats = m.categories!;
    chart = `<div class="cat-strip" role="img" aria-label="${esc(m.label)} for ${esc(d.name)}, every year">${f.years.map((y, i) => {
      const c = f.values[s.district!][i] as string | null;
      return `<span title="${y}: ${c ?? 'no data'}" style="background:${c ? stops[cats.indexOf(c)] : 'transparent'}"${y === s.year ? ' class="is-year"' : ''}></span>`;
    }).join('')}</div><p class="label soft cat-axis"><span>${f.years[0]}</span><span>${f.years[f.years.length - 1]}</span></p>`;
  } else {
    const ids = [s.district, ...s.compare];
    const dark = m.scale === 'wet' || m.scale === 'wetdry' ? STOPS.wet : m.scale === 'dry' ? STOPS.dry : STOPS.warm;
    const series = ids.map((id, i) => ({ label: byLgd[id].name, values: f.values[id] as number[], style: (i === 0 ? 'ink' : 'ink') as 'ink', dash: DASHES[i] || undefined, color: i === 0 ? undefined : dark[4 - (i - 1)] }));
    chart = renderTrend({
      years: f.years, series, width: 440, height: 200, unit, decimals: m.decimals,
      baseline: baselineOf(m.dataset), highlight: s.view === 'year' ? s.year : undefined,
      rolling: ids.length === 1 ? 10 : undefined, zeroLine: m.breaks !== 'quantile',
      title: `${m.label}, ${ids.map((i) => byLgd[i].name).join(', ')}`,
    });
  }
  const key = [s.district, ...s.compare].map((id, i) => `<li><svg width="28" height="8" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" stroke="${i === 0 ? '#16181C' : 'currentColor'}" stroke-width="1.5" stroke-dasharray="${DASHES[i]}"/></svg>${esc(byLgd[id].name)}${i > 0 ? ` <button type="button" class="chip-x" data-remove="${id}" aria-label="Remove ${esc(byLgd[id].name)} from compare">×</button>` : ''}</li>`).join('');
  const options = ctx.districts.filter((x) => x.lgd !== s.district && !s.compare.includes(x.lgd)).map((x) => `<option value="${x.lgd}">${esc(x.name)}</option>`).join('');

  el.innerHTML = `
    <div class="dp-head">
      <h2 class="display dp-name">${esc(d.name)}</h2>
      <button type="button" class="label dp-clear" data-clear>Clear</button>
    </div>
    <p class="label soft">LGD ${d.lgd} · CENSUS 2011 BOUNDARY${d.name === 'Thane' ? ' · INCLUDES PALGHAR' : ''}</p>
    <section class="panel dp-readings" aria-label="Readings"><span class="panel-plus" aria-hidden="true">+</span>
      <h3 class="label panel-title">${esc(d.name.toUpperCase())} · ${esc(period.toUpperCase())}</h3>
      <dl class="panel-rows">${rows.map((r) => `<div class="panel-row"><dt class="label soft">${esc(r.label)}</dt><dd class="panel-val num">${esc(r.value)}${r.note ? `<span class="label soft panel-note">${esc(r.note)}</span>` : ''}</dd></div>`).join('')}</dl>
    </section>
    <figure class="dp-trend">
      <p class="label">${esc(m.short)} · ${f.years[0]}–${f.years[f.years.length - 1]}</p>
      ${chart}
      <ul class="dp-key mono">${key}</ul>
      <figcaption class="source label">SOURCE: ${esc(ctx.source.toUpperCase())}${m.breaks !== 'categorical' ? ` · SHADED BAND = ${baselineOf(m.dataset).join('–')} NORMAL${s.compare.length ? '' : ' · BLUE = 10-YEAR ROLLING MEAN'}` : ''}</figcaption>
    </figure>
    <div class="dp-compare">
      <label class="label" for="dp-add">Compare with (up to 3)</label>
      <select id="dp-add" ${s.compare.length >= 3 ? 'disabled' : ''}><option value="">Add a district…</option>${options}</select>
    </div>
    <p><button type="button" class="btn" data-dl><span>Download ${esc(d.name)} rows (CSV)</span><span class="btn-arrow" aria-hidden="true">↓</span></button></p>`;

  el.querySelector<HTMLButtonElement>('[data-clear]')!.addEventListener('click', ctx.onClear);
  el.querySelector<HTMLSelectElement>('#dp-add')!.addEventListener('change', (e) => { const v = (e.target as HTMLSelectElement).value; if (v) ctx.onCompare(v, null); });
  el.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((b) => b.addEventListener('click', () => ctx.onCompare(null, b.dataset.remove!)));
  el.querySelector<HTMLButtonElement>('[data-dl]')!.addEventListener('click', () => downloadDistrict(m.dataset, s.district!, d.name));
}

const csvCache = new Map<string, Promise<string>>();
async function downloadDistrict(ds: string, lgd: string, name: string) {
  const meta = datasets.find((x) => x.slug === ds)!;
  const url = u(`/data/${ds}/${meta.folder}.csv`);
  if (!csvCache.has(url)) csvCache.set(url, fetch(url).then((r) => r.text()));
  const text = await csvCache.get(url)!;
  const lines = text.split(/\r?\n/);
  const head = lines[0].split(',');
  const col = head.indexOf('lgd_district_code');
  const rows = lines.slice(1).filter((l) => l && l.split(',')[col] === lgd);
  const blob = new Blob([[lines[0], ...rows].join('\n') + '\n'], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${meta.folder}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
