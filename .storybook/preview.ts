import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import '../stories/styles.css';

// 自定义暗黑主题
const darkTheme = {
  ...themes.dark,
  appBg: '#0d1117',
  appContentBg: '#161b22',
  barBg: '#161b22',
  inputBg: '#21262d',
  buttonBg: '#21262d',
  booleanBg: '#21262d',
  booleanSelectedBg: '#238636',
  appBorderColor: '#30363d',
  inputBorder: '#30363d',
  textColor: '#e6edf3',
  textMutedColor: '#8b949e',
};

// 应用暗黑模式样式
const applyDarkMode = (isDark: boolean) => {
  // 切换 markdown 样式主题
  document.documentElement.classList.remove('md-light', 'md-dark', 'dark', 'light');
  document.documentElement.classList.add(isDark ? 'md-dark' : 'md-light');
  document.documentElement.classList.add(isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark', isDark);
  
  // 直接设置 body 背景色
  document.body.style.backgroundColor = isDark ? '#0d1117' : '#ffffff';
};

// 监听暗黑模式切换
const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, applyDarkMode);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    darkMode: {
      // 暗黑模式主题配置
      dark: darkTheme,
      light: themes.light,
      // 默认浅色模式
      current: 'light',
      // 启用系统偏好检测
      stylePreview: true,
      // Docs 页面主题 - 关键配置
      classTarget: 'html',
      darkClass: 'dark',
      lightClass: 'light',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return Story();
    },
  ],
};

export default preview;
