export default function Footer({ state }) {
  const c = state.content.contact;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-tagline">
              Le geste juste, <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>la finition parfaite.</em>
            </div>
            <p className="muted" style={{ fontSize: 13, maxWidth: '32ch' }}>
              Renoberto — artisans rénovateurs à Bruxelles &amp; Brabant depuis 2024. Devis gratuit sous 7 jours, garantie décennale.
            </p>
          </div>
          <div className="footer-col">
            <h4>Naviguer</h4>
            <ul>
              <li><a href="#/portfolio">Réalisations</a></li>
              <li><a href="#/services">Services</a></li>
              <li><a href="#/about">L'atelier</a></li>
              <li><a href="#/process">Démarche</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href={`tel:${c.phone}`}>{c.phone}</a></li>
              <li><a href={`mailto:${c.email}`}>{c.email}</a></li>
              <li>{c.address}, {c.city}</li>
              <li>{c.hours}</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Suivez-nous</h4>
            <ul>
              <li><a href={c.instagram ? `https://www.instagram.com/${c.instagram.replace('@', '')}/` : '#'}>Instagram {c.instagram}</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#/admin">Admin</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Renoberto SRL — Tous droits réservés</span>
          <span>TVA BE 0812.345.678 · Régistre des entreprises BE</span>
        </div>
      </div>
    </footer>
  );
}
