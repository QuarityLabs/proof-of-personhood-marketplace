import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vercel deploys to root domain, GitHub Pages to subdirectory
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const base = isVercel ? '/' : '/proof-of-personhood-marketplace/';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
});
