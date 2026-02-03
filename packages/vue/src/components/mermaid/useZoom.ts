/**
 * 缩放与拖拽状态管理 Composable (Vue)
 */

import { ref, computed, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue';
import type { ZoomState, ZoomConfig } from './types';

const DEFAULT_ZOOM_CONFIG: ZoomConfig = {
  min: 0.25,
  max: 4,
  step: 0.25,
  default: 1,
};

export interface UseZoomOptions {
  config?: Partial<ZoomConfig>;
  enableDrag?: boolean;
  enableWheelZoom?: boolean;
}

export interface UseZoomReturn {
  state: Ref<ZoomState>;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fitToContainer: (containerRect: DOMRect, contentRect: DOMRect) => void;
  setScale: (scale: number) => void;
  canZoomIn: Ref<boolean>;
  canZoomOut: Ref<boolean>;
  contentStyle: Ref<CSSProperties>;
  onMouseDown: (e: MouseEvent) => void;
  onWheel: (e: WheelEvent) => void;
  onDoubleClick: () => void;
}

export function useZoom(options: UseZoomOptions = {}): UseZoomReturn {
  const {
    config: customConfig,
    enableDrag = false,
    enableWheelZoom = false,
  } = options;

  const config: ZoomConfig = { ...DEFAULT_ZOOM_CONFIG, ...customConfig };

  const state = ref<ZoomState>({
    scale: config.default,
    translateX: 0,
    translateY: 0,
  });

  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });
  const translateStart = ref({ x: 0, y: 0 });

  const clampScale = (scale: number) => Math.max(config.min, Math.min(config.max, scale));

  const canZoomIn = computed(() => state.value.scale < config.max);
  const canZoomOut = computed(() => state.value.scale > config.min);

  const zoomIn = () => {
    state.value = {
      ...state.value,
      scale: clampScale(state.value.scale + config.step),
    };
  };

  const zoomOut = () => {
    state.value = {
      ...state.value,
      scale: clampScale(state.value.scale - config.step),
    };
  };

  const reset = () => {
    state.value = {
      scale: config.default,
      translateX: 0,
      translateY: 0,
    };
  };

  const setScale = (scale: number) => {
    state.value = {
      ...state.value,
      scale: clampScale(scale),
    };
  };

  const fitToContainer = (containerRect: DOMRect, contentRect: DOMRect) => {
    const scaleX = containerRect.width / contentRect.width;
    const scaleY = containerRect.height / contentRect.height;
    const fitScale = Math.min(scaleX, scaleY) * 0.95; // 留 5% 边距，允许小图放大

    state.value = {
      scale: clampScale(fitScale),
      translateX: 0,
      translateY: 0,
    };
  };

  // 拖拽处理
  const onMouseDown = (e: MouseEvent) => {
    if (!enableDrag) return;
    e.preventDefault();
    isDragging.value = true;
    dragStart.value = { x: e.clientX, y: e.clientY };
    translateStart.value = { x: state.value.translateX, y: state.value.translateY };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    const dx = e.clientX - dragStart.value.x;
    const dy = e.clientY - dragStart.value.y;
    state.value = {
      ...state.value,
      translateX: translateStart.value.x + dx,
      translateY: translateStart.value.y + dy,
    };
  };

  const onMouseUp = () => {
    isDragging.value = false;
  };

  // 滚轮缩放
  const onWheel = (e: WheelEvent) => {
    if (!enableWheelZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -config.step : config.step;
    state.value = {
      ...state.value,
      scale: clampScale(state.value.scale + delta),
    };
  };

  // 双击重置
  const onDoubleClick = () => {
    reset();
  };

  const contentStyle = computed<CSSProperties>(() => ({
    transform: `translate(${state.value.translateX}px, ${state.value.translateY}px) scale(${state.value.scale})`,
    transformOrigin: 'center center',
    transition: isDragging.value ? 'none' : 'transform 0.2s ease-out',
    cursor: enableDrag ? (isDragging.value ? 'grabbing' : 'grab') : 'default',
  }));

  onMounted(() => {
    if (enableDrag) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  onUnmounted(() => {
    if (enableDrag) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });

  return {
    state,
    zoomIn,
    zoomOut,
    reset,
    fitToContainer,
    setScale,
    canZoomIn,
    canZoomOut,
    contentStyle,
    onMouseDown,
    onWheel,
    onDoubleClick,
  };
}
