#!/usr/bin/env node
// Builds public/data/ from the Bharatnomy front repo (MAP.md §2).
//
//   npm run data                       clone/fetch DATA_REPO at DATA_REF
//   DATA_LOCAL=../front npm run data   use a local checkout instead
//
// Fails loudly if any district does not join to the boundaries.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { csvParse } from 'd3-dsv';
import { DATA_REPO, DATA_REF, STATE, STATES_MAPPED, BOUNDARIES_PATH, DATASETS, INDIA_BOUNDARIES } from '../src/config/data.mjs';
import { METRICS } from '../src/config/metrics.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'data');
const CACHE = path.join(ROOT, '.cache', 'data-repo');
const EXPECTED_DISTRICTS = 35;

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (...a) => console.log(...a);
const fail = (msg) => { console.error(`\nDATA BUILD FAILED: ${msg}\n`); process.exit(1); };

// ------------------------------------------------------------------ 1. fetch
function getRepo() {
  if (process.env.DATA_LOCAL) {
    const dir = path.resolve(process.env.DATA_LOCAL);
    const dirty = git(['status', '--porcelain', '--', 'states'], dir);
    if (dirty) console.warn('WARNING: DATA_LOCAL has uncommitted changes under states/; the commit stamp will not describe them.');
    return { dir, sha: git(['rev-parse', 'HEAD'], dir), via: `local ${dir}` };
  }
  const sparse = [path.posix.dirname(BOUNDARIES_PATH), ...DATASETS.map((d) => d.path)];
  if (!fs.existsSync(path.join(CACHE, '.git'))) {
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    log(`cloning ${DATA_REPO} (sparse) ...`);
    git(['clone', '--filter=blob:none', '--no-checkout', '--sparse', DATA_REPO, CACHE]);
  }
  git(['sparse-checkout', 'set', ...sparse], CACHE);
  try { git(['cat-file', '-e', `${DATA_REF}^{commit}`], CACHE); }
  catch { log(`fetching ${DATA_REF.slice(0, 7)} ...`); git(['fetch', 'origin', DATA_REF], CACHE); }
  git(['checkout', '--quiet', '--detach', DATA_REF], CACHE);
  return { dir: CACHE, sha: git(['rev-parse', 'HEAD'], CACHE), via: `${DATA_REPO} @ ${DATA_REF.slice(0, 7)}` };
}

// ------------------------------------------------------------- 2. boundaries
function buildBoundaries(repoDir, datasetCodes) {
  const src = path.join(repoDir, BOUNDARIES_PATH);
  if (!fs.existsSync(src)) fail(`boundaries not found at ${BOUNDARIES_PATH}`);
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const nullGeom = raw.features.filter((f) => !f.geometry).map((f) => f.properties.district);

  const tmp = path.join(ROOT, '.cache', 'tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const inFile = path.join(tmp, 'in.geojson');
  fs.writeFileSync(inFile, JSON.stringify({
    type: 'FeatureCollection',
    features: raw.features.filter((f) => f.geometry && f.properties.lgd_state_code === STATE.lgd),
  }));
  const bin = path.join(ROOT, 'node_modules', '.bin', 'mapshaper');
  const districtsOut = path.join(OUT, 'districts.geojson');
  const stateOut = path.join(OUT, 'state.geojson');
  const common = ['-i', inFile, '-proj', 'wgs84', '-simplify', '8%', 'keep-shapes', '-clean'];
  execFileSync(bin, [...common,
    '-each', 'cx=+this.centroidX.toFixed(4), cy=+this.centroidY.toFixed(4), lgd=lgd_district_code, name=district',
    '-filter-fields', 'lgd,name,cx,cy,census2011_district_code',
    '-o', districtsOut, 'format=geojson', 'precision=0.00001'], { stdio: ['ignore', 'ignore', 'pipe'] });
  execFileSync(bin, [...common, '-dissolve', '-each', `name='${STATE.name}'`,
    '-o', stateOut, 'format=geojson', 'geojson-type=FeatureCollection', 'precision=0.00001'], { stdio: ['ignore', 'ignore', 'pipe'] });

  const geo = JSON.parse(fs.readFileSync(districtsOut, 'utf8'));
  const geoCodes = new Set(geo.features.map((f) => String(f.properties.lgd)));
  const missing = [...datasetCodes].filter((c) => !geoCodes.has(c));
  if (missing.length) fail(`districts in the data with no boundary: ${missing.join(', ')}`);
  if (geo.features.length !== EXPECTED_DISTRICTS) fail(`expected ${EXPECTED_DISTRICTS} district shapes, got ${geo.features.length}`);

  const districts = geo.features
    .map((f) => ({ lgd: String(f.properties.lgd), name: f.properties.name, census2011: String(f.properties.census2011_district_code), cx: f.properties.cx, cy: f.properties.cy }))
    .sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(path.join(OUT, 'districts.json'), JSON.stringify(districts));
  return { districts, nullGeom, kb: fs.statSync(districtsOut).size / 1024, stateKb: fs.statSync(stateOut).size / 1024 };
}

// ----------------------------------------------------------- 2b. India states
function buildIndia() {
  const dir = path.join(ROOT, '.cache', 'warehouse');
  const ib = INDIA_BOUNDARIES;
  if (!fs.existsSync(path.join(dir, '.git'))) {
    log(`cloning ${ib.repo} (boundaries only) ...`);
    git(['clone', '--filter=blob:none', '--no-checkout', ib.repo, dir]);
  }
  git(['sparse-checkout', 'set', '--no-cone', `/${ib.dir}/`], dir);
  try { git(['cat-file', '-e', `${ib.ref}^{commit}`], dir); } catch { git(['fetch', 'origin', ib.ref], dir); }
  git(['checkout', '--quiet', '--detach', ib.ref], dir);
  const shp = path.join(dir, ib.dir, ib.file);
  if (!fs.existsSync(shp)) fail(`India boundaries not found at ${ib.dir}/${ib.file}`);
  const out = path.join(OUT, 'india-states.geojson');
  const bin = path.join(ROOT, 'node_modules', '.bin', 'mapshaper');
  execFileSync(bin, ['-i', shp, '-proj', 'wgs84', '-simplify', '0.6%', 'keep-shapes', '-dissolve', ib.stateField,
    '-filter', 'this.area > 5e7', '-each', `name=${ib.stateField}, mapped=${JSON.stringify(STATES_MAPPED.map((s) => s.name))}.includes(${ib.stateField})`,
    '-filter-fields', 'name,mapped',
    '-o', out, 'format=geojson', 'geojson-type=FeatureCollection', 'precision=0.001'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const fc = JSON.parse(fs.readFileSync(out, 'utf8'));
  const names = fc.features.map((f) => f.properties.name);
  for (const s of STATES_MAPPED) if (!names.includes(s.name)) fail(`state "${s.name}" not found in India boundaries`);
  return { states: names.length, kb: fs.statSync(out).size / 1024, sha: ib.ref };
}

// ------------------------------------------------------------------- helpers
const round = (v, d) => (v == null || Number.isNaN(v) ? null : Math.round(v * 10 ** d) / 10 ** d);
const mean = (xs) => { const v = xs.filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const quantile = (sorted, p) => { const i = (sorted.length - 1) * p; const lo = Math.floor(i); return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo); };
const fmt = (v, d) => v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const upper = (s) => s.toUpperCase();

// ------------------------------------------------------------------ 3. data
function loadDataset(repoDir, ds) {
  const dir = path.join(repoDir, ds.path);
  const csvFile = path.join(dir, `${ds.folder}.csv`);
  if (!fs.existsSync(csvFile)) fail(`${ds.slug}: CSV not found at ${ds.path}`);
  const text = fs.readFileSync(csvFile, 'utf8');
  const rows = csvParse(text);
  const cols = rows.columns;
  const metrics = METRICS.filter((m) => m.dataset === ds.slug);
  const absent = metrics.filter((m) => !cols.includes(m.id)).map((m) => m.id);
  if (absent.length) fail(`${ds.slug}: registry columns missing from CSV: ${absent.join(', ')}`);
  const stateRows = rows.filter((r) => r.lgd_state_code === STATE.lgd);
  const years = [...new Set(stateRows.map((r) => +r.year))].sort((a, b) => a - b);
  const codes = [...new Set(stateRows.map((r) => r.lgd_district_code))].sort();
  const names = Object.fromEntries(stateRows.map((r) => [r.lgd_district_code, r.district]));
  return { ds, dir, rows: stateRows, cols, years, codes, names, metrics, csvText: text };
}

function writeDataset(d, dataStamp) {
  const outDir = path.join(OUT, d.ds.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const yi = new Map(d.years.map((y, i) => [y, i]));
  const report = [];
  const files = {};

  for (const m of d.metrics) {
    const isCat = m.breaks === 'categorical';
    const values = Object.fromEntries(d.codes.map((c) => [c, Array(d.years.length).fill(null)]));
    let nulls = 0;
    for (const r of d.rows) {
      const raw = r[m.id];
      const v = raw === '' || raw == null ? null : isCat ? raw : +raw;
      if (v == null || (!isCat && Number.isNaN(v))) { nulls++; continue; }
      values[r.lgd_district_code][yi.get(+r.year)] = v;
    }
    if (isCat) {
      const unknown = [...new Set(Object.values(values).flat().filter((v) => v != null && !m.categories.includes(v)))];
      if (unknown.length) fail(`${m.id}: categories not in registry: ${unknown.join(', ')}`);
    }
    const all = isCat ? [] : Object.values(values).flat().filter((v) => v != null).sort((a, b) => a - b);
    const out = {
      metric: m.id, dataset: d.ds.slug, label: m.label, unit: m.unit,
      years: d.years, values,
      state_mean: isCat ? null : d.years.map((_, i) => round(mean(d.codes.map((c) => values[c][i])), m.decimals + 1)),
      domain: isCat ? m.categories : [all[0], all[all.length - 1]],
      p05_p95: isCat ? null : [round(quantile(all, 0.05), 3), round(quantile(all, 0.95), 3)],
      source: `${d.ds.source}, ${d.years[0]}–${d.years[d.years.length - 1]}. District indices computed by Bharatnomy.`,
      updated: dataStamp.date,
    };
    const f = path.join(outDir, `${m.id}.json`);
    fs.writeFileSync(f, JSON.stringify(out));
    files[m.id] = values;
    report.push({ metric: m.id, nulls, kb: (fs.statSync(f).size / 1024).toFixed(1) });
  }

  // Downloads: original CSV, README, full JSON (array of row objects).
  fs.writeFileSync(path.join(outDir, `${d.ds.folder}.csv`), d.csvText);
  fs.copyFileSync(path.join(d.dir, 'README.md'), path.join(outDir, 'README.md'));
  const typed = d.rows.map((r) => Object.fromEntries(d.cols.map((c) => {
    const v = r[c];
    if (['state_ut', 'lgd_state_code', 'district', 'lgd_district_code', 'year', 'decade', 'monsoon_category', 'monsoon_drought_class'].includes(c)) return [c, v];
    return [c, v === '' ? null : +v];
  })));
  fs.writeFileSync(path.join(outDir, `${d.ds.folder}.json`), JSON.stringify(typed));
  // Per-district rows for the Atlas "download this district" button are cut
  // client-side from the full CSV, so no extra files here.
  return { report, files };
}

// ------------------------------------------------- decade frames (home peak)
function decadeFrames(temp, metricId) {
  const vals = {};
  const decades = [];
  for (let start = Math.floor(temp.years[0] / 10) * 10; start <= temp.years[temp.years.length - 1]; start += 10) {
    const ys = temp.years.filter((y) => y >= start && y < start + 10);
    decades.push({ label: `${start}s`, start, first: ys[0], last: ys[ys.length - 1], years: ys.length, complete: ys.length === 10 });
  }
  for (const c of temp.codes) {
    vals[c] = decades.map((dec) => {
      const v = temp.rows.filter((r) => r.lgd_district_code === c && +r.year >= dec.first && +r.year <= dec.last).map((r) => +r[metricId]);
      return round(mean(v), 2);
    });
  }
  return { metric: metricId, decades, values: vals };
}

// ------------------------------------------------------------ stats + ticker
function buildStats(temp, rain, frames, districts, stamp) {
  const name = Object.fromEntries(districts.map((d) => [d.lgd, d.name]));
  const complete = frames.decades.map((d, i) => ({ ...d, i })).filter((d) => d.complete);
  const first = complete[0], last = complete[complete.length - 1];
  const avgOver = (i) => mean(temp.codes.map((c) => frames.values[c][i]));
  const change = temp.codes.map((c) => ({ c, d: frames.values[c][last.i] - frames.values[c][first.i] })).sort((a, b) => b.d - a.d);

  const tY = temp.years[temp.years.length - 1];
  const rY = rain.years[rain.years.length - 1];
  const at = (d, y) => d.rows.filter((r) => +r.year === y);
  const top = (rows, col, dir = 1) => rows.slice().sort((a, b) => dir * (+b[col] - +a[col]))[0];
  const tRows = at(temp, tY), rRows = at(rain, rY);

  const stats = {
    district_count: districts.length,
    temp_first_year: temp.years[0], temp_last_year: tY,
    temp_year_span: tY - temp.years[0] + 1,
    rain_first_year: rain.years[0], rain_last_year: rY,
    decade_first: first.label, decade_last: last.label,
    p90_days_first: Math.round(avgOver(first.i)),
    p90_days_last: Math.round(avgOver(last.i)),
    hottest_change_district: name[change[0].c],
    hottest_change_district_lgd: change[0].c,
    hottest_change_days: Math.round(change[0].d),
    districts_warmer_last_decade: change.filter((x) => x.d > 0).length,
  };

  // Ticker facts: each names a district (or says "35 districts") and a year.
  const ticker = [];
  const add = (lgd, y, text) => ticker.push({ lgd, year: y, text: `${upper(lgd ? name[lgd] : `${districts.length} DISTRICTS`)} · ${y} · ${text}` });
  let r;
  r = top(tRows, 'tmax_highest_c'); add(r.lgd_district_code, tY, `HOTTEST DAY ${fmt(+r.tmax_highest_c, 1)} °C`);
  r = top(tRows, 'days_tmax_above_p90'); add(r.lgd_district_code, tY, `${r.days_tmax_above_p90} UNUSUALLY HOT DAYS, MOST IN THE STATE`);
  r = top(tRows, 'nights_tmin_above_p90'); add(r.lgd_district_code, tY, `${r.nights_tmin_above_p90} UNUSUALLY WARM NIGHTS`);
  r = top(tRows, 'days_tmax_40c_or_more'); add(r.lgd_district_code, tY, `${r.days_tmax_40c_or_more} DAYS AT 40 °C OR MORE`);
  r = top(tRows, 'tmax_mean_anomaly_c'); add(r.lgd_district_code, tY, `AVERAGE MAXIMUM ${(+r.tmax_mean_anomaly_c >= 0 ? '+' : '')}${fmt(+r.tmax_mean_anomaly_c, 2)} °C VS 1981–2010`);
  // Monsoon: 35-district average rainfall against the 35-district average normal
  // (normal recovered from each district's departure). Unweighted; labelled so.
  const mm = mean(rRows.map((x) => +x.rainfall_jun_sep_mm));
  const normal = mean(rRows.map((x) => +x.rainfall_jun_sep_mm / (1 + +x.rainfall_jun_sep_departure_pct / 100)));
  const dep = (mm / normal - 1) * 100;
  stats.monsoon_latest_avg_departure_pct = round(dep, 1);
  add(null, rY, `MONSOON ${dep >= 0 ? '+' : ''}${fmt(dep, 0)}% VS 1971–2020 (DISTRICT AVERAGE)`);
  const deficient = rRows.filter((x) => /deficient/.test(x.monsoon_category)).length;
  const excess = rRows.filter((x) => /excess/.test(x.monsoon_category)).length;
  stats.monsoon_latest_deficient = deficient;
  stats.monsoon_latest_excess = excess;
  add(null, rY, `${deficient} DEFICIENT AND ${excess} EXCESS MONSOONS`);
  r = top(rRows, 'rx1day_mm'); add(r.lgd_district_code, rY, `WETTEST DAY ${fmt(+r.rx1day_mm, 1)} MM`);
  r = top(rRows, 'monsoon_longest_dry_spell_days'); add(r.lgd_district_code, rY, `LONGEST MONSOON DRY SPELL ${r.monsoon_longest_dry_spell_days} DAYS`);
  r = top(rRows, 'heavy_rain_days_64_5mm'); add(r.lgd_district_code, rY, `${r.heavy_rain_days_64_5mm} HEAVY RAIN DAYS`);
  r = top(rRows, 'rainfall_annual_mm'); add(r.lgd_district_code, rY, `WETTEST DISTRICT, ${fmt(+r.rainfall_annual_mm, 0)} MM IN THE YEAR`);

  // Centroid of the state (for the instrument strip on the home page).
  stats.state_centroid = [round(mean(districts.map((d) => d.cx)), 2), round(mean(districts.map((d) => d.cy)), 2)];
  stats.data = stamp;
  return { stats, ticker };
}

// ---------------------------------------------------------------------- main
const t0 = Date.now();
const repo = getRepo();
const stamp = {
  repo: DATA_REPO, commit: repo.sha, short: repo.sha.slice(0, 7),
  date: git(['show', '-s', '--format=%cs', repo.sha], repo.dir),
  built: new Date().toISOString().slice(0, 10),
};
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const loaded = DATASETS.map((ds) => loadDataset(repo.dir, ds));
const allCodes = new Set(loaded.flatMap((d) => d.codes));
const geo = buildBoundaries(repo.dir, allCodes);
const india = buildIndia();
const written = loaded.map((d) => writeDataset(d, stamp));
const temp = loaded.find((d) => d.ds.slug === 'temperature');
const rain = loaded.find((d) => d.ds.slug === 'rainfall');
const frames = decadeFrames(temp, 'days_tmax_above_p90');
fs.writeFileSync(path.join(OUT, 'temperature', 'decades_days_tmax_above_p90.json'), JSON.stringify(frames));
const { stats, ticker } = buildStats(temp, rain, frames, geo.districts, stamp);
const datasetsMeta = loaded.map((d) => ({
  ...d.ds,
  rows: d.rows.length, districts: d.codes.length, columns: d.cols.length,
  first_year: d.years[0], last_year: d.years[d.years.length - 1],
  csv_kb: Math.round(Buffer.byteLength(d.csvText) / 1024),
  json_kb: Math.round(fs.statSync(path.join(OUT, d.ds.slug, `${d.ds.folder}.json`)).size / 1024),
  metrics: d.metrics.map((m) => m.id),
}));
stats.states_mapped = STATES_MAPPED.map((s) => s.name);
stats.india_boundaries = { states_2011: india.states, commit: india.sha.slice(0, 7) };
fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify({ ...stats, ticker, datasets: datasetsMeta }, null, 2));

// -------------------------------------------------------------- 6. summary
log(`\nBharatnomy data build  (${repo.via})`);
log(`data commit ${stamp.short} (${stamp.date})\n`);
for (const d of loaded) {
  const nameMismatch = d.codes.filter((c) => geo.districts.find((x) => x.lgd === c)?.name !== d.names[c]);
  log(`${d.ds.slug.toUpperCase()}  ${d.ds.folder}`);
  log(`  rows ${d.rows.length} · districts ${d.codes.length} · years ${d.years[0]}–${d.years.at(-1)} (${d.years.length}) · columns ${d.cols.length}`);
  log(`  rows = districts × years: ${d.rows.length === d.codes.length * d.years.length ? 'yes' : 'NO'}`);
  if (nameMismatch.length) log(`  name differs from boundary file (joined on LGD, not name): ${nameMismatch.map((c) => d.names[c]).join(', ')}`);
  const w = written[loaded.indexOf(d)];
  log('  metric                              nulls   kb');
  for (const r of w.report) log(`  ${r.metric.padEnd(34)} ${String(r.nulls).padStart(5)} ${r.kb.padStart(6)}`);
  log('');
}
log(`BOUNDARIES  ${BOUNDARIES_PATH}`);
log(`  ${geo.districts.length} district shapes joined on lgd_district_code, 0 join failures`);
if (geo.nullGeom.length) log(`  dropped features with no geometry: ${geo.nullGeom.join(', ')} (data uses 2011 boundaries; Thane includes Palghar)`);
log(`  districts.geojson ${geo.kb.toFixed(0)} KB · state.geojson ${geo.stateKb.toFixed(0)} KB`);
log(`INDIA  ${india.states} state/UT outlines (Census 2011, warehouse ${india.sha.slice(0, 7)}) · india-states.geojson ${india.kb.toFixed(0)} KB\n`);
log('STATS (CONTENT.md placeholders)');
for (const [k, v] of Object.entries(stats)) if (k !== 'data') log(`  ${k.padEnd(32)} ${JSON.stringify(v)}`);
log('\nTICKER');
for (const t of ticker) log(`  ${t.text}`);
log(`\ndone in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
