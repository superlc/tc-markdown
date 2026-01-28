import React, { useEffect, useRef, useState } from 'react';
import { createApp, type Component as VueComponent } from 'vue';

interface VueRendererProps {
  /** Vue 组件 */
  component: VueComponent;
  /** 传递给 Vue 组件的 props */
  props: Record<string, unknown>;
}

/**
 * 在 React 中渲染 Vue 组件的包装器
 */
export const VueRenderer: React.FC<VueRendererProps> = ({ component, props: vueProps }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ReturnType<typeof createApp> | null>(null);
  const [mounted, setMounted] = useState(false);

  // 确保 DOM 已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // 清理旧实例
    if (appRef.current) {
      appRef.current.unmount();
      appRef.current = null;
    }

    // 清空容器
    containerRef.current.innerHTML = '';

    // 创建挂载点
    const mountEl = document.createElement('div');
    containerRef.current.appendChild(mountEl);

    // 创建 Vue 应用
    const app = createApp(component, vueProps);
    app.mount(mountEl);
    appRef.current = app;

    return () => {
      if (appRef.current) {
        appRef.current.unmount();
        appRef.current = null;
      }
    };
  }, [mounted, component, vueProps]);

  return <div ref={containerRef} />;
};
