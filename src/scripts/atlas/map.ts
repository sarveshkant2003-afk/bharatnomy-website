// The precise map (MAP.md §5): MapLibre with no tile sources, drawn on the paper.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { u } from '../../lib/url';

maplibregl.setWorkerUrl(u('/maplibre/maplibre-gl-worker.mjs'));

const INK = '#16181C', ACCENT = '#2346C7';

export interface AtlasMap {
  map: maplibregl.Map;
  setColors(colors: Record<string, string | null>, fadeMs: number): void;
  setSelection(selected: string | null, compare: string[], names: Record<string, string>, centroids: Record<string, [number, number]>): void;
  resize(): void;
}

function bbox(fc: GeoJSON.FeatureCollection): [number, number, number, number] {
  let w = 180, s = 90, e = -180, n = -90;
  const walk = (c: any) => { if (typeof c[0] === 'number') { w = Math.min(w, c[0]); e = Math.max(e, c[0]); s = Math.min(s, c[1]); n = Math.max(n, c[1]); } else c.forEach(walk); };
  fc.features.forEach((f: any) => walk(f.geometry.coordinates));
  return [w, s, e, n];
}

/** A diagonal-hatch image for "no data" districts. */
function hatchImage(): { width: number; height: number; data: Uint8Array } {
  const N = 8, data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const on = (x + y) % N === 0;
    const i = (y * N + x) * 4;
    data[i] = 76; data[i + 1] = 83; data[i + 2] = 92; data[i + 3] = on ? 255 : 0;
  }
  return { width: N, height: N, data };
}

export function createMap(el: HTMLElement, districts: GeoJSON.FeatureCollection, state: GeoJSON.FeatureCollection, opts: {
  onHover: (lgd: string | null, x: number, y: number) => void;
  onClick: (lgd: string | null) => void;
}): Promise<AtlasMap> {
  const [w, s, e, n] = bbox(districts);
  const padX = (e - w) * 0.25, padY = (n - s) * 0.25;
  const map = new maplibregl.Map({
    container: el,
    style: {
      version: 8,
      sources: {
        districts: { type: 'geojson', data: districts, promoteId: 'lgd' },
        state: { type: 'geojson', data: state },
      },
      layers: [
        { id: 'fill', type: 'fill', source: 'districts', paint: { 'fill-color': ['coalesce', ['feature-state', 'color'], 'rgba(0,0,0,0)'], 'fill-color-transition': { duration: 250 } } },
        { id: 'line', type: 'line', source: 'districts', paint: { 'line-color': INK, 'line-width': 0.75 } },
        { id: 'compare', type: 'line', source: 'districts', paint: { 'line-color': INK, 'line-width': 1.75, 'line-dasharray': [2, 1.5], 'line-opacity': ['case', ['boolean', ['feature-state', 'compare'], false], 1, 0] } },
        { id: 'hover', type: 'line', source: 'districts', paint: { 'line-color': INK, 'line-width': 1.75, 'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0] } },
        { id: 'state', type: 'line', source: 'state', paint: { 'line-color': INK, 'line-width': 1.5 } },
        { id: 'selected', type: 'line', source: 'districts', paint: { 'line-color': ACCENT, 'line-width': 2.5, 'line-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0] } },
      ],
    },
    bounds: [w, s, e, n],
    fitBoundsOptions: { padding: 24 },
    maxBounds: [w - padX, s - padY, e + padX, n + padY],
    maxZoom: 9,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: false,
    canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    cooperativeGestures: false,
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  return new Promise((resolve) => {
    map.on('load', () => {
      map.addImage('nodata', hatchImage());
      map.addLayer({ id: 'nodata', type: 'fill', source: 'districts', paint: { 'fill-pattern': 'nodata', 'fill-opacity': ['case', ['boolean', ['feature-state', 'nodata'], false], 1, 0] } }, 'line');
      map.setMinZoom(Math.max(0, map.getZoom() - 1));
      // keep the whole state in view when the box changes size, until the reader moves the map
      let touched = false;
      map.on('dragstart', () => { touched = true; });
      map.on('zoomstart', (e: any) => { if (e.originalEvent) touched = true; });
      const refit = () => { map.resize(); if (!touched) map.fitBounds([w, s, e, n], { padding: 24, animate: false }); };
      if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(refit)).observe(el);
      let hovered: string | null = null;
      map.on('mousemove', 'fill', (ev) => {
        const id = ev.features?.[0]?.id as string | undefined;
        if (id == null) return;
        if (hovered !== id) {
          if (hovered) map.setFeatureState({ source: 'districts', id: hovered }, { hover: false });
          hovered = String(id);
          map.setFeatureState({ source: 'districts', id: hovered }, { hover: true });
        }
        map.getCanvas().style.cursor = 'pointer';
        opts.onHover(hovered, ev.point.x, ev.point.y);
      });
      map.on('mouseleave', 'fill', () => {
        if (hovered) map.setFeatureState({ source: 'districts', id: hovered }, { hover: false });
        hovered = null;
        map.getCanvas().style.cursor = '';
        opts.onHover(null, 0, 0);
      });
      map.on('click', (ev) => {
        const f = map.queryRenderedFeatures(ev.point, { layers: ['fill'] })[0];
        opts.onClick(f ? String(f.id) : null);
      });

      let markers: maplibregl.Marker[] = [];
      let lastSel: string | null = null, lastCmp: string[] = [];
      const api: AtlasMap = {
        map,
        setColors(colors, fadeMs) {
          map.setPaintProperty('fill', 'fill-color-transition', { duration: fadeMs, delay: 0 });
          for (const [id, c] of Object.entries(colors)) map.setFeatureState({ source: 'districts', id }, { color: c ?? 'rgba(0,0,0,0)', nodata: c == null });
        },
        setSelection(selected, compare, names, centroids) {
          if (lastSel) map.setFeatureState({ source: 'districts', id: lastSel }, { selected: false });
          lastCmp.forEach((id) => map.setFeatureState({ source: 'districts', id }, { compare: false }));
          if (selected) map.setFeatureState({ source: 'districts', id: selected }, { selected: true });
          compare.forEach((id) => map.setFeatureState({ source: 'districts', id }, { compare: true }));
          lastSel = selected; lastCmp = [...compare];
          markers.forEach((m) => m.remove());
          markers = [selected, ...compare].filter(Boolean).map((id, i) => {
            const d = document.createElement('span');
            d.className = `atlas-maplabel${i === 0 && selected ? ' is-sel' : ''}`;
            d.textContent = names[id!];
            return new maplibregl.Marker({ element: d, anchor: 'bottom', offset: [0, -6] }).setLngLat(centroids[id!]).addTo(map);
          });
        },
        resize() { map.resize(); },
      };
      resolve(api);
    });
  });
}
