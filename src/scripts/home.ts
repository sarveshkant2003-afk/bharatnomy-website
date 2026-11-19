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
const census = document.querySelector<HTMLElement>('[data-census]');
const act = census?.closest<HTMLElement>('[data-sc-act]');

if (census && act) {
  const frames = JSON.parse(census.dataset.frames!) as { label: string; first: number; last: number }[];
  const pen = JSON.parse(census.dataset.pen!) as { years: number[]; mean: number[]; x0: number; x1: number; y0: number; y1: number; top: number; bottom: number };
  const tally = JSON.parse(census.dataset.tally!) as Record<string, { name: string; a: number | null; b: number | null }>;
  const [labA, labB] = census.dataset.labels!.split('|');
  const groups = Array.from(census.querySelectorAll<SVGGElement>('.census-frame'));
  const colors = JSON.parse(census.dataset.colors!) as Record<string, string[]>;
  const fills = Array.from(census.querySelectorAll<SVGPathElement>('.census-fill path'));
  const slider = census.querySelector<HTMLInputElement>('[data-slider]')!;
  let shownK = -2;
  const label = census.querySelector<HTMLElement>('[data-decade]')!;
  const clip = census.querySelector<SVGRectElement>('[data-pen-clip]')!;
  const nib = census.querySelector<SVGGElement>('[data-pen-nib]')!;
  const n = frames.length;
  const P0 = 0.12, P1 = 0.9;           // silence before P0; last frame holds after P1
  const yr0 = pen.years[0], yrN = pen.years[pen.years.length - 1];
  const px = (yr: number) => pen.x0 + ((yr - yr0) / (yrN - yr0)) * (pen.x1 - pen.x0);
  const py = (v: number) => pen.bottom - ((v - pen.y0) / (pen.y1 - pen.y0)) * (pen.bottom - pen.top);
  const meanAt = (yr: number) => {
    const i = Math.max(0, Math.min(pen.years.length - 1, yr - yr0));
    const lo = Math.floor(i), hi = Math.min(pen.years.length - 1, lo + 1), t = i - lo;
    return pen.mean[lo] * (1 - t) + pen.mean[hi] * t;
  };
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  let last = -1;
  const render = (p: number) => {
    if (Math.abs(p - last) < 0.0005) return;
    last = p;
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
      fills.forEach((f) => { f.style.fill = ck < 0 ? 'transparent' : colors[f.dataset.lgd!][ck]; });
      if (ck >= 0 && document.activeElement !== slider) slider.value = String(ck);
      slider.setAttribute('aria-valuetext', ck < 0 ? frames[0].label : frames[ck].label);
    }
    // pen reaches the end of the decade on show, easing over each step
    const prevEnd = k === 0 ? yr0 : frames[k - 1].last;
    const year = pos < 0.02 ? yr0 : prevEnd + (frames[k].last - prevEnd) * clamp((pos - k) * 4);
    const x = px(year);
    clip.setAttribute('width', String(x));
    nib.setAttribute('transform', `translate(${x.toFixed(1)} ${py(meanAt(year)).toFixed(1)})`);
    nib.style.opacity = pos < 0.02 ? '0' : '1';
  };

  // the slider: drives the same scroll position the frame lives at, so scroll
  // and slider never disagree. Under reduced motion it sets the frame directly.
  const posFor = (k: number) => k + 0.9;                       // frame k fully shown
  slider.addEventListener('input', () => {
    const k = +slider.value;
    if (reduce) { last = -1; render(P0 + (posFor(k) / n) * (P1 - P0)); return; }
    const p = Math.min(0.995, P0 + (posFor(k) / n) * (P1 - P0));
    const top = act.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: Math.round(top + p * (act.offsetHeight - innerHeight)), behavior: 'instant' as ScrollBehavior });
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

  // pointer bonus: a tally card for the hovered district (desktop only)
  const card = census.querySelector<HTMLElement>('[data-tally-card]')!;
  const mapBox = census.querySelector<HTMLElement>('.census-map')!;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    census.querySelectorAll<SVGGElement>('.census-outline .sk-d').forEach((g) => {
      g.addEventListener('pointerenter', () => {
        const t = tally[g.dataset.lgd!];
        if (!t) return;
        const f = (v: number | null) => (v == null ? 'no data' : String(Math.round(v)));
        card.textContent = `${t.name.toUpperCase()} · ${labA} ${f(t.a)} · ${labB} ${f(t.b)} DAYS`;
        card.hidden = false;
        g.classList.add('is-hover');
      });
      g.addEventListener('pointermove', (ev) => {
        const r = mapBox.getBoundingClientRect();
        card.style.transform = `translate(${Math.round(ev.clientX - r.left + 14)}px, ${Math.round(ev.clientY - r.top - 34)}px)`;
      });
      g.addEventListener('pointerleave', () => { card.hidden = true; g.classList.remove('is-hover'); });
    });
  }
}
