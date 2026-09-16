import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 600, rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
});
