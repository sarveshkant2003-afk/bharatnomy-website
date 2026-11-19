// The year ruler (MAP.md §4): a notebook ruler with mm ticks, decade labels and
// the 35-district average drawn along it as a small ink sparkline.
// role="slider": arrows ±1, Shift+arrows ±10, Home/End; drag or click anywhere.

export interface Ruler { set(year: number, series: (number | null)[] | null, years: number[], disabled?: boolean): void }

export function createRuler(root: HTMLElement, onChange: (year: number, scrubbing: boolean) => void): Ruler {
  const svg = root.querySelector<SVGSVGElement>('svg')!;
  const thumb = root.querySelector<HTMLElement>('[role="slider"]')!;
  let years: number[] = [1951, 2024], year = 2024, disabled = false;
  const W = 1000, H = 64, L = 8, R = 8;
  const x = (y: number) => L + ((y - years[0]) / (years[years.length - 1] - years[0] || 1)) * (W - L - R);

  const draw = (series: (number | null)[] | null) => {
    const parts: string[] = [`<line x1="${L}" x2="${W - R}" y1="${H - 18}" y2="${H - 18}" class="rl-base"/>`];
    for (const y of years) {
      const big = y % 10 === 0, mid = y % 5 === 0;
      parts.push(`<line x1="${x(y)}" x2="${x(y)}" y1="${H - 18}" y2="${H - 18 - (big ? 12 : mid ? 8 : 4)}" class="rl-tick"/>`);
      if (big) parts.push(`<text x="${x(y)}" y="${H - 4}" text-anchor="middle" class="rl-label">${y}</text>`);
    }
    if (series) {
      const v = series.filter((s): s is number => s != null);
      const lo = Math.min(...v), hi = Math.max(...v);
      const yy = (s: number) => 4 + (1 - (s - lo) / (hi - lo || 1)) * 22;
      const d = series.map((s, i) => (s == null ? '' : `${i && series[i - 1] != null ? 'L' : 'M'}${x(years[i]).toFixed(1)},${yy(s).toFixed(1)}`)).join('');
      parts.push(`<path d="${d}" class="rl-spark"/>`);
    }
    svg.innerHTML = parts.join('');
  };

  const place = () => {
    thumb.style.left = `${(x(year) / W) * 100}%`;
    thumb.classList.toggle('is-end', x(year) / W > 0.93);
    thumb.setAttribute('aria-valuenow', String(year));
    thumb.setAttribute('aria-valuetext', String(year));
    thumb.querySelector('span')!.textContent = String(year);
    root.classList.toggle('is-disabled', disabled);
    thumb.setAttribute('aria-disabled', String(disabled));
  };

  const fromX = (clientX: number) => {
    const r = svg.getBoundingClientRect();
    const t = ((clientX - r.left) / r.width) * W;
    const f = (t - L) / (W - L - R);
    return Math.round(years[0] + Math.max(0, Math.min(1, f)) * (years[years.length - 1] - years[0]));
  };
  const commit = (y: number, scrubbing: boolean) => {
    y = Math.max(years[0], Math.min(years[years.length - 1], y));
    if (y === year && scrubbing) return;
    year = y; place(); onChange(y, scrubbing);
  };

  let dragging = false;
  root.addEventListener('pointerdown', (e) => {
    if (disabled) return;
    dragging = true; root.setPointerCapture(e.pointerId); thumb.focus({ preventScroll: true });
    commit(fromX(e.clientX), true);
  });
  root.addEventListener('pointermove', (e) => { if (dragging) commit(fromX(e.clientX), true); });
  const end = () => { if (dragging) { dragging = false; onChange(year, false); } };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  thumb.addEventListener('keydown', (e) => {
    if (disabled) return;
    const step = e.shiftKey ? 10 : 1;
    const map: Record<string, number> = { ArrowLeft: year - step, ArrowDown: year - step, ArrowRight: year + step, ArrowUp: year + step, Home: years[0], End: years[years.length - 1], PageDown: year - 10, PageUp: year + 10 };
    if (e.key in map) { e.preventDefault(); commit(map[e.key], false); }
  });

  return {
    set(y, series, ys, dis = false) {
      const changed = ys[0] !== years[0] || ys[ys.length - 1] !== years[years.length - 1];
      years = ys; year = y; disabled = dis;
      thumb.setAttribute('aria-valuemin', String(ys[0]));
      thumb.setAttribute('aria-valuemax', String(ys[ys.length - 1]));
      draw(series);
      if (changed) { /* redrawn above */ }
      place();
    },
  };
}
