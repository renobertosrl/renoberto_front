import { useRef, useCallback } from 'react';

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export function useCardMagnet(intensity = 10) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    if (isTouch()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    el.style.transform = `perspective(700px) rotateX(${-y * intensity * 0.5}deg) rotateY(${x * intensity}deg) translateZ(12px)`;
    el.style.transition = 'transform 0.06s linear';
    el.style.zIndex = '2';
  }, [intensity]);

  const onMouseLeave = useCallback(() => {
    if (isTouch()) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.zIndex = '';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
