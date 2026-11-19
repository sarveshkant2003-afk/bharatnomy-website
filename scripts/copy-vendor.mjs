// Copies MapLibre's self-contained worker into public/ so the Atlas can load it
// from a fixed URL (runs automatically before `npm run dev` and `npm run build`).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const out = path.join(root, 'public', 'maplibre');
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(src, path.join(out, 'maplibre-gl-worker.mjs'));
console.log('copied maplibre-gl-worker.mjs → public/maplibre/');
