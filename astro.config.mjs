// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  },
  integrations: [react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});