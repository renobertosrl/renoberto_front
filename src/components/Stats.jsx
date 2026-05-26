import { useState, useEffect, useRef } from 'react';

const DEFAULT_STATS = [
  { num: '50+',    label: 'Chantiers livrés en 2 ans' },
  { num: '10 ans', label: "D'expérience sur le terrain" },
  { num: '7 j',    label: 'Pour recevoir votre devis' },
  { num: '10 ans', label: 'Garantie décennale' },
];

function AnimatedStat({ item }) {
  const wrapRef  = useRef(null);
  const countRef = useRef(null);
  const [fired, setFired] = useState(false);

  const match  = item.num.match(/^(\d+)(.*)/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setFired(true); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!fired) return;
    const span = countRef.current;
    if (!span) return;
    const duration = 1600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      span.textContent = Math.round(ease * target);
      if (t < 1) raf = requestAnimationFrame(tick);
      else span.textContent = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fired, target]);

  return (
    <div ref={wrapRef}>
      <div className="stat__num">
        <span ref={countRef}>0</span>
        {suffix && <em>{suffix.trim()}</em>}
      </div>
      <div className="stat__label">{item.label}</div>
    </div>
  );
}

export default function Stats({ state }) {
  const items = state?.content?.stats?.length ? state.content.stats : DEFAULT_STATS;
  return (
    <section className="stats">
      <div className="container">
        <div className="stats__grid">
          {items.map((s, i) => <AnimatedStat key={i} item={s} />)}
        </div>
      </div>
    </section>
  );
}
