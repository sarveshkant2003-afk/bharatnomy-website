// Home page runtime: the folio, and the Chapter III signature move.
// Reads each act's --sc-p (published by the ScrollCraft engine) and never
// writes layout properties: opacity, transform and a clip rect only.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------- folio ---- */
const folio = document.querySelector<HTMLElement>('[data-folio]');
if (folio && 'IntersectionObserver' in window) {
  const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) folio.textContent = `BN-000 · ${(e.target as HTMLElement).dataset.chapter}`;
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach((c) => io.observe(c));
}

/* ------------------------------------------------- the hand-shaded census */
// Three layers share one pinned act: temperature and rainfall by decade, air
// quality by year. The buttons swap which layer the scroll position (and the
// slider) drives; the power plant dots sit on top of every layer.
interface PenMeta { years: number[]; mean: (number | null)[]; x0: number; x1: number; y0: number; y1: number; top: number; bottom: number }
interface LayerClient {
  id: string; sliderLabel: string; aria: string;
  frames: { label: string; first: number; last: number }[];
  colors: Record<string, string[]>;
  tally: Record<string, { name: string; a: number | null; b: number | null }>;
  labA: string; labB: string; unit: string; signed: boolean;
  pen: PenMeta;
}

const census = document.querySelector<HTMLElement>('[data-census]');
const act = census?.closest<HTMLElement>('[data-sc-act]');

if (census && act) {
  const layers = JSON.parse(census.dataset.layers!) as LayerClient[];
  const plantCards = JSON.parse(census.dataset.plantCards!) as string[];
  const fills = Array.from(census.querySelectorAll<SVGPathElement>('.census-fill path'));
  const slider = census.querySelector<HTMLInputElement>('[data-slider]')!;
  const sliderLabel = census.querySelector<HTMLElement>('[data-slider-label]')!;
  const label = census.querySelector<HTMLElement>('[data-decade]')!;
  const mapSvg = census.querySelector<SVGSVGElement>('[data-map-svg]')!;
  const buttons = Array.from(census.querySelectorAll<HTMLButtonElement>('[data-layer-btn]'));
  const titles = Array.from(document.querySelectorAll<HTMLElement>('[data-layer-title]'));
  const byLayer = (attr: string) => Array.from(document.querySelectorAll<HTMLElement | SVGElement>(`[${attr}]`));
  const swaps = ['data-layer', 'data-layer-ticks', 'data-layer-legend', 'data-layer-lines', 'data-layer-pen'];
  const P0 = 0.12, P1 = 0.9;           // silence before P0; last frame holds after P1
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  // per-layer handles, resolved once
  const ctx = layers.map((L) => {
    const layerG = census.querySelector<SVGGElement>(`.census-layer[data-layer="${L.id}"]`)!;
    const penBox = census.querySelector<HTMLElement>(`[data-layer-pen="${L.id}"]`)!;
    const p = L.pen;
    const yr0 = p.years[0], yrN = p.years[p.years.length - 1];
    return {
      L,
      groups: Array.from(layerG.querySelectorAll<SVGGElement>('.census-frame')),
      clip: penBox.querySelector<SVGRectElement>('[data-pen-clip]')!,
      nib: penBox.querySelector<SVGGElement>('[data-pen-nib]')!,
      yr0,
      px: (yr: number) => p.x0 + ((yr - yr0) / (yrN - yr0 || 1)) * (p.x1 - p.x0),
      py: (v: number) => p.bottom - ((v - p.y0) / (p.y1 - p.y0)) * (p.bottom - p.top),
      meanAt: (yr: number) => {
        const i = Math.max(0, Math.min(p.years.length - 1, yr - yr0));
        const lo = Math.floor(i), hi = Math.min(p.years.length - 1, lo + 1), t = i - lo;
        return (p.mean[lo] ?? 0) * (1 - t) + (p.mean[hi] ?? 0) * t;
      },
    };
  });

  let cur = ctx[0];
  let shownK = -2;
  let last = -1;
  let lastP = 0;

  const render = (p: number) => {
    lastP = p;
    if (Math.abs(p - last) < 0.0005) return;
    last = p;
    const { L, groups, clip, nib } = cur;
    const frames = L.frames, n = frames.length;
    const pos = clamp((p - P0) / (P1 - P0)) * n;          // 0..n
    groups.forEach((g, i) => {
      const fadeIn = clamp((pos - i) * 4);
      const fadeOut = i < n - 1 ? clamp((i + 1.25 - pos) * 4) : 1;
      g.style.opacity = String(Math.min(fadeIn, fadeOut));
    });
    const k = Math.min(n - 1, Math.floor(pos));
    const txt = pos < 0.02 ? '' : frames[k].label;
    if (label.textContent !== txt) label.textContent = txt;
    // colour follows the frame on show (fill transition in CSS); silence = unfilled
    const ck = pos < 0.02 ? -1 : k;
    if (ck !== shownK) {
      shownK = ck;
      fills.forEach((f) => { f.style.fill = ck < 0 ? 'transparent' : L.colors[f.dataset.lgd!][ck]; });
      if (ck >= 0 && document.activeElement !== slider) slider.value = String(ck);
      slider.setAttribute('aria-valuetext', ck < 0 ? frames[0].label : frames[ck].label);
    }
    // pen reaches the end of the frame on show, easing over each step
    const prevEnd = k === 0 ? cur.yr0 : frames[k - 1].last;
    const year = pos < 0.02 ? cur.yr0 : prevEnd + (frames[k].last - prevEnd) * clamp((pos - k) * 4);
    const x = cur.px(year);
    clip.setAttribute('width', String(x));
    nib.setAttribute('transform', `translate(${x.toFixed(1)} ${cur.py(cur.meanAt(year)).toFixed(1)})`);
    nib.style.opacity = pos < 0.02 ? '0' : '1';
  };

  // the slider: drives the same scroll position the frame lives at, so scroll
  // and slider never disagree. Under reduced motion it sets the frame directly.
  const posFor = (k: number) => k + 0.9;                       // frame k fully shown
  const pFor = (k: number) => P0 + (posFor(k) / cur.L.frames.length) * (P1 - P0);
  slider.addEventListener('input', () => {
    const k = +slider.value;
    if (reduce) { last = -1; render(pFor(k)); return; }
    const p = Math.min(0.995, pFor(k));
    const top = act.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: Math.round(top + p * (act.offsetHeight - innerHeight)), behavior: 'instant' as ScrollBehavior });
  });

  // layer buttons: swap which frames, colours, pen, legend and copy are live
  const setLayer = (id: string) => {
    const next = ctx.find((c) => c.L.id === id);
    if (!next || next === cur) return;
    cur = next;
    for (const attr of swaps) byLayer(attr).forEach((el) => {
      const on = el.getAttribute(attr) === id;
      if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
    titles.forEach((t) => { t.hidden = t.dataset.layerTitle !== id; });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layerBtn === id)));
    slider.max = String(cur.L.frames.length - 1);
    sliderLabel.textContent = cur.L.sliderLabel;
    mapSvg.setAttribute('aria-label', cur.L.aria);
    shownK = -2; last = -1;
    render(reduce ? 1 : lastP);
  };
  buttons.forEach((b) => b.addEventListener('click', () => setLayer(b.dataset.layerBtn!)));

  // power plant dots: on by default, one toggle
  const plantG = census.querySelector<SVGGElement>('[data-plants]')!;
  const plantLegend = census.querySelector<HTMLElement>('[data-plant-legend]')!;
  const toggle = census.querySelector<HTMLButtonElement>('[data-plants-toggle]')!;
  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(on));
    plantG.toggleAttribute('hidden', !on);
    plantLegend.toggleAttribute('hidden', !on);
  });

  if (reduce) {
    render(1);
  } else {
    let on = false, raf = 0;
    const tick = () => {
      const p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
      render(p);
      if (on) raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(tick);
    }).observe(act);
    render(0);
  }

  // pointer bonus: a tally card for the hovered district or plant (desktop only)
  const card = census.querySelector<HTMLElement>('[data-tally-card]')!;
  const mapBox = census.querySelector<HTMLElement>('.census-map')!;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const move = (ev: PointerEvent) => {
      const r = mapBox.getBoundingClientRect();
      card.style.transform = `translate(${Math.round(ev.clientX - r.left + 14)}px, ${Math.round(ev.clientY - r.top - 34)}px)`;
    };
    const f = (v: number | null) => {
      if (v == null) return cur.L.id === 'aqi' ? 'no monitor' : 'no data';
      const r = Math.round(v);
      return cur.L.signed && r > 0 ? `+${r}` : String(r);
    };
    census.querySelectorAll<SVGGElement>('.census-outline .sk-d').forEach((g) => {
      g.addEventListener('pointerenter', () => {
        const t = cur.L.tally[g.dataset.lgd!];
        if (!t) return;
        card.textContent = `${t.name.toUpperCase()} · ${cur.L.labA} ${f(t.a)} · ${cur.L.labB} ${f(t.b)} ${cur.L.unit}`;
        card.hidden = false;
        g.classList.add('is-hover');
      });
      g.addEventListener('pointermove', move);
      g.addEventListener('pointerleave', () => { card.hidden = true; g.classList.remove('is-hover'); });
    });
    plantG.querySelectorAll<SVGCircleElement>('circle').forEach((c) => {
      c.addEventListener('pointerenter', () => { card.textContent = plantCards[+c.dataset.i!]; card.hidden = false; c.classList.add('is-hover'); });
      c.addEventListener('pointermove', move);
      c.addEventListener('pointerleave', () => { card.hidden = true; c.classList.remove('is-hover'); });
    });
  }
}
