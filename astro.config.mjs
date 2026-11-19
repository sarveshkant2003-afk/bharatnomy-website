import { defineConfig } from 'astro/config';

// Hosting: GitHub Pages serves the site at /bharatnomy-website/.
// For a custom domain at the root, build with BASE_PATH=/ (and SITE_URL=https://bharatnomy.com).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sarveshkant2003-afk.github.io',
  base: process.env.BASE_PATH ?? '/bharatnomy-website',
  output: 'static',
});
