/**
 * Mermaid 图表块组件
 * 支持图片/代码切换、缩放、全屏、下载
 * 支持流式渲染优化（延迟渲染 + 保留上次有效结果）
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

// 流式渲染配置
const STREAM_RENDER_DELAY = 150; // 流式状态下的渲染延迟（ms）

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
  streamStatus = 'done',
}) => {
  const [mode, setMode] = useState<ViewMode>('preview');
  const [renderResult, setRenderResult] = useState<MermaidRenderResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // 用于跟踪主题变化（支持系统偏好和 CSS 类名切换）
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => detectColorScheme());

  // 流式渲染优化：保留上次有效的 SVG
  const lastValidSvgRef = useRef<string | null>(null);
  // 延迟渲染定时器
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 用于存储最新的 code 和 streamStatus，供定时器回调使用
  const latestCodeRef = useRef(code);
  const latestStreamStatusRef = useRef(streamStatus);
  latestCodeRef.current = code;
  latestStreamStatusRef.current = streamStatus;

  // 渲染 Mermaid（带流式优化）
  useEffect(() => {
    const doRender = async (renderCode: string) => {
      console.log('[MermaidBlock] doRender start', { codeLength: renderCode.length });

      const renderer = getRenderer(theme);
      const result = await renderer.render(renderCode);

      // 获取当前最新的 streamStatus
      const currentStreamStatus = latestStreamStatusRef.current;

      console.log('[MermaidBlock] render result', {
        success: result.success,
        hasSvg: !!result.svg,
        error: result.error,
        currentStreamStatus,
      });

      if (result.success && result.svg) {
        // 渲染成功，更新结果并缓存有效 SVG
        lastValidSvgRef.current = result.svg;
        setRenderResult(result);
        setIsLoading(false);
        // 渲染成功时切换到预览模式
        setMode('preview');
        console.log('[MermaidBlock] render success, cached SVG');
      } else {
        // 渲染失败
        if (currentStreamStatus === 'loading') {
          // 流式输入中：尝试使用缓存，否则保持 loading 状态
          if (lastValidSvgRef.current) {
            setRenderResult({
              success: true,
              svg: lastValidSvgRef.current,
            });
            setIsLoading(false);
            console.log('[MermaidBlock] render failed, using cache');
          } else {
            // 无缓存，保持 loading 状态，不切换到代码模式
            console.log('[MermaidBlock] render failed, no cache, keep loading');
          }
        } else {
          // 非流式：显示错误并切换到代码模式
          setRenderResult(result);
          setIsLoading(false);
          setMode('code');
          console.log('[MermaidBlock] render failed, showing error');
        }
      }
    };

    console.log('[MermaidBlock] useEffect triggered', {
      streamStatus,
      codeLength: code.length,
      hasTimer: !!renderTimerRef.current,
      hasCache: !!lastValidSvgRef.current,
    });

    if (streamStatus === 'loading') {
      // 流式输入中：使用节流，只有当没有定时器时才设置新的
      if (!renderTimerRef.current) {
        // 流式状态下有缓存时，不显示 loading
        if (!lastValidSvgRef.current) {
          setIsLoading(true);
        }
        console.log('[MermaidBlock] setting timer');
        renderTimerRef.current = setTimeout(() => {
          console.log('[MermaidBlock] timer fired, rendering with latest code');
          renderTimerRef.current = null;
          // 使用最新的 code 进行渲染
          doRender(latestCodeRef.current);
        }, STREAM_RENDER_DELAY);
      } else {
        console.log('[MermaidBlock] timer already exists, skipping');
      }
    } else {
      // 流式完成或非流式：清除定时器并立即渲染
      console.log('[MermaidBlock] immediate render (not loading)');
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
        renderTimerRef.current = null;
      }
      setIsLoading(true);
      doRender(code);
    }

    // 注意：不在 cleanup 中取消定时器，让它能够执行
  }, [code, theme, colorScheme, streamStatus]);

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
            {/* 错误提示 - 仅在非流式或流式完成时显示 */}
            {renderResult && !renderResult.success && streamStatus === 'done' && (
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
