import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@bookmarks/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),
      '@bookmarks/shared/ui': fileURLToPath(new URL('../../packages/shared/src/ui', import.meta.url)),
    },
  },
});
