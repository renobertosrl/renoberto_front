import CTAFooter from '../components/CTAFooter.jsx';

export default function ServicesPage({ state }) {
  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 80 }}>
          <span className="eyebrow">Services &amp; tarifs indicatifs</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 7vw, 96px)', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 24, maxWidth: '14ch' }}>
            Cinq métiers, <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>une exigence.</em>
          </h1>
          <p style={{ maxWidth: '52ch', marginTop: 32, color: 'var(--fg-muted)', fontSize: 17, lineHeight: 1.65 }}>
            Tous nos chantiers sont menés en interne par notre équipe d'artisans, sans sous-traitance. Les tarifs ci-dessous sont indicatifs : un devis détaillé vous est remis sous 7 jours après visite.
          </p>
        </div>
        <div className="services-list">
          {state.services.map((s, i) => {
            const cat = state.categories.find(c => c.id === s.cat);
            return (
              <div key={s.id} className="service-row">
                <span className="service-row__num">0{i + 1}</span>
                <div>
                  <div className="service-row__title">{s.title}</div>
                  <div className="mono muted" style={{ marginTop: 8 }}>{cat?.name}</div>
                </div>
                <div className="service-row__desc">{s.desc}</div>
                <div className="service-row__price"><strong>{s.price}</strong></div>
                <div className="service-row__cta">
                  <a href="#/contact" className="btn btn--ghost btn--small">Devis</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CTAFooter />
    </section>
  );
}
