import { useState, useCallback, useRef, useLayoutEffect, memo } from 'react';
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
 * 图片图标 SVG（使用 CSS 变量控制颜色）
 */
const ImageIcon = () => (
  <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="48" height="36" rx="3" className="md-image-skeleton-icon"/>
    <circle cx="12" cy="10" r="5" className="md-image-skeleton-icon-detail"/>
    <path d="M0 36 L0 24 L16 16 L28 26 L48 12 L48 36 Z" className="md-image-skeleton-icon-detail"/>
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
  className,
  'data-width': dataWidth,
  'data-height': dataHeight,
  ...props
}) => {
  // 判断是否是占位图
  const isPlaceholder = src?.startsWith(PLACEHOLDER_PREFIX);
  
  // 获取真实 src（占位图时为 undefined）
  const realSrc = isPlaceholder ? undefined : src;

  // 解析尺寸
  const width = dataWidth ? Number(dataWidth) : 200;
  const height = dataHeight ? Number(dataHeight) : 120;
  
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

  return (
    <span
      className={`md-image-container ${className || ''}`}
      style={{ width, height }}
    >
      {/* 真实图片 - 始终存在（当有真实 src 时） */}
      {realSrc && (
        <img
          ref={imgRef}
          src={realSrc}
          alt={alt}
          onLoad={handleImageLoad}
          className="md-image"
          {...props}
        />
      )}
      
      {/* Skeleton 覆盖层 - 图片加载完成后消失 */}
      {showSkeleton && (
        <span className="md-image-skeleton">
          <ImageIcon />
        </span>
      )}
    </span>
  );
});

StreamingImage.displayName = 'StreamingImage';
