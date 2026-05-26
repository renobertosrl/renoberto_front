import { useState, useEffect } from 'react';
import { PLACEHOLDER } from '../data/store.js';
import { viewProject } from '../services/api.js';
import ProjectCard from '../components/ProjectCard.jsx';
import BeforeAfter from '../components/BeforeAfter.jsx';
import Lightbox from '../components/Lightbox.jsx';
import CTAFooter from '../components/CTAFooter.jsx';

const LAYOUT_CLASSES = ['g-two-thirds', 'g-third', 'g-half', 'g-half', 'g-full', 'g-third', 'g-third', 'g-third'];

export default function ProjectPage({ slug, state }) {
  const project = state.projects.find(p => p.slug === slug || p.id === slug);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!project) return;
    document.title = `${project.title} · Renoberto`;
    const key = `rb_view_${project.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      viewProject(project.id).catch(() => {});
    }
    return () => { document.title = 'Portfolio · Renoberto'; };
  }, [project?.id]);

  if (!project) {
    return (
      <div className="section">
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>Projet introuvable</h1>
          <p className="muted" style={{ marginTop: 16 }}>Ce projet n'existe pas ou a été supprimé.</p>
          <a href="#/portfolio" className="btn btn--ghost" style={{ marginTop: 24 }}>← Retour au portfolio</a>
        </div>
      </div>
    );
  }

  const cat = state.categories.find(c => c.id === project.category);
  const images = project.images && project.images.length ? project.images : [project.cover];
  const otherProjects = state.projects.filter(p => p.id !== project.id).slice(0, 3);

  return (
    <>
      <section className="project-hero">
        <div className="container">
          <div className="project-hero__crumbs">
            <a href="#/portfolio">Portfolio</a>
            <span>/</span>
            <a href="#/portfolio">{cat?.name}</a>
            <span>/</span>
            <span>{project.location}</span>
          </div>
          <h1 className="project-hero__title">
            {project.title.split(' ').slice(0, -1).join(' ')} <em>{project.title.split(' ').slice(-1)}</em>
          </h1>
          <div className="project-hero__meta">
            <div className="meta-item">
              <div className="meta-item__label">Lieu</div>
              <div className="meta-item__value">{project.location}</div>
            </div>
            <div className="meta-item">
              <div className="meta-item__label">Surface</div>
              <div className="meta-item__value">{project.surface} m²</div>
            </div>
            <div className="meta-item">
              <div className="meta-item__label">Durée</div>
              <div className="meta-item__value">{project.duration}</div>
            </div>
            <div className="meta-item">
              <div className="meta-item__label">Année</div>
              <div className="meta-item__value">{project.year}</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="project-gallery">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${project.title} — ${i + 1}`}
                className={LAYOUT_CLASSES[i % LAYOUT_CLASSES.length]}
                onClick={() => setLightbox(i)}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="project-body">
            <div>
              <div className="project-body__label">À propos du projet</div>
            </div>
            <div>
              <div className="project-body__text">
                <p>{project.summary}</p>
                <p style={{ marginTop: 24 }}>{project.description}</p>
              </div>
              {project.materials && project.materials.length > 0 && (
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
                  <div className="mono muted" style={{ marginBottom: 16 }}>Matériaux &amp; finitions</div>
                  <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
                    {project.materials.map((m, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                        <span className="mono muted">0{i + 1}</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {project.beforeAfter?.before && project.beforeAfter?.after && (
        <section style={{ paddingBottom: 100 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 32 }}>
              <div>
                <span className="eyebrow">Transformation</span>
                <h2 className="section-head__title" style={{ marginTop: 20 }}>
                  Avant <em>·</em> Après
                </h2>
              </div>
              <p className="section-head__lead">Glissez le curseur pour comparer.</p>
            </div>
            <BeforeAfter before={project.beforeAfter.before} after={project.beforeAfter.after} />
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-elev)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">À découvrir aussi</span>
                <h2 className="section-head__title" style={{ marginTop: 20 }}>
                  Autres <em>réalisations</em>
                </h2>
              </div>
            </div>
            <div className="projects-grid">
              {otherProjects.map(p => <ProjectCard key={p.id} project={p} state={state} size="normal" />)}
            </div>
          </div>
        </section>
      )}

      <CTAFooter />

      {lightbox !== null && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((lightbox - 1 + images.length) % images.length)}
          onNext={() => setLightbox((lightbox + 1) % images.length)}
        />
      )}
    </>
  );
}
