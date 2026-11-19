// LeaderLine: dashed 1px ink line with an open-circle end, from a MarginNote to
// the element it annotates. Positioned from geometry, recalculated on resize.
// Hidden below 900px (CSS), where notes sit inline instead.

const NS = 'http://www.w3.org/2000/svg';

type Side = 'left' | 'right' | 'top' | 'bottom' | 'center';

function anchor(r: DOMRect, side: Side, sx: number, sy: number): [number, number] {
  switch (side) {
    case 'left': return [r.left + sx, r.top + r.height / 2 + sy];
    case 'right': return [r.right + sx, r.top + r.height / 2 + sy];
    case 'top': return [r.left + r.width / 2 + sx, r.top + sy];
    case 'bottom': return [r.left + r.width / 2 + sx, r.bottom + sy];
    default: return [r.left + r.width / 2 + sx, r.top + r.height / 2 + sy];
  }
}

export function drawLeaders(root: ParentNode = document) {
  const notes = Array.from(root.querySelectorAll<HTMLElement>('[data-leader-to]')).filter((n) => n.dataset.leaderTo);
  let svg = document.getElementById('leader-layer') as SVGSVGElement | null;
  if (!svg) {
    svg = document.createElementNS(NS, 'svg') as SVGSVGElement;
    svg.id = 'leader-layer';
    svg.setAttribute('aria-hidden', 'true');
    document.body.appendChild(svg);
  }
  const W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight;
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.replaceChildren();
  if (innerWidth < 900) return;
  const sx = scrollX, sy = scrollY;
  for (const note of notes) {
    const target = document.getElementById(note.dataset.leaderTo!);
    if (!target || note.offsetParent === null || target.getClientRects().length === 0) continue;
    if (note.closest('[data-leaders-off]')) continue;
    const nr = note.getBoundingClientRect(), tr = target.getBoundingClientRect();
    const tc = [tr.left + tr.width / 2, tr.top + tr.height / 2];
    const nc = [nr.left + nr.width / 2, nr.top + nr.height / 2];
    const horizontal = tc[0] > nr.right || tc[0] < nr.left;
    const path = document.createElementNS(NS, 'path');
    let x2: number, y2: number;
    if (horizontal) {
      // Route: out of the note's first line, along the gutter beside the
      // annotated block, then under the target's line of text to the target.
      const right = tc[0] > nc[0];
      const block = (target.closest('p, li, figure, svg, h1, h2, h3, [data-leader-block]') as Element | null) ?? target;
      const br = block.getBoundingClientRect();
      const x1 = (right ? nr.right + 8 : nr.left - 8) + sx;
      const y1 = nr.top + 12 + sy;
      let gx = right ? Math.max(br.left - 14, nr.right + 16) : Math.min(br.right + 14, nr.left - 16);
      gx += sx;
      const at = (note.dataset.leaderAt as Side) || 'bottom';
      [x2, y2] = at === 'bottom' ? [tc[0] + sx, tr.bottom + 3 + sy] : anchor(tr, at, sx, sy);
      path.setAttribute('d', `M${x1},${y1} H${gx} V${y2} H${x2}`);
    } else {
      // note directly above or below: straight drop
      const below = tc[1] > nc[1];
      const x1 = Math.min(Math.max(tc[0], nr.left + 12), nr.right - 12) + sx;
      const y1 = (below ? nr.bottom + 8 : nr.top - 8) + sy;
      [x2, y2] = [tc[0] + sx, (below ? tr.top - 3 : tr.bottom + 3) + sy];
      path.setAttribute('d', `M${x1},${y1} V${(y1 + y2) / 2} H${x2} V${y2}`);
    }
    path.setAttribute('class', 'leader');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', String(x2)); dot.setAttribute('cy', String(y2)); dot.setAttribute('r', '3');
    dot.setAttribute('class', 'leader-end');
    if (note.closest('.ground-ink')) { path.classList.add('leader--inv'); dot.classList.add('leader--inv'); }
    svg.append(path, dot);
  }
}

export function initLeaders() {
  let raf = 0;
  const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => drawLeaders()); };
  redraw();
  addEventListener('resize', redraw);
  addEventListener('load', redraw);
  document.fonts?.ready.then(redraw);
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(document.body);
  (window as any).__redrawLeaders = redraw;
}
