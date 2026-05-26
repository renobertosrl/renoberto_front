import { useState, useMemo } from 'react';
import ProjectsMosaic from '../components/ProjectsMosaic.jsx';

export default function PortfolioPage({ state }) {
  const [active, setActive] = useState('all');

  const filtered = useMemo(() => {
    if (active === 'all') return state.projects;
    return state.projects.filter(p => p.category === active);
  }, [active, state.projects]);

  const catCounts = useMemo(() => {
    const m = { all: state.projects.length };
    state.categories.forEach(c => { m[c.id] = state.projects.filter(p => p.category === c.id).length; });
    return m;
  }, [state]);

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 64 }}>
          <span className="eyebrow">Portfolio · {state.projects.length} réalisations</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 7vw, 96px)', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 24, maxWidth: '14ch' }}>
            Chaque chantier, <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>une histoire.</em>
          </h1>
        </div>
        <div className="cat-filters">
          <button className={`cat-chip ${active === 'all' ? 'is-active' : ''}`} onClick={() => setActive('all')}>
            Tout <span className="cat-chip__count">{catCounts.all}</span>
          </button>
          {state.categories.map(c => (
            <button key={c.id} className={`cat-chip ${active === c.id ? 'is-active' : ''}`} onClick={() => setActive(c.id)}>
              {c.name} <span className="cat-chip__count">{catCounts[c.id] || 0}</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Aucun projet pour cette catégorie pour le moment.
          </div>
        ) : (
          <ProjectsMosaic projects={filtered} state={state} />
        )}
      </div>
    </section>
  );
}
