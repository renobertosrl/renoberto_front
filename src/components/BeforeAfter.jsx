import { useRef, useCallback, useEffect } from 'react';
import SafeImg from './SafeImg.jsx';

export default function BeforeAfter({ before, after, labels = ['Avant', 'Après'] }) {
  const containerRef = useRef(null);
  const afterWrapRef = useRef(null);
  const handleRef = useRef(null);
  const dragging = useRef(false);
  const posRef = useRef(50);

  const applyPos = useCallback((p) => {
    p = Math.max(1, Math.min(99, p));
    posRef.current = p;
    if (afterWrapRef.current) afterWrapRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    if (handleRef.current) handleRef.current.style.left = `${p}%`;
  }, []);

  const moveFromClientX = useCallback((clientX) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    applyPos(((clientX - r.left) / r.width) * 100);
  }, [applyPos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      if (e.cancelable) e.preventDefault();
      moveFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [moveFromClientX]);

  const onStart = (clientX) => { dragging.current = true; moveFromClientX(clientX); };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') applyPos(posRef.current - step);
    else if (e.key === 'ArrowRight') applyPos(posRef.current + step);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="ba"
      tabIndex={0}
      role="slider"
      aria-label="Comparaison avant / après"
      aria-valuenow={50}
      aria-valuemin={0}
      aria-valuemax={100}
      onMouseDown={(e) => { e.preventDefault(); onStart(e.clientX); }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onKeyDown={onKeyDown}
    >
      <SafeImg src={before} alt={labels[0]} className="ba__img" />
      <div ref={afterWrapRef} className="ba__after-wrap" style={{ clipPath: 'inset(0 50% 0 0)' }}>
        <SafeImg src={after} alt={labels[1]} className="ba__img" />
      </div>
      <div className="ba__label ba__label--before">{labels[0]}</div>
      <div className="ba__label ba__label--after">{labels[1]}</div>
      <div ref={handleRef} className="ba__handle" style={{ left: '50%' }}>
        <div className="ba__handle-btn">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <path d="M6 1L1 7L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 1L19 7L14 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
