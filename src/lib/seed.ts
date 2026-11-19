// Fixed, seeded "randomness" so every tilt and wobble is identical on every load.

/** 32-bit FNV-1a hash of a string. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number | string) {
  let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fixed tilt in degrees within ±max, from a seed string. Never exactly 0 (0 if max is 0). */
export function tilt(seed: string, max = 3): number {
  const r = rng(seed)();
  const v = (r * 2 - 1) * max;
  const min = max * 0.3;
  const out = Math.abs(v) < min ? (v < 0 ? -min : min) : v;
  return Math.round(out * 10) / 10;
}
