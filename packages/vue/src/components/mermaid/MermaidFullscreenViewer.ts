/**
 * Mermaid 全屏查看器 (Vue)
 * 使用浏览器原生 Fullscreen API 实现沉浸式体验
 */

import {
  defineComponent,
  h,
  ref,
  watch,
  onUnmounted,
  onMounted,
} from 'vue';
import { useZoom } from './useZoom';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  FullscreenExitIcon,
  DownloadIcon,
  CloseIcon,
} from './icons';

export const MermaidFullscreenViewer = defineComponent({
  name: 'MermaidFullscreenViewer',
  props: {
    svg: {
      type: String,
      required: true,
    },
    open: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'download'],
  setup(props, { emit }) {
    const wrapperRef = ref<HTMLDivElement | null>(null);
    const containerRef = ref<HTMLDivElement | null>(null);
    const contentRef = ref<HTMLDivElement | null>(null);
    const isFullscreen = ref(false);

    const {
      state,
      zoomIn,
      zoomOut,
      reset,
      fitToContainer,
      canZoomIn,
      canZoomOut,
      contentStyle,
      onMouseDown,
      onWheel,
      onDoubleClick,
    } = useZoom({
      enableDrag: true,
      enableWheelZoom: true,
    });

    // 进入浏览器全屏
    const enterFullscreen = async () => {
      if (!wrapperRef.value) return;
      try {
        await wrapperRef.value.requestFullscreen();
        isFullscreen.value = true;
      } catch {
        // 全屏请求被拒绝或不支持，使用备用方案
        isFullscreen.value = true;
      }
    };

    // 退出全屏
    const exitFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      isFullscreen.value = false;
      emit('close');
    };

    // 监听 open 状态变化
    watch(
      () => props.open,
      (open) => {
        if (open) {
          enterFullscreen();
        } else if (isFullscreen.value) {
          exitFullscreen();
        }
      }
    );

    // 监听全屏状态变化（用户按 Esc 或其他方式退出）
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen.value) {
        isFullscreen.value = false;
        emit('close');
      }
    };

    // 全屏激活后自动适配容器
    watch(isFullscreen, (fullscreen) => {
      if (!fullscreen) return;
      // 等待 DOM 布局完成后执行适配
      requestAnimationFrame(() => {
        if (!containerRef.value || !contentRef.value) return;
        const containerRect = containerRef.value.getBoundingClientRect();
        const svgEl = contentRef.value.querySelector('svg');
        if (svgEl) {
          const contentRect = svgEl.getBoundingClientRect();
          fitToContainer(containerRect, contentRect);
        }
      });
    });

    // 键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen.value) return;
      switch (e.key) {
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          reset();
          break;
      }
    };

    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    });

    // 适应窗口
    const handleFit = () => {
      if (!containerRef.value || !contentRef.value) return;
      const containerRect = containerRef.value.getBoundingClientRect();
      const svgEl = contentRef.value.querySelector('svg');
      if (svgEl) {
        const contentRect = svgEl.getBoundingClientRect();
        fitToContainer(containerRect, contentRect);
      }
    };

    return () => {
      return h(
        'div',
        {
          ref: wrapperRef,
          class: [
            'md-mermaid-fullscreen-wrapper',
            isFullscreen.value && 'md-mermaid-fullscreen-wrapper--active',
          ],
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': 'Mermaid 图表全屏预览',
          'aria-hidden': !isFullscreen.value,
        },
        isFullscreen.value
          ? [
              // 工具栏
              h('div', { class: 'md-mermaid-fullscreen-toolbar' }, [
                h('div', { class: 'md-mermaid-toolbar-group' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: zoomOut,
                      disabled: !canZoomOut.value,
                      title: '缩小 (-)',
                      'aria-label': '缩小',
                    },
                    h(ZoomOutIcon)
                  ),
                  h(
                    'span',
                    { class: 'md-mermaid-zoom-label' },
                    `${Math.round(state.value.scale * 100)}%`
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: zoomIn,
                      disabled: !canZoomIn.value,
                      title: '放大 (+)',
                      'aria-label': '放大',
                    },
                    h(ZoomInIcon)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: reset,
                      title: '重置 (0)',
                      'aria-label': '重置',
                    },
                    h(ResetIcon)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: handleFit,
                      title: '适应窗口',
                      'aria-label': '适应窗口',
                    },
                    h(FullscreenExitIcon)
                  ),
                ]),
                h('div', { class: 'md-mermaid-toolbar-group' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: () => emit('download'),
                      title: '下载 PNG',
                      'aria-label': '下载',
                    },
                    h(DownloadIcon)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'md-mermaid-toolbar-btn',
                      onClick: exitFullscreen,
                      title: '退出全屏 (Esc)',
                      'aria-label': '退出全屏',
                    },
                    h(CloseIcon)
                  ),
                ]),
              ]),
              // 内容区域
              h(
                'div',
                {
                  ref: containerRef,
                  class: 'md-mermaid-fullscreen-content',
                  onWheel,
                },
                h('div', {
                  ref: contentRef,
                  class: 'md-mermaid-fullscreen-svg',
                  style: contentStyle.value,
                  onMousedown: onMouseDown,
                  onDblclick: onDoubleClick,
                  innerHTML: props.svg,
                })
              ),
            ]
          : undefined
      );
    };
  },
});
