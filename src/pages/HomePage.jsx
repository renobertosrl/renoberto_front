import { useRef, useEffect } from 'react';
import Stats from '../components/Stats.jsx';
import ProjectsMosaic from '../components/ProjectsMosaic.jsx';
import CTAFooter from '../components/CTAFooter.jsx';

function useParallax(factor = 0.22) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.scrollY * factor}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [factor]);
  return ref;
}

export function HomeEditorial({ state }) {
  const featured = state.projects.filter(p => p.featured);
  const hero = featured[0] || state.projects[0];
  const bgImage = state.content?.heroImage || hero?.cover;
  const parallaxRef = useParallax(0.22);
  return (
    <>
      <section className="hero-editorial">
        <div className="hero-editorial__bg">
          <div className="hero-parallax" ref={parallaxRef}>
            <div className="hero-bg-img" style={{ backgroundImage: `url(${bgImage})` }} />
          </div>
        </div>
        <div className="hero-editorial__inner">
          <span className="eyebrow" style={{ color: '#d8d4cd' }}>Artisans rénovateurs · Bruxelles &amp; Brabant</span>
          <h1 style={{ marginTop: 28 }}>
            La rénovation,<br /><em>au millimètre près.</em>
          </h1>
          <div className="hero-editorial__meta">
            <p>
              Carrelage, peinture, parquet, salles de bain — depuis 2024, Renoberto livre des intérieurs durables, exécutés par des artisans passionnés.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="#/portfolio" className="btn btn--primary">Voir nos réalisations <span className="arrow">→</span></a>
              <a href="#/contact" className="btn btn--ghost">Devis gratuit</a>
            </div>
          </div>
        </div>
      </section>
      <Stats state={state} />
      <FeaturedSection state={state} />
      <ServicesPreview state={state} />
      <TestimonialsPreview state={state} />
      <CTAFooter />
    </>
  );
}

export function HomeGrid({ state }) {
  const featured = state.projects.filter(p => p.featured);
  const rest = state.projects.filter(p => !p.featured).slice(0, 4);
  const all = [...featured, ...rest];
  return (
    <>
      <section className="hero-grid">
        <div className="container">
          <div className="hero-grid__head">
            <div>
              <span className="eyebrow">Portfolio · 2024 — 2025</span>
              <h1 style={{ marginTop: 20 }}>
                Le geste juste,<br /><em>la finition parfaite.</em>
              </h1>
            </div>
            <p>
              Des intérieurs livrés clé en main par une équipe d'artisans à Bruxelles. Sélection des chantiers récents.
            </p>
          </div>
          <ProjectsMosaic projects={all} state={state} />
        </div>
      </section>
      <Stats state={state} />
      <ServicesPreview state={state} />
      <CTAFooter />
    </>
  );
}

export function HomeSplit({ state }) {
  const hero = state.projects.find(p => p.featured) || state.projects[0];
  const bgImage = state.content?.heroImage || hero?.cover;
  const parallaxRef = useParallax(0.18);
  return (
    <>
      <section className="hero-split">
        <div className="hero-split__text">
          <span className="eyebrow">Renoberto · Bruxelles</span>
          <h1>
            Une rénovation <em>cousue main,</em> du devis aux finitions.
          </h1>
          <p>
            Artisans carreleurs, peintres, plaquistes, parqueteurs — nous menons votre projet de la conception à la livraison clé en main. Garantie décennale, devis transparent, chantier impeccable.
          </p>
          <div className="hero-split__actions">
            <a href="#/portfolio" className="btn btn--primary">Nos réalisations <span className="arrow">→</span></a>
            <a href="#/contact" className="btn btn--ghost">Demander un devis</a>
          </div>
        </div>
        <div className="hero-split__image">
          <div className="hero-parallax" ref={parallaxRef}>
            <div className="hero-bg-img" style={{ backgroundImage: `url(${bgImage})` }} />
          </div>
        </div>
      </section>
      <Stats state={state} />
      <FeaturedSection state={state} />
      <ServicesPreview state={state} />
      <TestimonialsPreview state={state} />
      <CTAFooter />
    </>
  );
}

function FeaturedSection({ state }) {
  const featured = state.projects.filter(p => p.featured);
  if (!featured.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Sélection</span>
            <h2 className="section-head__title" style={{ marginTop: 20 }}>
              Réalisations <em>récentes</em>
            </h2>
          </div>
          <a href="#/portfolio" className="btn btn--ghost">Voir tout le portfolio <span className="arrow">→</span></a>
        </div>
        <ProjectsMosaic projects={featured} state={state} />
      </div>
    </section>
  );
}

function ServicesPreview({ state }) {
  return (
    <section className="section" style={{ background: 'var(--bg-elev)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Nos métiers</span>
            <h2 className="section-head__title" style={{ marginTop: 20 }}>
              Cinq <em>spécialités,</em> une seule équipe.
            </h2>
          </div>
          <p className="section-head__lead">
            Carrelage, peinture, plâtrerie, parquet, salles de bain — nous coordonnons les corps de métier en interne pour garantir un chantier sans accroc.
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
    </section>
  );
}

function TestimonialsPreview({ state }) {
  const items = state.testimonials.slice(0, 4);
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Témoignages</span>
            <h2 className="section-head__title" style={{ marginTop: 20 }}>
              Ce qu'en disent <em>nos clients.</em>
            </h2>
          </div>
        </div>
        <div className="testimonials-grid">
          {items.map(t => (
            <div key={t.id} className="testimonial">
              <p className="testimonial__quote">{t.quote}</p>
              <div className="testimonial__author">
                <span className="testimonial__name">{t.name}</span>
                <span className="testimonial__loc">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
