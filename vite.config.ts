import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 8080,
  },
});