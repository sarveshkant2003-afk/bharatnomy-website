// Page-wide behaviour: entrance rises and leader lines.
import { initLeaders } from './leaders';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Entrances: 14px rise, staggered via --d set in markup.
const rise = document.querySelectorAll<HTMLElement>('.rise');
if (reduce || !('IntersectionObserver' in window)) {
  rise.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  rise.forEach((el) => io.observe(el));
}

initLeaders();
