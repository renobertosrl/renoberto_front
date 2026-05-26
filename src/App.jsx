import { useState, useEffect, useCallback } from 'react';
import * as api from './services/api.js';
import { DEFAULT_STATE } from './data/seed.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { HomeEditorial, HomeGrid, HomeSplit } from './pages/HomePage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProcessPage from './pages/ProcessPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminApp from './admin/index.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakButton } from './tweaks/TweaksPanel.jsx';
import TweaksFab from './tweaks/TweaksFab.jsx';
import { ToastProvider } from './components/Toast.jsx';
import FluidCursor from './components/FluidCursor.jsx';

const TWEAK_DEFAULTS = {
  theme: 'light',
  homeStyle: 'editorial',
  typeface: 'editorial',
};

const TYPEFACES = {
  editorial: {
    display: '"Cormorant Garamond", "Times New Roman", serif',
    sans: '"Manrope", -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  modern: {
    display: '"Playfair Display", Georgia, serif',
    sans: '"DM Sans", -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  classic: {
    display: '"Libre Caslon Text", Georgia, serif',
    sans: '"Work Sans", -apple-system, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
};

const EMPTY_STATE = {
  projects: [], categories: [], services: [], testimonials: [],
  team: [], process: [], content: { about: {}, contact: {} },
  messages: [], auth: null,
};

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [route, (r) => { window.location.hash = r; }];
}

export default function App() {
  const [state, setStateRaw] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route] = useHashRoute();

  // Load public data from API (fall back to seed data if server is unreachable)
  useEffect(() => {
    api.getState()
      .then(data => setStateRaw(s => ({ ...s, ...data })))
      .catch(() => setStateRaw(s => ({ ...s, ...DEFAULT_STATE })))
      .finally(() => setLoading(false));
  }, []);

  // Restore auth session from stored JWT
  useEffect(() => {
    if (!api.getToken()) return;
    api.getMe()
      .then(user => {
        setStateRaw(s => ({ ...s, auth: user }));
        return api.getMessages();
      })
      .then(messages => setStateRaw(s => ({ ...s, messages })))
      .catch(() => api.logout());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    const tf = TYPEFACES[t.typeface] || TYPEFACES.editorial;
    document.documentElement.style.setProperty('--font-display', tf.display);
    document.documentElement.style.setProperty('--font-sans', tf.sans);
    document.documentElement.style.setProperty('--font-mono', tf.mono);
  }, [t.theme, t.typeface]);

  const setState = useCallback((updater) => {
    setStateRaw(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  const path = route.replace(/^#\/?/, '');
  const segments = path.split('/').filter(Boolean);
  const isAdmin = segments[0] === 'admin';

  useEffect(() => {
    document.body.classList.toggle('admin-body', isAdmin);
  }, [isAdmin]);

  // Scroll reveal
  useEffect(() => {
    if (loading || isAdmin) return;
    let io;
    const t = setTimeout(() => {
      io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.section-head, .card-block, .team-card, .about-image, .contact-row, .kpi, .service-row, .testimonial').forEach(el => {
        el.classList.add('reveal');
        io.observe(el);
      });
    }, 100);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [route, loading, isAdmin]);

  const PAGE_TITLES = {
    '':          'Renoberto · Artisans rénovateurs Bruxelles',
    'portfolio': 'Portfolio · Renoberto',
    'services':  'Services · Renoberto',
    'about':     "L'atelier · Renoberto",
    'process':   'Notre démarche · Renoberto',
    'contact':   'Contact · Renoberto',
    'admin':     'Admin · Renoberto',
  };

  useEffect(() => {
    const title = PAGE_TITLES[segments[0] ?? ''] ?? 'Renoberto';
    if (segments[0] !== 'project') document.title = title;
  }, [segments[0]]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="mono muted" style={{ letterSpacing: '0.15em', fontSize: 11 }}>RENOBERTO ·</span>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <ToastProvider>
        <AdminApp state={state} setState={setState} />
        <AdminTweaks t={t} setTweak={setTweak} />
        <TweaksFab />
      </ToastProvider>
    );
  }

  let page;
  if (!segments.length) {
    if (t.homeStyle === 'grid') page = <HomeGrid state={state} />;
    else if (t.homeStyle === 'split') page = <HomeSplit state={state} />;
    else page = <HomeEditorial state={state} />;
  } else if (segments[0] === 'portfolio') {
    page = <PortfolioPage state={state} />;
  } else if (segments[0] === 'project' && segments[1]) {
    page = <ProjectPage slug={segments[1]} state={state} />;
  } else if (segments[0] === 'services') {
    page = <ServicesPage state={state} />;
  } else if (segments[0] === 'about') {
    page = <AboutPage state={state} />;
  } else if (segments[0] === 'process') {
    page = <ProcessPage state={state} />;
  } else if (segments[0] === 'contact') {
    page = <ContactPage state={state} />;
  } else {
    page = (
      <div className="section">
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64 }}>404</h1>
          <p className="muted" style={{ marginTop: 16 }}>Cette page n'existe pas.</p>
          <a href="#/" className="btn btn--ghost" style={{ marginTop: 24 }}>← Accueil</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <FluidCursor />
      <Header route={route} />
      {page}
      <Footer state={state} />
      <PublicTweaks t={t} setTweak={setTweak} />
    </>
  );
}

function PublicTweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Style page d'accueil" />
      <TweakRadio
        label="Hero"
        value={t.homeStyle}
        options={[
          { value: 'editorial', label: 'Édito' },
          { value: 'grid', label: 'Grille' },
          { value: 'split', label: 'Split' },
        ]}
        onChange={(v) => setTweak('homeStyle', v)}
      />
      <TweakSection label="Thème de couleurs" />
      <TweakRadio
        label="Palette"
        value={t.theme}
        options={[
          { value: 'dark', label: 'Sombre' },
          { value: 'light', label: 'Clair' },
          { value: 'stone', label: 'Pierre' },
        ]}
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakSection label="Typographie" />
      <TweakSelect
        label="Polices"
        value={t.typeface}
        options={Object.entries(TYPEFACES).map(([value]) => ({
          value,
          label: { editorial: 'Éditorial · Cormorant + Manrope', modern: 'Moderne · Playfair + DM Sans', classic: 'Classique · Caslon + Work Sans' }[value],
        }))}
        onChange={(v) => setTweak('typeface', v)}
      />
      <TweakSection label="Administration" />
      <TweakButton label="Aller au panneau admin" onClick={() => { window.location.hash = '#/admin'; }} />
    </TweaksPanel>
  );
}

function AdminTweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Thème" />
      <TweakRadio
        label="Palette"
        value={t.theme}
        options={[
          { value: 'dark', label: 'Sombre' },
          { value: 'light', label: 'Clair' },
          { value: 'stone', label: 'Pierre' },
        ]}
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakSection label="Typographie" />
      <TweakSelect
        label="Polices"
        value={t.typeface}
        options={Object.entries(TYPEFACES).map(([value]) => ({
          value,
          label: { editorial: 'Éditorial · Cormorant + Manrope', modern: 'Moderne · Playfair + DM Sans', classic: 'Classique · Caslon + Work Sans' }[value],
        }))}
        onChange={(v) => setTweak('typeface', v)}
      />
    </TweaksPanel>
  );
}
