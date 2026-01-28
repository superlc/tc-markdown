import type { Element } from 'hast';
import type { BlockInfo, BlockType } from './types';

/**
 * 缓存条目
 */
interface CacheEntry {
  source: string;
  hast: Element;
  hash: string;
}

/**
 * 简单的字符串 hash 函数
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 8).padStart(8, '0');
}

/**
 * 块缓存管理器
 * 用于缓存已稳定块的 HAST 节点，避免重复解析
 */
export class BlockCache {
  /** 按位置索引的缓存 */
  private cache: Map<number, CacheEntry> = new Map();
  
  /** 缓存命中次数 */
  private hits = 0;
  
  /** 缓存未命中次数 */
  private misses = 0;

  /**
   * 生成块的 key
   * 仅使用 index，确保流式输入和状态变化时组件实例保持稳定
   * memo 的比较函数会决定是否跳过重渲染
   */
  generateKey(index: number, _source: string, _stable: boolean): string {
    return `block-${index}`;
  }

  /**
   * 尝试从缓存获取块的 HAST
   */
  get(index: number, source: string): Element | null {
    const entry = this.cache.get(index);
    if (entry && entry.source === source) {
      this.hits++;
      return entry.hast;
    }
    this.misses++;
    return null;
  }

  /**
   * 缓存块的 HAST
   */
  set(index: number, source: string, hast: Element): void {
    this.cache.set(index, {
      source,
      hast,
      hash: simpleHash(source),
    });
  }

  /**
   * 检查是否有缓存
   */
  has(index: number, source: string): boolean {
    const entry = this.cache.get(index);
    return entry !== undefined && entry.source === source;
  }

  /**
   * 清除指定索引之后的所有缓存
   */
  invalidateFrom(index: number): void {
    for (const key of this.cache.keys()) {
      if (key >= index) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取缓存统计
   */
  getStats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses };
  }

  /**
   * 创建带 key 的块信息
   */
  createBlockInfo(
    index: number,
    source: string,
    type: BlockType,
    stable: boolean,
    hast: Element | null
  ): BlockInfo {
    return {
      key: this.generateKey(index, source, stable),
      source,
      stable,
      index,
      type,
      hast,
    };
  }
}
