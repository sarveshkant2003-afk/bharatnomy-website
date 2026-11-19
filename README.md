# Bharatnomy website

The public website for Bharatnomy: India's economy, read as one connected system.
Built with Astro as a static site. Live at https://sarveshkant2003-afk.github.io/bharatnomy-website/

## Run it

```bash
npm install
npm run dev        # http://localhost:4321/bharatnomy-website/
npm run build      # static site in dist/
npm run data       # rebuild public/data/ from the Bharatnomy front repo (pinned in src/config/data.mjs)
```

Needs Node 22.23 or newer (Astro's requirement). Every push to `main` builds and deploys to GitHub Pages
(`.github/workflows/pages.yml`). For a custom domain at the root, build with `BASE_PATH=/`.

## Where things are

- Specs: `CLAUDE.md` (start here), `DESIGN.md`, `CONTENT.md`, `PAGES.md`, `MAP.md`, `SCROLL.md`, `SPEC-README.md`
- Pages: `src/pages/` (home, atlas, datasets, research, about, standards, careers, 404, hidden `/_kit`)
- Components: `src/components/`; styles: `src/styles/`; Atlas code: `src/scripts/atlas/`
- Data pipeline: `scripts/build-data.mjs` → `public/data/` (committed, so CI does not need to fetch data)

Data: India Meteorological Department gridded records, district indices computed by Bharatnomy. Licence CC BY 4.0.
