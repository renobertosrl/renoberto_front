import { useEffect, useRef } from 'react';

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const SIZES = [11, 8, 6, 5, 4, 3];
const LERPS = [1, 0.42, 0.28, 0.19, 0.13, 0.09];

export default function FluidCursor() {
  const dotRefs  = useRef([]);
  const labelRef = useRef(null);
  const posRef   = useRef({ x: -300, y: -300 });

  useEffect(() => {
    if (isTouch()) return;

    const positions = SIZES.map(() => ({ x: -300, y: -300 }));
    let raf;

    const onMove = (e) => { posRef.current = { x: e.clientX, y: e.clientY }; };

    const onOver = (e) => {
      const card = e.target.closest('.project-card');
      document.body.classList.toggle('card-hovered', !!card);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.body.classList.add('fluid-cursor-active');

    const render = () => {
      const { x, y } = posRef.current;

      // Metaball trail
      positions.forEach((p, i) => {
        const t = i === 0 ? posRef.current : positions[i - 1];
        p.x += (t.x - p.x) * LERPS[i];
        p.y += (t.y - p.y) * LERPS[i];
        const el = dotRefs.current[i];
        if (el) el.style.transform = `translate(${p.x - SIZES[i]}px, ${p.y - SIZES[i]}px)`;
      });

      // Card label follows cursor directly
      if (labelRef.current) {
        labelRef.current.style.left = x + 'px';
        labelRef.current.style.top  = y + 'px';
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.body.classList.remove('fluid-cursor-active', 'card-hovered');
    };
  }, []);

  if (isTouch()) return null;

  return (
    <>
      <svg aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, zIndex: -1 }}>
        <defs>
          <filter id="metaball-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -13"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Metaball blob trail */}
      <div
        aria-hidden="true"
        className="cursor-metaballs"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, filter: 'url(#metaball-filter)' }}
      >
        {SIZES.map((r, i) => (
          <div
            key={i}
            ref={el => { dotRefs.current[i] = el; }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: r * 2, height: r * 2,
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: i === 0 ? 0.9 : 0.75,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      {/* "VOIR →" card hover label */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="cursor-label"
      >
        VOIR →
      </div>
    </>
  );
}
