// Build-time model of the home page's Chapter III map layers: temperature,
// rainfall and air quality, plus the power plant dots. Every number here comes
// from public/data/ (written by `npm run data`). Used by Census.astro and the
// chapter copy in index.astro, so the map and the text never disagree.
import fs from 'node:fs';
import path from 'node:path';
import { decadeFrames, metricFile, stats, type DecadeFrames } from './data';
import { classify, type Classed } from './scales';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const read = <T,>(rel: string): T => {
  const f = path.join(DATA_DIR, rel);
  if (!fs.existsSync(f)) throw new Error(`Missing ${rel}. Run \`npm run data\` first.`);
  return JSON.parse(fs.readFileSync(f, 'utf8')) as T;
};

export type LayerId = 'temperature' | 'rainfall' | 'aqi';

export interface LayerFrame { label: string; tick: string; first: number; last: number; values: Record<string, number | null> }
export interface Pen {
  years: number[]; mean: (number | null)[];
  y0: number; y1: number;            // value domain
  band?: [number, number];           // shaded normal period (years)
  zero?: boolean;                    // draw a zero line
  ticks: number[];                   // x-axis year ticks
  caption: string; aria: string;
}
export interface LayerModel {
  id: LayerId; button: string; sliderLabel: string;
  frames: LayerFrame[];
  scale: Classed; legendTitle: string; nodataLabel?: string;
  hatchRange: [number, number];
  pen: Pen;
  tally: { labA: string; labB: string; iA: number; iB: number; unit: string; signed: boolean };
  mapAria: string;
}

export interface AqiFile {
  metric: string; label: string; unit: string; years: number[];
  values: Record<string, (number | null)[]>; cities: Record<string, string[][]>;
  monitored: number[]; state_mean: (number | null)[]; source: string; folder: string;
}
export interface Plant { name: string; fuel: string; mw: number; lon: number; lat: number; district: string; lgd: string; year: number | null; owner: string | null }
export interface PlantsFile { source: string; folder: string; plants: Plant[] }

export const aqiFile = (): AqiFile => read('aqi/years_city_days_aqi_above_100_pct.json');
export const plantsFile = (): PlantsFile => read('power-plants/plants.json');
const rainDecades = (): DecadeFrames => read('rainfall/decades_rainfall_jun_sep_departure_pct.json');

/** Complete decades from the 1960s, then the partial last one (same rule for temperature and rainfall). */
function decadeLayerFrames(df: DecadeFrames): LayerFrame[] {
  return df.decades
    .map((d, i) => ({ ...d, i }))
    .filter((d, k, all) => (d.complete || k === all.length - 1) && d.start >= 1960)
    .map((d) => ({
      label: d.complete ? d.label : `${d.first}–${d.last} · PARTIAL`,
      tick: d.label,
      first: d.first, last: d.last,
      values: Object.fromEntries(Object.entries(df.values).map(([k, v]) => [k, v[d.i]])),
    }));
}

const flat = (frames: LayerFrame[]) => frames.flatMap((f) => Object.values(f.values)).filter((v): v is number => v != null).sort((a, b) => a - b);
const q = (all: number[], p: number) => all[Math.round((all.length - 1) * p)];
const decadeTicks = (years: number[]) => years.filter((y) => y % 10 === 0);

// Fuel colours for the plant dots, drawn from the site palette (lens colours and
// data stops). Order = legend order.
export const FUELS: { id: string; label: string; color: string }[] = [
  { id: 'Coal', label: 'Coal', color: '#16181C' },
  { id: 'Gas', label: 'Gas', color: '#3F5F8F' },
  { id: 'Oil', label: 'Oil', color: '#8A5626' },
  { id: 'Nuclear', label: 'Nuclear', color: '#A9432F' },
  { id: 'Hydro', label: 'Hydro', color: '#2C7C92' },
  { id: 'Solar', label: 'Solar', color: '#D9A21B' },
  { id: 'Wind', label: 'Wind', color: '#7FC0B8' },
  { id: 'Biomass', label: 'Biomass', color: '#4A7556' },
];
/** Dot radius in SVG units (640-wide map): area grows with capacity. */
// small plants stay small so clusters read as texture; the big stations stand out
export const plantRadius = (mw: number) => +(mw < 10 ? 1.7 : 2.2 + 0.1 * Math.sqrt(mw)).toFixed(2);

let _layers: LayerModel[] | undefined;
export function homeLayers(): LayerModel[] {
  if (_layers) return _layers;
  const s = stats();

  // ---------------------------------------------------------- temperature
  const tf = decadeLayerFrames(decadeFrames());
  const tAll = flat(tf);
  const tm = metricFile('temperature', 'days_tmax_above_p90');
  const tMax = Math.max(...(tm.state_mean as number[]));
  const temperature: LayerModel = {
    id: 'temperature', button: 'Temperature', sliderLabel: 'Decade',
    frames: tf,
    scale: classify({ kind: 'warm', breaks: 'quantile', values: tAll, decimals: 0, unit: 'days' }),
    legendTitle: 'Unusually hot days a year · decade average',
    hatchRange: [q(tAll, 0.05), q(tAll, 0.95)],
    pen: {
      years: tm.years, mean: tm.state_mean!, y0: 0, y1: tMax * 1.08, band: [1991, 2020], ticks: decadeTicks(tm.years),
      caption: 'Days a year above the 1991–2020 90th percentile · 35-district average · shaded band = 1991–2020 normal',
      aria: `Unusually hot days, 35-district average, ${tm.years[0]} to ${tm.years[tm.years.length - 1]}.`,
    },
    tally: { labA: s.decade_first, labB: s.decade_last, iA: tf.findIndex((f) => f.label === s.decade_first), iB: tf.findIndex((f) => f.label === s.decade_last), unit: 'DAYS', signed: false },
    mapAria: `Maharashtra's districts shaded by unusually hot days, decade by decade from ${tf[0].label} to ${tf[tf.length - 1].label}. Darker colour and denser shading mean more hot days.`,
  };

  // ------------------------------------------------------------- rainfall
  const rf = decadeLayerFrames(rainDecades());
  const rAll = flat(rf);
  const rm = metricFile('rainfall', 'rainfall_jun_sep_departure_pct');
  const rMean = rm.state_mean!.filter((v): v is number => v != null);
  const rAbs = Math.max(...rMean.map(Math.abs)) * 1.1;
  const rComplete = rf.filter((f) => !f.label.includes('PARTIAL'));
  const rainfall: LayerModel = {
    id: 'rainfall', button: 'Rainfall', sliderLabel: 'Decade',
    frames: rf,
    scale: classify({ kind: 'wetdry', breaks: 'diverging-symmetric', values: rAll, decimals: 1, unit: '%' }),
    legendTitle: 'Monsoon rain vs 1971–2020 normal · decade average',
    hatchRange: [q(rAll, 0.05), q(rAll, 0.95)],
    pen: {
      years: rm.years, mean: rm.state_mean!, y0: -rAbs, y1: rAbs, band: [1971, 2020], zero: true, ticks: decadeTicks(rm.years),
      caption: 'June–September rainfall vs each district’s 1971–2020 average, % · 35-district average · shaded band = 1971–2020 normal',
      aria: `Monsoon rainfall departure from normal, 35-district average, ${rm.years[0]} to ${rm.years[rm.years.length - 1]}.`,
    },
    tally: { labA: rComplete[0].tick, labB: rComplete[rComplete.length - 1].tick, iA: 0, iB: rf.indexOf(rComplete[rComplete.length - 1]), unit: '%', signed: true },
    mapAria: `Maharashtra's districts coloured by monsoon rainfall against the 1971 to 2020 normal, decade by decade from ${rf[0].label} to ${rf[rf.length - 1].label}. Brown is drier than normal, teal is wetter. Denser shading means a wetter monsoon.`,
  };

  // ---------------------------------------------------------- air quality
  const a = aqiFile();
  const af: LayerFrame[] = a.years.map((y, i) => ({
    label: String(y), tick: String(y), first: y, last: y,
    values: Object.fromEntries(Object.entries(a.values).map(([k, v]) => [k, v[i]])),
  }));
  const aAll = flat(af);
  const aMax = Math.max(...(a.state_mean.filter((v) => v != null) as number[]));
  const aqi: LayerModel = {
    id: 'aqi', button: 'Air quality', sliderLabel: 'Year',
    frames: af,
    scale: classify({ kind: 'warm', breaks: 'quantile', values: aAll, decimals: 0, unit: '%' }),
    legendTitle: 'Share of monitored days with AQI above 100',
    nodataLabel: 'no monitor',
    hatchRange: [q(aAll, 0.05), q(aAll, 0.95)],
    pen: {
      years: a.years, mean: a.state_mean, y0: 0, y1: Math.min(100, aMax * 1.15), ticks: a.years,
      caption: `Share of reported days with AQI above 100, % · average of monitored districts (${a.monitored[0]} in ${a.years[0]}, ${a.monitored[a.monitored.length - 1]} in ${a.years[a.years.length - 1]})`,
      aria: `Share of days with AQI above 100, average of monitored districts, ${a.years[0]} to ${a.years[a.years.length - 1]}.`,
    },
    tally: { labA: String(a.years[0]), labB: String(a.years[a.years.length - 1]), iA: 0, iB: af.length - 1, unit: '% OF DAYS AQI OVER 100', signed: false },
    mapAria: `Maharashtra's districts coloured by the share of days with AQI above 100, year by year from ${a.years[0]} to ${a.years[a.years.length - 1]}. Districts with no monitor in the CPCB bulletin are hatched grey.`,
  };

  return (_layers = [temperature, rainfall, aqi]);
}

/** Numbers for the chapter copy (index.astro). */
export function layerFacts() {
  const L = homeLayers();
  const rain = L[1], aq = L[2];
  const avg = (f: LayerFrame) => { const v = Object.values(f.values).filter((x): x is number => x != null); return v.reduce((s, x) => s + x, 0) / v.length; };
  const rc = rain.frames.filter((f) => !f.label.includes('PARTIAL'));
  const rFirst = rc[0], rLast = rc[rc.length - 1];
  const a = aqiFile();
  const aLast = aq.frames[aq.frames.length - 1];
  const worst = Object.entries(aLast.values).filter(([, v]) => v != null).sort((x, y) => (y[1] as number) - (x[1] as number))[0];
  const p = plantsFile();
  const coal = p.plants.filter((x) => x.fuel === 'Coal');
  return {
    rain: {
      firstLabel: rFirst.tick, lastLabel: rLast.tick,
      firstAvg: Math.round(avg(rFirst)), lastAvg: Math.round(avg(rLast)),
      wetterLast: Object.values(rLast.values).filter((v) => v != null && v > 0).length,
      countLast: Object.values(rLast.values).filter((v) => v != null).length,
      decades: rc.length, firstYear: metricFile('rainfall', 'rainfall_jun_sep_departure_pct').years[0],
    },
    aqi: {
      firstYear: a.years[0], lastYear: a.years[a.years.length - 1], years: a.years.length,
      monitoredFirst: a.monitored[0], monitoredLast: a.monitored[a.monitored.length - 1],
      lastAvg: Math.round(avg(aLast)),
      worstLgd: worst[0], worstPct: Math.round(worst[1] as number),
      folder: a.folder,
    },
    plants: {
      n: p.plants.length, mw: Math.round(p.plants.reduce((s, x) => s + x.mw, 0)),
      coalN: coal.length, coalMw: Math.round(coal.reduce((s, x) => s + x.mw, 0)), folder: p.folder,
    },
  };
}
