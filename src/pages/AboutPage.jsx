import CTAFooter from '../components/CTAFooter.jsx';

const escapeHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const renderText = (txt) => {
  if (!txt) return null;
  return txt.split('\n\n').map((para, i) => {
    const safe = escapeHtml(para).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} dangerouslySetInnerHTML={{ __html: safe }} />;
  });
};

function AboutTitle({ title }) {
  if (!title) return null;
  const parts = title.split(',');
  const first = parts[0];
  const rest = parts.slice(1).join(',').trim();
  return <h2>{first}{rest ? <>,<br /><em>{rest}</em></> : null}</h2>;
}

export default function AboutPage({ state }) {
  const a = state.content?.about || {};
  return (
    <>
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 80 }}>
            <span className="eyebrow">L'atelier · Depuis 2024</span>
          </div>
          <div className="about-grid">
            <div className="about-image" style={{ backgroundImage: `url(${a.image})` }}></div>
            <div className="about-text">
              <AboutTitle title={a.title} />
              {renderText(a.body)}
              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                <a href="#/portfolio" className="btn btn--primary">Voir nos réalisations <span className="arrow">→</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-elev)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">L'équipe</span>
              <h2 className="section-head__title" style={{ marginTop: 20 }}>
                Cinq artisans, <em>une famille.</em>
              </h2>
            </div>
          </div>
          <div className="team-grid">
            {state.team.map(m => (
              <div key={m.id} className="team-card">
                <div className="team-card__photo" style={{ backgroundImage: `url(${m.photo})` }}></div>
                <div className="team-card__name">{m.name}</div>
                <div className="team-card__role">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTAFooter />
    </>
  );
}
