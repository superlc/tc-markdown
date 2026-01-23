import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), vue()],
  resolve: {
    alias: {
      '@tc/md-core': resolve(__dirname, 'packages/core/src'),
      '@tc/md-react': resolve(__dirname, 'packages/react/src'),
      '@tc/md-vue': resolve(__dirname, 'packages/vue/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
