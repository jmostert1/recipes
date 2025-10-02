// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/recipes/', // <-- repo name for GitHub Pages
  build: {
    outDir: '../dist', // Output to root dist folder
    emptyOutDir: true,
  },
});