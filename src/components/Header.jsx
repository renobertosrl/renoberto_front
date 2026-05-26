import { useState, useEffect } from 'react';
import Logo from './Logo.jsx';

export default function Header({ route }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [route]);

  const links = [
    { href: '#/portfolio', label: 'Réalisations' },
    { href: '#/services', label: 'Services' },
    { href: '#/about', label: "L'atelier" },
    { href: '#/process', label: 'Démarche' },
    { href: '#/contact', label: 'Contact' },
  ];
  const isActive = (href) => href === '#/' ? route === '#/' : route.startsWith(href);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <a href="#/" className="brand">
            <Logo height={100} />
            <span className="brand__tag">BRUXELLES · EST. 2024</span>
          </a>
          <nav className="nav">
            {links.map(l => (
              <a key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : ''}>{l.label}</a>
            ))}
            <a href="#/contact" className="nav-cta">Demander un devis</a>
          </nav>
          <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
            <span className={`nav-burger__icon ${open ? 'is-open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </header>

      {open && (
        <>
          <button
            className="nav-mobile__backdrop"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div className="nav-mobile__inner">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                className={`nav-mobile__link ${isActive(l.href) ? 'is-active' : ''}`}
              >
                {l.label}
              </a>
            ))}
            <a href="#/contact" className="btn btn--primary nav-mobile__cta">
              Demander un devis →
            </a>
          </div>
        </>
      )}
    </>
  );
}
