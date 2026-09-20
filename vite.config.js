import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // aaPanel places a protected .user.ini in the selected running directory.
    // Preserve it instead of asking Vite to empty the whole directory first.
    emptyOutDir: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks: { three: ['three'] } } },
  },
});
