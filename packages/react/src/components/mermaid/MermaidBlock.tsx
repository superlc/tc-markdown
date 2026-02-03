/**
 * Mermaid 图表块组件
 * 支持图片/代码切换、缩放、全屏、下载
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MermaidRenderer,
  downloadAsPng,
  detectColorScheme,
  observeColorScheme,
  type MermaidRenderResult,
  type ColorScheme,
} from '@superlc/md-core';
import type { MermaidBlockProps, ViewMode } from './types';
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

// 全局渲染器实例（单例，因为 Mermaid 本身是全局单例）
let rendererInstance: MermaidRenderer | null = null;

function getRenderer(theme: MermaidBlockProps['theme'] = 'auto'): MermaidRenderer {
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

export const MermaidBlock: React.FC<MermaidBlockProps> = ({
  code,
  theme = 'auto',
  showToolbar = true,
  onCopy,
  className,
}) => {
  const [mode, setMode] = useState<ViewMode>('preview');
  const [renderResult, setRenderResult] = useState<MermaidRenderResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // 用于跟踪主题变化（支持系统偏好和 CSS 类名切换）
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => detectColorScheme());

  const {
    state: zoomState,
    zoomIn,
    zoomOut,
    reset: zoomReset,
    canZoomIn,
    canZoomOut,
    contentStyle,
  } = useZoom();

  // 监听主题变化（系统偏好 + CSS 类名/属性）
  useEffect(() => {
    if (theme !== 'auto') return;

    return observeColorScheme((scheme) => {
      setColorScheme(scheme);
    });
  }, [theme]);

  // 渲染 Mermaid
  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setIsLoading(true);
      const renderer = getRenderer(theme);
      const result = await renderer.render(code);

      if (!cancelled) {
        setRenderResult(result);
        setIsLoading(false);

        // 渲染失败时自动切换到代码模式
        if (!result.success) {
          setMode('code');
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [code, theme, colorScheme]);

  // 复制代码
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      onCopy?.(code);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code, onCopy]);

  // 下载图表
  const handleDownload = useCallback(async () => {
    if (!renderResult?.svg) return;

    try {
      // 检测当前是否暗黑模式
      const isDark =
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

      await downloadAsPng(renderResult.svg, {
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        padding: 20,
        scale: 2,
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [renderResult]);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const hasValidSvg = renderResult?.success && renderResult.svg;

  return (
    <div className={`md-mermaid-block${className ? ` ${className}` : ''}`}>
      {/* 工具栏 */}
      {showToolbar && (
        <div className="md-mermaid-toolbar">
          {/* 模式切换 */}
          <div className="md-mermaid-toolbar-group md-mermaid-mode-switch">
            <button
              type="button"
              className={`md-mermaid-toolbar-btn${mode === 'preview' ? ' md-mermaid-toolbar-btn--active' : ''}`}
              onClick={() => setMode('preview')}
              disabled={!hasValidSvg}
              title="图片模式"
              aria-label="图片模式"
            >
              <ImageIcon />
            </button>
            <button
              type="button"
              className={`md-mermaid-toolbar-btn${mode === 'code' ? ' md-mermaid-toolbar-btn--active' : ''}`}
              onClick={() => setMode('code')}
              title="代码模式"
              aria-label="代码模式"
            >
              <CodeIcon />
            </button>
          </div>

          {/* 缩放控制 - 仅图片模式显示 */}
          {mode === 'preview' && hasValidSvg && (
            <div className="md-mermaid-toolbar-group">
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={zoomOut}
                disabled={!canZoomOut}
                title="缩小"
                aria-label="缩小"
              >
                <ZoomOutIcon />
              </button>
              <span className="md-mermaid-zoom-label">
                {Math.round(zoomState.scale * 100)}%
              </span>
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={zoomIn}
                disabled={!canZoomIn}
                title="放大"
                aria-label="放大"
              >
                <ZoomInIcon />
              </button>
              <button
                type="button"
                className="md-mermaid-toolbar-btn"
                onClick={zoomReset}
                title="重置"
                aria-label="重置缩放"
              >
                <ResetIcon />
              </button>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="md-mermaid-toolbar-group">
            {mode === 'preview' && hasValidSvg && (
              <>
                <button
                  type="button"
                  className="md-mermaid-toolbar-btn"
                  onClick={toggleFullscreen}
                  title="全屏"
                  aria-label="全屏查看"
                >
                  <FullscreenIcon />
                </button>
                <button
                  type="button"
                  className="md-mermaid-toolbar-btn"
                  onClick={handleDownload}
                  title="下载 PNG"
                  aria-label="下载"
                >
                  <DownloadIcon />
                </button>
              </>
            )}
            {mode === 'code' && (
              <button
                type="button"
                className={`md-mermaid-toolbar-btn${copied ? ' md-mermaid-toolbar-btn--success' : ''}`}
                onClick={handleCopy}
                title={copied ? '已复制' : '复制代码'}
                aria-label={copied ? '已复制' : '复制代码'}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="md-mermaid-content" ref={containerRef}>
        {isLoading ? (
          // Loading 骨架屏
          <div className="md-mermaid-skeleton">
            <div className="md-mermaid-skeleton-box" />
          </div>
        ) : mode === 'preview' && hasValidSvg && renderResult?.svg ? (
          // 图片模式
          <div className="md-mermaid-preview" style={{ overflow: 'hidden' }}>
            <div
              className="md-mermaid-svg-container"
              style={contentStyle}
              dangerouslySetInnerHTML={{ __html: renderResult.svg }}
            />
          </div>
        ) : (
          // 代码模式
          <div className="md-mermaid-code">
            <pre>
              <code className="language-mermaid">{code}</code>
            </pre>
            {/* 错误提示 */}
            {renderResult && !renderResult.success && (
              <div className="md-mermaid-error">
                <span>渲染失败: </span>
                <span>{renderResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 全屏查看器 */}
      {hasValidSvg && renderResult?.svg && (
        <MermaidFullscreenViewer
          svg={renderResult.svg}
          open={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

MermaidBlock.displayName = 'MermaidBlock';
