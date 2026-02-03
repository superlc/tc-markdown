import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../packages/*/src/**/*.stories.@(ts|tsx)',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [vue()],
      resolve: {
        alias: {
          '@tc/md-core': resolve(__dirname, '../packages/core/src'),
          '@tc/md-react': resolve(__dirname, '../packages/react/src'),
          '@tc/md-vue': resolve(__dirname, '../packages/vue/src'),
        },
      },
      optimizeDeps: {
        include: ['vue'],
      },
    });
  },
};

export default config;
