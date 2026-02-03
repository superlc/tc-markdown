/**
 * 缩放与拖拽状态管理 Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ZoomState, ZoomConfig } from './types';

const DEFAULT_ZOOM_CONFIG: ZoomConfig = {
  min: 0.25,
  max: 4,
  step: 0.25,
  default: 1,
};

export interface UseZoomOptions {
  config?: Partial<ZoomConfig>;
  /** 是否启用拖拽（全屏模式下启用） */
  enableDrag?: boolean;
  /** 是否启用滚轮缩放 */
  enableWheelZoom?: boolean;
}

export interface UseZoomReturn {
  state: ZoomState;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fitToContainer: (containerRect: DOMRect, contentRect: DOMRect) => void;
  setScale: (scale: number) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  contentStyle: React.CSSProperties;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
    onDoubleClick: () => void;
  };
}

export function useZoom(options: UseZoomOptions = {}): UseZoomReturn {
  const {
    config: customConfig,
    enableDrag = false,
    enableWheelZoom = false,
  } = options;

  const config: ZoomConfig = { ...DEFAULT_ZOOM_CONFIG, ...customConfig };
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  const [state, setState] = useState<ZoomState>({
    scale: config.default,
    translateX: 0,
    translateY: 0,
  });

  const clampScale = useCallback(
    (scale: number) => Math.max(config.min, Math.min(config.max, scale)),
    [config.min, config.max]
  );

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: clampScale(prev.scale + config.step),
    }));
  }, [clampScale, config.step]);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: clampScale(prev.scale - config.step),
    }));
  }, [clampScale, config.step]);

  const reset = useCallback(() => {
    setState({
      scale: config.default,
      translateX: 0,
      translateY: 0,
    });
  }, [config.default]);

  const setScale = useCallback(
    (scale: number) => {
      setState((prev) => ({
        ...prev,
        scale: clampScale(scale),
      }));
    },
    [clampScale]
  );

  const fitToContainer = useCallback(
    (containerRect: DOMRect, contentRect: DOMRect) => {
      const scaleX = containerRect.width / contentRect.width;
      const scaleY = containerRect.height / contentRect.height;
      const fitScale = Math.min(scaleX, scaleY) * 0.95; // 留 5% 边距，允许小图放大

      setState({
        scale: clampScale(fitScale),
        translateX: 0,
        translateY: 0,
      });
    },
    [clampScale]
  );

  // 拖拽处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enableDrag) return;
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { x: state.translateX, y: state.translateY };
    },
    [enableDrag, state.translateX, state.translateY]
  );

  useEffect(() => {
    if (!enableDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setState((prev) => ({
        ...prev,
        translateX: translateStart.current.x + dx,
        translateY: translateStart.current.y + dy,
      }));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enableDrag]);

  // 滚轮缩放
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enableWheelZoom) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -config.step : config.step;
      setState((prev) => ({
        ...prev,
        scale: clampScale(prev.scale + delta),
      }));
    },
    [enableWheelZoom, config.step, clampScale]
  );

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    reset();
  }, [reset]);

  const contentStyle: React.CSSProperties = {
    transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`,
    transformOrigin: 'center center',
    transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
    cursor: enableDrag ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
  };

  return {
    state,
    zoomIn,
    zoomOut,
    reset,
    fitToContainer,
    setScale,
    canZoomIn: state.scale < config.max,
    canZoomOut: state.scale > config.min,
    containerRef,
    contentStyle,
    handlers: {
      onMouseDown: handleMouseDown,
      onWheel: handleWheel,
      onDoubleClick: handleDoubleClick,
    },
  };
}
