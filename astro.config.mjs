import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://marketpro.id',
  integrations: [
    tailwind(),
    sitemap(),
    react()
  ],
  i18n: {
    defaultLocale: 'id',
    locales: ['id'],
  },
});