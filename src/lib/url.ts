// Every internal URL goes through u(), so the site works at a sub-path
// (GitHub Pages: /bharatnomy-website/) or at a domain root, set by BASE_PATH.
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export const u = (p: string): string => (/^(https?:|mailto:|#|data:)/.test(p) ? p : BASE + (p.startsWith('/') ? p : `/${p}`));
export const base = BASE;
