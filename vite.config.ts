import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
  server: { open: true },
});