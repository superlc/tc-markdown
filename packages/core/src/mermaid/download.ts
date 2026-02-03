/**
 * Mermaid 图表下载工具
 * SVG → Canvas → PNG
 */

export interface DownloadOptions {
  /** 文件名（不含扩展名） */
  filename?: string;
  /** 背景色，默认透明 */
  backgroundColor?: string;
  /** 缩放比例，默认 2（提高清晰度） */
  scale?: number;
  /** 内边距 */
  padding?: number;
}

/**
 * 将 SVG 字符串转换为 PNG Blob
 */
export async function svgToPngBlob(
  svgString: string,
  options: DownloadOptions = {}
): Promise<Blob> {
  const { backgroundColor = 'transparent', scale = 2, padding = 20 } = options;

  return new Promise((resolve, reject) => {
    // 创建临时容器解析 SVG 尺寸
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = svgString;
    document.body.appendChild(tempDiv);
    const svgElement = tempDiv.querySelector('svg');

    if (!svgElement) {
      document.body.removeChild(tempDiv);
      reject(new Error('Invalid SVG string'));
      return;
    }

    // 获取 SVG 尺寸（优先使用 viewBox，然后尝试 getBoundingClientRect）
    let width = 800;
    let height = 600;

    // 1. 尝试从 viewBox 获取尺寸
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }

    // 2. 尝试从 width/height 属性获取（处理相对长度异常）
    if (!viewBox) {
      try {
        const widthAttr = svgElement.getAttribute('width');
        const heightAttr = svgElement.getAttribute('height');
        if (widthAttr && !widthAttr.includes('%')) {
          const parsedWidth = parseFloat(widthAttr);
          if (!isNaN(parsedWidth) && parsedWidth > 0) width = parsedWidth;
        }
        if (heightAttr && !heightAttr.includes('%')) {
          const parsedHeight = parseFloat(heightAttr);
          if (!isNaN(parsedHeight) && parsedHeight > 0) height = parsedHeight;
        }
      } catch {
        // 忽略解析错误
      }
    }

    // 3. 最后使用 getBoundingClientRect 作为后备
    if (width === 800 && height === 600) {
      const bbox = svgElement.getBoundingClientRect();
      if (bbox.width > 0 && bbox.height > 0) {
        width = bbox.width;
        height = bbox.height;
      }
    }

    // 移除临时容器
    document.body.removeChild(tempDiv);

    // 克隆 SVG 并设置明确的尺寸
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));
    if (!viewBox) {
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // 创建 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // 设置 canvas 尺寸（含内边距和缩放）
    const canvasWidth = (width + padding * 2) * scale;
    const canvasHeight = (height + padding * 2) * scale;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 填充背景
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 创建 Image 加载 SVG
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, padding, padding, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG as image'));
    };

    // 将克隆的 SVG 转为 base64 Data URL（避免 tainted canvas 问题）
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const base64 = btoa(unescape(encodeURIComponent(svgData)));
    img.src = `data:image/svg+xml;base64,${base64}`;
  });
}

/**
 * 下载 PNG 图片
 */
export async function downloadAsPng(
  svgString: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { filename = `mermaid-chart-${Date.now()}` } = options;

  const blob = await svgToPngBlob(svgString, options);

  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 下载 SVG 文件
 */
export function downloadAsSvg(
  svgString: string,
  options: DownloadOptions = {}
): void {
  const { filename = `mermaid-chart-${Date.now()}` } = options;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
