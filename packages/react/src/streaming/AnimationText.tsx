import { useEffect, useMemo, useRef, useState, memo } from 'react';

export interface AnimationConfig {
  /**
   * 淡入动画持续时间（毫秒）
   * @default 200
   */
  fadeDuration?: number;
  /**
   * 动画缓动函数
   * @default 'ease-in-out'
   */
  easing?: string;
}

export interface AnimationTextProps {
  text: string;
  animationConfig?: AnimationConfig;
}

/**
 * 带淡入动画的文本组件
 * 追踪文本变化，为新增部分添加淡入效果
 */
const AnimationText = memo<AnimationTextProps>((props) => {
  const { text, animationConfig } = props;
  const { fadeDuration = 200, easing = 'ease-in-out' } = animationConfig || {};
  const [chunks, setChunks] = useState<string[]>([]);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (text === prevTextRef.current) return;

    // 如果新文本不是前文的延续，重置
    if (!(prevTextRef.current && text.indexOf(prevTextRef.current) === 0)) {
      setChunks([text]);
      prevTextRef.current = text;
      return;
    }

    // 追加新增部分
    const newText = text.slice(prevTextRef.current.length);
    if (!newText) return;

    setChunks((prev) => [...prev, newText]);
    prevTextRef.current = text;
  }, [text]);

  const animationStyle = useMemo(
    () => ({
      animation: `md-fade-in ${fadeDuration}ms ${easing} forwards`,
      color: 'inherit',
    }),
    [fadeDuration, easing]
  );

  return (
    <>
      {chunks.map((chunk, index) => (
        <span style={animationStyle} key={`animation-text-${index}`}>
          {chunk}
        </span>
      ))}
    </>
  );
});

AnimationText.displayName = 'AnimationText';

export default AnimationText;

/**
 * CSS keyframes（需要注入到页面）
 */
export const ANIMATION_KEYFRAMES = `
@keyframes md-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
`;
