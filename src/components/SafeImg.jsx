import { useState } from 'react';
import { PLACEHOLDER } from '../data/store.js';

const BLANK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Crect width='4' height='3' fill='%231c1c1c'/%3E%3C/svg%3E";

export default function SafeImg({ src, alt = '', className, style, onClick }) {
  const [phase, setPhase] = useState(0);
  const srcs = [src || PLACEHOLDER, PLACEHOLDER, BLANK];
  const current = srcs[Math.min(phase, srcs.length - 1)];
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={() => setPhase(p => Math.min(p + 1, srcs.length - 1))}
      loading="lazy"
    />
  );
}
