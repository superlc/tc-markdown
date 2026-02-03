/**
 * Mermaid 全屏查看器
 * 使用浏览器原生 Fullscreen API 实现沉浸式体验
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { MermaidFullscreenViewerProps } from './types';
import { useZoom } from './useZoom';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  FullscreenExitIcon,
  DownloadIcon,
  CloseIcon,
} from './icons';

export const MermaidFullscreenViewer: React.FC<MermaidFullscreenViewerProps> = ({
  svg,
  open,
  onClose,
  onDownload,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    state,
    zoomIn,
    zoomOut,
    reset,
    fitToContainer,
    canZoomIn,
    canZoomOut,
    contentStyle,
    handlers,
  } = useZoom({
    enableDrag: true,
    enableWheelZoom: true,
  });

  // 进入浏览器全屏
  const enterFullscreen = useCallback(async () => {
    if (!wrapperRef.current) return;
    try {
      await wrapperRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      // 全屏请求被拒绝或不支持，使用备用方案
      setIsFullscreen(true);
    }
  }, []);

  // 退出全屏
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    onClose();
  }, [onClose]);

  // 监听 open 状态变化
  useEffect(() => {
    if (open) {
      enterFullscreen();
    } else if (isFullscreen) {
      exitFullscreen();
    }
  }, [open, enterFullscreen, exitFullscreen, isFullscreen]);

  // 监听全屏状态变化（用户按 Esc 或其他方式退出）
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, onClose]);

  // 键盘事件
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, zoomIn, zoomOut, reset]);

  // 适应窗口
  const handleFit = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const svgEl = contentRef.current.querySelector('svg');
    if (svgEl) {
      const contentRect = svgEl.getBoundingClientRect();
      fitToContainer(containerRect, contentRect);
    }
  }, [fitToContainer]);

  // 组件始终渲染，但只有在全屏状态下才显示
  return (
    <div
      ref={wrapperRef}
      className={`md-mermaid-fullscreen-wrapper${isFullscreen ? ' md-mermaid-fullscreen-wrapper--active' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mermaid 图表全屏预览"
      aria-hidden={!isFullscreen}
    >
      {isFullscreen && (
        <>
          {/* 工具栏 */}
          <div className="md-mermaid-fullscreen-toolbar">
            <div className="md-mermaid-toolbar-group">
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={zoomOut}
                disabled={!canZoomOut}
                title="缩小 (-)"
                aria-label="缩小"
              >
                <ZoomOutIcon />
              </button>
              <span className="md-mermaid-zoom-label">
                {Math.round(state.scale * 100)}%
              </span>
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={zoomIn}
                disabled={!canZoomIn}
                title="放大 (+)"
                aria-label="放大"
              >
                <ZoomInIcon />
              </button>
              <span className="md-mermaid-toolbar-divider" />
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={reset}
                title="重置 (0)"
                aria-label="重置"
              >
                <ResetIcon />
              </button>
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={handleFit}
                title="适应窗口"
                aria-label="适应窗口"
              >
                <FullscreenExitIcon />
              </button>
            </div>

            <div className="md-mermaid-toolbar-group">
              {onDownload && (
                <button
                  type="button"
                  className="md-mermaid-toolbar-btn"
                  onClick={onDownload}
                  title="下载 PNG"
                  aria-label="下载"
                >
                  <DownloadIcon />
                </button>
              )}
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={exitFullscreen}
                title="退出全屏 (Esc)"
                aria-label="退出全屏"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div
            ref={containerRef}
            className="md-mermaid-fullscreen-content"
            onWheel={handlers.onWheel}
          >
            <div
              ref={contentRef}
              className="md-mermaid-fullscreen-svg"
              style={contentStyle}
              onMouseDown={handlers.onMouseDown}
              onDoubleClick={handlers.onDoubleClick}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </>
      )}
    </div>
  );
};

MermaidFullscreenViewer.displayName = 'MermaidFullscreenViewer';
