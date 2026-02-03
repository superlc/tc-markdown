/**
 * Mermaid 图表块组件 (Vue)
 * 支持图片/代码切换、缩放、全屏、下载
 * 支持流式渲染优化（延迟渲染 + 保留上次有效结果）
 */

import {
  defineComponent,
  h,
  ref,
  watch,
  computed,
  onMounted,
  onUnmounted,
  type PropType,
} from 'vue';
import {
  MermaidRenderer,
  downloadAsPng,
  detectColorScheme,
  observeColorScheme,
  type MermaidRenderResult,
  type MermaidTheme,
  type ColorScheme,
} from '@superlc/md-core';
import type { ViewMode, StreamStatus } from './types';
import { useZoom } from './useZoom';
import { MermaidFullscreenViewer } from './MermaidFullscreenViewer';
import {
  ImageIcon,
  CodeIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  FullscreenIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
} from './icons';

// 流式渲染配置
const STREAM_RENDER_DELAY = 150; // 流式状态下的渲染延迟（ms）

// 全局渲染器实例（单例，因为 Mermaid 本身是全局单例）
let rendererInstance: MermaidRenderer | null = null;

function getRenderer(theme: MermaidTheme | 'auto' = 'auto'): MermaidRenderer {
  if (!rendererInstance) {
    rendererInstance = new MermaidRenderer({ theme });
  } else {
    // 更新主题配置（实际主题解析在 render 时进行）
    rendererInstance.setTheme(theme ?? 'auto');
  }
  return rendererInstance;
}

// 复制到剪贴板
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export const MermaidBlock = defineComponent({
  name: 'MermaidBlock',
  props: {
    code: {
      type: String,
      required: true,
    },
    theme: {
      type: String as PropType<MermaidTheme | 'auto'>,
      default: 'auto',
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
    streamStatus: {
      type: String as PropType<StreamStatus>,
      default: 'done',
    },
  },
  emits: ['copy'],
  setup(props, { emit }) {
    const mode = ref<ViewMode>('preview');
    const renderResult = ref<MermaidRenderResult | null>(null);
    const isLoading = ref(true);
    const isFullscreen = ref(false);
    const copied = ref(false);
    // 用于跟踪主题变化（支持系统偏好和 CSS 类名切换）
    const colorScheme = ref<ColorScheme>(detectColorScheme());

    // 流式渲染优化：保留上次有效的 SVG
    let lastValidSvg: string | null = null;
    // 延迟渲染定时器
    let renderTimer: ReturnType<typeof setTimeout> | null = null;

    const {
      state: zoomState,
      zoomIn,
      zoomOut,
      reset: zoomReset,
      canZoomIn,
      canZoomOut,
      contentStyle,
    } = useZoom();

    const hasValidSvg = computed(
      () => renderResult.value?.success && renderResult.value.svg
    );

    // 监听主题变化（系统偏好 + CSS 类名/属性）
    let cleanupObserver: (() => void) | null = null;

    onMounted(() => {
      if (props.theme === 'auto') {
        cleanupObserver = observeColorScheme((scheme) => {
          colorScheme.value = scheme;
        });
      }
    });

    onUnmounted(() => {
      cleanupObserver?.();
      if (renderTimer) {
        clearTimeout(renderTimer);
        renderTimer = null;
      }
    });

    // 渲染 Mermaid（带流式优化）
    // 用于存储最新的 code 和 streamStatus，供定时器回调使用
    let latestCode = props.code;
    let latestStreamStatus = props.streamStatus;

    watch(
      () => [props.code, props.theme, colorScheme.value, props.streamStatus],
      async () => {
        // 更新最新值
        latestCode = props.code;
        latestStreamStatus = props.streamStatus;

        const doRender = async () => {
          // 流式状态下有缓存时，不显示 loading（保持显示上次结果）
          if (!(latestStreamStatus === 'loading' && lastValidSvg)) {
            isLoading.value = true;
          }

          const renderer = getRenderer(props.theme);
          const result = await renderer.render(latestCode);

          if (result.success && result.svg) {
            // 渲染成功，更新结果并缓存有效 SVG
            lastValidSvg = result.svg;
            renderResult.value = result;
            isLoading.value = false;
            // 渲染成功时切换到预览模式
            mode.value = 'preview';
          } else {
            // 渲染失败
            if (latestStreamStatus === 'loading') {
              // 流式输入中：尝试使用缓存，否则保持 loading 状态
              if (lastValidSvg) {
                renderResult.value = {
                  success: true,
                  svg: lastValidSvg,
                };
                isLoading.value = false;
              }
              // 无缓存时保持 loading 状态，不切换到代码模式
            } else {
              // 非流式：显示错误并切换到代码模式
              renderResult.value = result;
              isLoading.value = false;
              mode.value = 'code';
            }
          }
        };

        if (props.streamStatus === 'loading') {
          // 流式输入中：使用节流，只有当没有定时器时才设置新的
          if (!renderTimer) {
            renderTimer = setTimeout(() => {
              renderTimer = null;
              doRender();
            }, STREAM_RENDER_DELAY);
          }
        } else {
          // 流式完成或非流式：清除定时器并立即渲染
          if (renderTimer) {
            clearTimeout(renderTimer);
            renderTimer = null;
          }
          doRender();
        }
      },
      { immediate: true }
    );

    // 复制代码
    const handleCopy = async () => {
      const success = await copyToClipboard(props.code);
      if (success) {
        copied.value = true;
        emit('copy', props.code);
        setTimeout(() => (copied.value = false), 2000);
      }
    };

    // 下载图表
    const handleDownload = async () => {
      if (!renderResult.value?.svg) return;

      try {
        const isDark =
          window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

        await downloadAsPng(renderResult.value.svg, {
          backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          padding: 20,
          scale: 2,
        });
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    return () => {
      const toolbar = props.showToolbar
        ? h('div', { class: 'md-mermaid-toolbar' }, [
            // 模式切换
            h('div', { class: 'md-mermaid-toolbar-group md-mermaid-mode-switch' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: `md-mermaid-toolbar-btn${mode.value === 'preview' ? ' md-mermaid-toolbar-btn--active' : ''}`,
                  onClick: () => (mode.value = 'preview'),
                  disabled: !hasValidSvg.value,
                  title: '图片模式',
                  'aria-label': '图片模式',
                },
                h(ImageIcon)
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: `md-mermaid-toolbar-btn${mode.value === 'code' ? ' md-mermaid-toolbar-btn--active' : ''}`,
                  onClick: () => (mode.value = 'code'),
                  title: '代码模式',
                  'aria-label': '代码模式',
                },
                h(CodeIcon)
              ),
            ]),

            // 缩放控制 - 仅图片模式显示
            mode.value === 'preview' && hasValidSvg.value
              ? h('div', { class: 'md-mermaid-toolbar-group' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: zoomOut,
                      disabled: !canZoomOut.value,
                      title: '缩小',
                      'aria-label': '缩小',
                    },
                    h(ZoomOutIcon)
                  ),
                  h(
                    'span',
                    { class: 'md-mermaid-zoom-label' },
                    `${Math.round(zoomState.value.scale * 100)}%`
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: zoomIn,
                      disabled: !canZoomIn.value,
                      title: '放大',
                      'aria-label': '放大',
                    },
                    h(ZoomInIcon)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: zoomReset,
                      title: '重置',
                      'aria-label': '重置缩放',
                    },
                    h(ResetIcon)
                  ),
                ])
              : null,

            // 操作按钮
            h('div', { class: 'md-mermaid-toolbar-group' }, [
              mode.value === 'preview' && hasValidSvg.value
                ? [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'md-mermaid-toolbar-btn',
                        onClick: () => (isFullscreen.value = true),
                        title: '全屏',
                        'aria-label': '全屏查看',
                      },
                      h(FullscreenIcon)
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'md-mermaid-toolbar-btn',
                        onClick: handleDownload,
                        title: '下载 PNG',
                        'aria-label': '下载',
                      },
                      h(DownloadIcon)
                    ),
                  ]
                : null,
              mode.value === 'code'
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: `md-mermaid-toolbar-btn${copied.value ? ' md-mermaid-toolbar-btn--success' : ''}`,
                      onClick: handleCopy,
                      title: copied.value ? '已复制' : '复制代码',
                      'aria-label': copied.value ? '已复制' : '复制代码',
                    },
                    copied.value ? h(CheckIcon) : h(CopyIcon)
                  )
                : null,
            ]),
          ])
        : null;

      // 内容区域
      let content;
      if (isLoading.value) {
        content = h('div', { class: 'md-mermaid-skeleton' }, [
          h('div', { class: 'md-mermaid-skeleton-box' }),
        ]);
      } else if (mode.value === 'preview' && hasValidSvg.value) {
        content = h('div', { class: 'md-mermaid-preview', style: { overflow: 'hidden' } }, [
          h('div', {
            class: 'md-mermaid-svg-container',
            style: contentStyle.value,
            innerHTML: renderResult.value!.svg,
          }),
        ]);
      } else {
        content = h('div', { class: 'md-mermaid-code' }, [
          h('pre', [h('code', { class: 'language-mermaid' }, props.code)]),
          // 错误提示 - 仅在非流式或流式完成时显示
          renderResult.value && !renderResult.value.success && props.streamStatus === 'done'
            ? h('div', { class: 'md-mermaid-error' }, [
                h('span', '渲染失败: '),
                h('span', renderResult.value.error),
              ])
            : null,
        ]);
      }

      return h('div', { class: 'md-mermaid-block' }, [
        toolbar,
        h('div', { class: 'md-mermaid-content' }, [content]),
        // 全屏查看器
        hasValidSvg.value
          ? h(MermaidFullscreenViewer, {
              svg: renderResult.value!.svg!,
              open: isFullscreen.value,
              onClose: () => (isFullscreen.value = false),
              onDownload: handleDownload,
            })
          : null,
      ]);
    };
  },
});
