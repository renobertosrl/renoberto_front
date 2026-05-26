import CTAFooter from '../components/CTAFooter.jsx';

export default function ProcessPage({ state }) {
  return (
    <>
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 80 }}>
            <span className="eyebrow">Démarche · Du premier appel à la livraison</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 7vw, 96px)', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 24, maxWidth: '14ch' }}>
              Une méthode <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>limpide.</em>
            </h1>
            <p style={{ maxWidth: '52ch', marginTop: 32, color: 'var(--fg-muted)', fontSize: 17, lineHeight: 1.65 }}>
              Cinq étapes, un seul interlocuteur. Nous croyons qu'un beau chantier commence par une promesse claire — et se termine par une réception sans surprise.
            </p>
          </div>
          <div className="process-steps">
            {state.process.map((p, i) => (
              <div key={p.id} className="process-step">
                <span className="process-step__num">0{i + 1}</span>
                <div>
                  <h3 className="process-step__title">{p.title}</h3>
                </div>
                <p className="process-step__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTAFooter />
    </>
  );
}
