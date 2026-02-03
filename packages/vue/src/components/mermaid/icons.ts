/**
 * Mermaid 组件图标 (Vue)
 */

import { defineComponent, h } from 'vue';

/** 图片图标 */
export const ImageIcon = defineComponent({
  name: 'ImageIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
        })
      );
  },
});

/** 代码图标 */
export const CodeIcon = defineComponent({
  name: 'CodeIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
        })
      );
  },
});

/** 放大图标 */
export const ZoomInIcon = defineComponent({
  name: 'ZoomInIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z',
        })
      );
  },
});

/** 缩小图标 */
export const ZoomOutIcon = defineComponent({
  name: 'ZoomOutIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7V9z',
        })
      );
  },
});

/** 重置图标 */
export const ResetIcon = defineComponent({
  name: 'ResetIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
        })
      );
  },
});

/** 全屏图标 */
export const FullscreenIcon = defineComponent({
  name: 'FullscreenIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
        })
      );
  },
});

/** 退出全屏图标 */
export const FullscreenExitIcon = defineComponent({
  name: 'FullscreenExitIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
        })
      );
  },
});

/** 下载图标 */
export const DownloadIcon = defineComponent({
  name: 'DownloadIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
        })
      );
  },
});

/** 关闭图标 */
export const CloseIcon = defineComponent({
  name: 'CloseIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
        })
      );
  },
});

/** 复制图标 */
export const CopyIcon = defineComponent({
  name: 'CopyIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
        })
      );
  },
});

/** 复制成功图标 */
export const CheckIcon = defineComponent({
  name: 'CheckIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
        })
      );
  },
});

/** 适应窗口图标 */
export const FitIcon = defineComponent({
  name: 'FitIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', {
          d: 'M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z',
        })
      );
  },
});
