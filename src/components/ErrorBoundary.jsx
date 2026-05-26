import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 40, textAlign: 'center' }}>
          <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.15em', marginBottom: 24 }}>RENOBERTO · ERREUR</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, marginBottom: 16 }}>Une erreur est survenue</h1>
          <p className="muted" style={{ maxWidth: '40ch', marginBottom: 32 }}>
            Quelque chose s'est mal passé. Rechargez la page ou revenez à l'accueil.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn--ghost" onClick={() => window.location.reload()}>Recharger</button>
            <a href="#/" className="btn btn--primary" onClick={() => this.setState({ error: null })}>← Accueil</a>
          </div>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: 32, padding: 16, background: 'var(--bg-elev)', borderRadius: 8, fontSize: 11, textAlign: 'left', maxWidth: 600, overflow: 'auto', color: '#ef6b6b' }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
