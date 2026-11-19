// Build-time rough.js rendering of district geometry (DESIGN.md §5).
// Runs in Node inside .astro frontmatter; output is plain SVG path strings,
// so no rough.js ships to the browser for static sketch maps.
import rough from 'roughjs';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

const gen = rough.generator();

/** Round every number in a path string to 1 decimal (keeps inline SVG small). */
const tidy = (d: string, dec = 1) => d.replace(/-?\d+\.\d+/g, (n) => (Math.round(+n * 10 ** dec) / 10 ** dec).toString());

export interface Frame { width: number; height: number; project: (p: [number, number]) => [number, number] }

function allCoords(g: any, out: Position[] = []): Position[] {
  if (!g) return out;
  if (g.type === 'FeatureCollection') g.features.forEach((f: any) => allCoords(f.geometry, out));
  else if (g.type === 'GeometryCollection') g.geometries.forEach((x: any) => allCoords(x, out));
  else if (g.type === 'Feature') allCoords(g.geometry, out);
  else if (g.type === 'Point') out.push(g.coordinates);
  else if (g.type === 'MultiPoint' || g.type === 'LineString') out.push(...g.coordinates);
  else if (g.type === 'Polygon' || g.type === 'MultiLineString') g.coordinates.forEach((r: Position[]) => out.push(...r));
  else if (g.type === 'MultiPolygon') g.coordinates.forEach((p: Position[][]) => p.forEach((r) => out.push(...r)));
  return out;
}

export function frameFor(fc: FeatureCollection, width: number, height: number, pad = 12): Frame {
  // Fit to the coordinates as points: d3-geo is spherical and treats rings with
  // the "wrong" winding (RFC 7946 order) as the whole globe minus the shape.
  const proj = geoMercator().fitExtent([[pad, pad], [width - pad, height - pad]], { type: 'MultiPoint', coordinates: allCoords(fc) } as any);
  return { width, height, project: (p) => proj(p) as [number, number] };
}

function rings(g: Geometry): Position[][] {
  if (g.type === 'Polygon') return [g.coordinates[0]];
  if (g.type === 'MultiPolygon') return g.coordinates.map((p) => p[0]);
  return [];
}

export interface SketchedDistrict {
  lgd: string; name: string; x: number; y: number;
  outline: string[]; hatch: string[]; plain: string;
}

export interface SketchOpts {
  frame: Frame;
  /** value per lgd; districts without a value get outline only */
  values?: Record<string, number | null>;
  /** value range mapped to hachure gap (sparse at lo, dense at hi) */
  range?: [number, number];
  gap?: [number, number];        // [sparse, dense] px, default [14, 2.5]
  roughness?: number;
  seedSalt?: number;
  hatchWeight?: number;
}

export function hachureGap(v: number, range: [number, number], gap: [number, number] = [14, 2.5]): number {
  const t = Math.max(0, Math.min(1, (v - range[0]) / (range[1] - range[0] || 1)));
  // interpolate line density (1/gap), not gap, so darkness grows evenly with the value
  return 1 / (1 / gap[0] + (1 / gap[1] - 1 / gap[0]) * t);
}

export function sketchDistricts(fc: FeatureCollection, o: SketchOpts): SketchedDistrict[] {
  const path = geoPath();
  const out: SketchedDistrict[] = [];
  for (const f of fc.features as Feature[]) {
    const p = f.properties as { lgd: string; name: string; cx: number; cy: number };
    const seed = Number(p.lgd) + (o.seedSalt ?? 0) * 1000;
    const polys = rings(f.geometry).map((r) => r.map((c) => o.frame.project(c as [number, number])));
    if (polys.some((r) => r.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y)))) throw new Error(`sketch: non-finite projection for ${p.name}`);
    const v = o.values?.[p.lgd];
    const outline: string[] = [];
    const hatch: string[] = [];
    polys.forEach((pts, i) => {
      if (pts.length < 3) return;
      const s = seed + i * 7;
      for (const pi of gen.toPaths(gen.polygon(pts, { roughness: o.roughness ?? 0.75, bowing: 0.6, stroke: '#16181C', strokeWidth: 1, seed: s, disableMultiStroke: true }))) outline.push(tidy(pi.d));
      if (v != null && o.range) {
        const g = gen.polygon(pts, {
          stroke: 'none', fill: '#16181C', fillStyle: 'hachure', hachureAngle: -41,
          hachureGap: hachureGap(v, o.range, o.gap), fillWeight: o.hatchWeight ?? 0.7,
          roughness: 0.4, seed: s + 3, disableMultiStrokeFill: true,
        });
        for (const pi of gen.toPaths(g)) if (pi.fill === 'none' || pi.stroke !== 'none') hatch.push(tidy(pi.d, 0));
      }
    });
    const [x, y] = o.frame.project([p.cx, p.cy]);
    const plain = tidy(path({ type: 'MultiPolygon', coordinates: polys.map((r) => [r]) } as any) ?? '');
    out.push({ lgd: String(p.lgd), name: p.name, x, y, outline, hatch, plain });
  }
  return out;
}

/** Rough outlines of every feature (e.g. India's states), one path string each. */
export function sketchOutlines(fc: FeatureCollection, frame: Frame, o: { roughness?: number; seedSalt?: number } = {}) {
  return (fc.features as Feature[]).map((f, k) => {
    const props = (f.properties ?? {}) as Record<string, any>;
    const d: string[] = [];
    rings(f.geometry).forEach((r, i) => {
      const pts = r.map((c) => frame.project(c as [number, number]));
      if (pts.length < 3) return;
      for (const pi of gen.toPaths(gen.polygon(pts, { roughness: o.roughness ?? 0.6, bowing: 0.5, stroke: '#16181C', strokeWidth: 1, seed: 7000 + k * 31 + i + (o.seedSalt ?? 0), disableMultiStroke: true }))) d.push(tidy(pi.d));
    });
    return { props, d: d.join(' ') };
  });
}

/** A single rough line through points (the "pen line"). */
export function roughLine(points: [number, number][], seed: number, roughness = 0.4): string {
  return gen.toPaths(gen.curve(points, { roughness, bowing: 0.5, stroke: '#2346C7', strokeWidth: 2, seed, disableMultiStroke: true })).map((p) => tidy(p.d)).join(' ');
}

/** A rough circle outline, e.g. for waypoints or lens circles. */
export function roughCircle(x: number, y: number, d: number, seed: number, roughness = 0.8): string {
  return gen.toPaths(gen.circle(x, y, d, { roughness, stroke: '#16181C', strokeWidth: 1, seed })).map((p) => tidy(p.d)).join(' ');
}
