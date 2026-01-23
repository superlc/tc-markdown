import React, { useState, useEffect, useRef, useLayoutEffect, type FC } from 'react';
import { createApp, h, type Component as VueComponent } from 'vue';

interface FrameworkTabsProps {
  /** Markdown 内容 */
  content: string;
  /** React 组件 */
  ReactComponent: FC<{ children: string; className?: string; [key: string]: any }>;
  /** Vue 组件 */
  VueComponent: VueComponent;
  /** React 示例代码 */
  reactCode: string;
  /** Vue 示例代码 */
  vueCode: string;
  /** 组件 props */
  componentProps?: Record<string, any>;
}

type TabType = 'react' | 'vue';
type ViewType = 'preview' | 'code';

export const FrameworkTabs: FC<FrameworkTabsProps> = ({
  content,
  ReactComponent,
  VueComponent: VueComp,
  reactCode,
  vueCode,
  componentProps = {},
}) => {
  const [framework, setFramework] = useState<TabType>('react');
  const [view, setView] = useState<ViewType>('preview');
  const vueContainerRef = useRef<HTMLDivElement>(null);
  const vueAppRef = useRef<ReturnType<typeof createApp> | null>(null);
  const [vueKey, setVueKey] = useState(0);

  // 挂载 Vue 组件
  useLayoutEffect(() => {
    if (framework === 'vue' && view === 'preview' && vueContainerRef.current) {
      // 清理旧实例
      if (vueAppRef.current) {
        vueAppRef.current.unmount();
        vueAppRef.current = null;
      }

      // 创建新 Vue 应用
      const app = createApp({
        name: 'VueWrapper',
        setup() {
          return () => h(VueComp, {
            content,
            class: 'markdown-body',
            ...componentProps,
          });
        },
      });

      app.mount(vueContainerRef.current);
      vueAppRef.current = app;
    }
  }, [framework, view, content, VueComp, componentProps, vueKey]);

  // 切换到 Vue 时强制更新
  useEffect(() => {
    if (framework === 'vue') {
      setVueKey((k) => k + 1);
    }
  }, [framework]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (vueAppRef.current) {
        vueAppRef.current.unmount();
        vueAppRef.current = null;
      }
    };
  }, []);

  return (
    <div className="framework-tabs">
      {/* 框架选择 */}
      <div className="tabs-header">
        <div className="framework-tabs-group">
          <button
            className={`tab-btn ${framework === 'react' ? 'active react' : ''}`}
            onClick={() => setFramework('react')}
          >
            <span className="tab-icon">⚛️</span> React
          </button>
          <button
            className={`tab-btn ${framework === 'vue' ? 'active vue' : ''}`}
            onClick={() => setFramework('vue')}
          >
            <span className="tab-icon">🟢</span> Vue
          </button>
        </div>
        <div className="view-tabs-group">
          <button
            className={`view-btn ${view === 'preview' ? 'active' : ''}`}
            onClick={() => setView('preview')}
          >
            预览
          </button>
          <button
            className={`view-btn ${view === 'code' ? 'active' : ''}`}
            onClick={() => setView('code')}
          >
            代码
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="tabs-content">
        {view === 'preview' ? (
          <div className="preview-container">
            {/* React 渲染 */}
            <div style={{ display: framework === 'react' ? 'block' : 'none' }}>
              <ReactComponent className="markdown-body" {...componentProps}>
                {content}
              </ReactComponent>
            </div>
            {/* Vue 渲染容器 */}
            <div 
              ref={vueContainerRef} 
              style={{ display: framework === 'vue' ? 'block' : 'none' }}
            />
          </div>
        ) : (
          <div className="code-container">
            <pre className="code-block">
              <code>{framework === 'react' ? reactCode : vueCode}</code>
            </pre>
          </div>
        )}
      </div>

      <style>{`
        .framework-tabs {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        
        .tabs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .framework-tabs-group,
        .view-tabs-group {
          display: flex;
          gap: 4px;
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          background: #e5e7eb;
        }
        
        .tab-btn.active {
          color: #fff;
        }
        
        .tab-btn.active.react {
          background: #087ea4;
        }
        
        .tab-btn.active.vue {
          background: #42b883;
        }
        
        .tab-icon {
          font-size: 16px;
        }
        
        .view-btn {
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .view-btn:first-child {
          border-radius: 6px 0 0 6px;
        }
        
        .view-btn:last-child {
          border-radius: 0 6px 6px 0;
          border-left: none;
        }
        
        .view-btn.active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
        }
        
        .tabs-content {
          min-height: 200px;
        }
        
        .preview-container {
          padding: 24px;
        }
        
        .code-container {
          background: #1e1e1e;
          padding: 0;
          margin: 0;
        }
        
        .code-block {
          margin: 0;
          padding: 20px;
          overflow-x: auto;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #d4d4d4;
          background: transparent;
        }
        
        .code-block code {
          white-space: pre;
        }
        
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }
        
        .markdown-body h1 { font-size: 2em; margin: 0.67em 0; font-weight: 600; }
        .markdown-body h2 { font-size: 1.5em; margin: 0.83em 0; font-weight: 600; }
        .markdown-body h3 { font-size: 1.17em; margin: 1em 0; font-weight: 600; }
        .markdown-body p { margin: 1em 0; }
        .markdown-body ul, .markdown-body ol { margin: 1em 0; padding-left: 2em; }
        .markdown-body li { margin: 0.5em 0; }
        .markdown-body code { 
          background: #f3f4f6; 
          padding: 2px 6px; 
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
        }
        .markdown-body pre { 
          background: #1e1e1e; 
          padding: 16px; 
          border-radius: 8px; 
          overflow-x: auto;
        }
        .markdown-body pre code { 
          background: transparent; 
          padding: 0;
          color: #d4d4d4;
        }
        .markdown-body blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        .markdown-body th {
          background: #f9fafb;
          font-weight: 600;
        }
        .markdown-body a {
          color: #4f46e5;
          text-decoration: none;
        }
        .markdown-body a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
