// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// UnreaLyria is published as a GitHub Pages user/organization site, so it is
// served from the domain root (https://unrealyria.github.io). Both `site` and
// `base` are therefore aligned with the root deployment.
//
// https://astro.build/config
export default defineConfig({
  site: 'https://unrealyria.github.io',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
