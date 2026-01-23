import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TcMdCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['unified', 'remark-parse', 'remark-gfm', 'remark-rehype', 'rehype-stringify', 'rehype-highlight', 'hast-util-to-jsx-runtime', 'unist-util-visit', 'react', 'vue'],
    },
  },
});
