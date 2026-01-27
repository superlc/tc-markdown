import React, { useState, useCallback, useRef, useLayoutEffect, memo, CSSProperties } from 'react';
import type { FC, ImgHTMLAttributes } from 'react';

/**
 * 图片加载完成后延时隐藏 skeleton 的时间（毫秒）
 */
const HIDE_SKELETON_DELAY = 16;

/**
 * 占位图 data URI 前缀（用于识别占位图）
 */
const PLACEHOLDER_PREFIX = 'data:image/svg+xml,';

/**
 * 默认占位图样式 - 覆盖在图片上方
 */
const SKELETON_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#e8e8e8',
  backgroundImage: 'linear-gradient(90deg, #e8e8e8 0%, #f5f5f5 50%, #e8e8e8 100%)',
  backgroundSize: '200% 100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  zIndex: 1,
  pointerEvents: 'none',
};

/**
 * 图片图标 SVG
 */
const ImageIcon = () => (
  <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="48" height="36" rx="3" fill="#bdbdbd"/>
    <circle cx="12" cy="10" r="5" fill="#9e9e9e"/>
    <path d="M0 36 L0 24 L16 16 L28 26 L48 12 L48 36 Z" fill="#9e9e9e"/>
  </svg>
);

interface StreamingImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  'data-width'?: number | string;
  'data-height'?: number | string;
}

/**
 * 流式图片组件
 * 占位容器覆盖在图片上方，图片加载完成后直接移除
 * 
 * 关键设计：
 * 1. 使用 img.complete 同步检测浏览器缓存中的图片
 * 2. 使用 useLayoutEffect 在绘制前同步检查图片状态
 * 3. 始终初始显示 skeleton，避免组件重建时闪烁
 */
export const StreamingImage: FC<StreamingImageProps> = memo(({
  src,
  alt,
  style,
  'data-width': dataWidth,
  'data-height': dataHeight,
  ...props
}) => {
  // 判断是否是占位图
  const isPlaceholder = src?.startsWith(PLACEHOLDER_PREFIX);
  
  // 获取真实 src（占位图时为 undefined）
  const realSrc = isPlaceholder ? undefined : src;

  // 解析尺寸
  const width = dataWidth ? Number(dataWidth) : undefined;
  const height = dataHeight ? Number(dataHeight) : undefined;
  
  // 是否显示 skeleton（始终初始显示，避免组件重建时闪烁）
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // 图片元素引用
  const imgRef = useRef<HTMLImageElement>(null);
  
  // 延时器引用
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 使用 useLayoutEffect 在绘制前同步检查图片状态
  // 如果图片已在浏览器缓存中，可以立即隐藏 skeleton
  useLayoutEffect(() => {
    if (imgRef.current && realSrc) {
      if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setShowSkeleton(false);
      }
    }
  }, [realSrc]);

  // 图片加载完成回调
  const handleImageLoad = useCallback(() => {
    // 清理之前的延时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // 延时后隐藏 skeleton
    hideTimeoutRef.current = setTimeout(() => {
      setShowSkeleton(false);
    }, HIDE_SKELETON_DELAY);
  }, []);

  // 容器样式
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'block',
    width: width || 200,
    height: height || 120,
    borderRadius: '6px',
    overflow: 'hidden',
    ...style,
  };

  return (
    <span style={containerStyle}>
      {/* 真实图片 - 始终存在（当有真实 src 时） */}
      {realSrc && (
        <img
          ref={imgRef}
          src={realSrc}
          alt={alt}
          onLoad={handleImageLoad}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          {...props}
        />
      )}
      
      {/* Skeleton 覆盖层 - 图片加载完成后消失 */}
      {showSkeleton && (
        <div className="streaming-image-skeleton" style={SKELETON_STYLE}>
          <ImageIcon />
          <style>{`
            .streaming-image-skeleton {
              animation: streaming-image-shimmer 1.5s infinite;
            }
            @keyframes streaming-image-shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
    </span>
  );
});

StreamingImage.displayName = 'StreamingImage';
