export default function CTAFooter() {
  return (
    <section className="section" style={{ background: 'var(--bg-elev)', textAlign: 'center' }}>
      <div className="container">
        <span className="eyebrow no-mark" style={{ justifyContent: 'center', display: 'inline-flex' }}>Parlons de votre projet</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05, marginTop: 24, marginBottom: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Prêt à transformer<br /><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>votre intérieur ?</em>
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/contact" className="btn btn--primary">Demander un devis <span className="arrow">→</span></a>
          <a href="tel:+32497122960" className="btn btn--ghost">+32 497 12 29 60</a>
        </div>
      </div>
    </section>
  );
}
