import SafeImg from './SafeImg.jsx';
import { useCardMagnet } from '../hooks/useCardMagnet.js';

export default function ProjectCard({ project, size = 'normal', state }) {
  const cat = state.categories.find(c => c.id === project.category);
  const sizeClass = size === 'wide'   ? 'project-card--wide'
                  : size === 'narrow' ? 'project-card--narrow'
                  : size === 'full'   ? 'project-card--full' : '';
  const magnet = useCardMagnet(8);
  return (
    <a
      ref={magnet.ref}
      onMouseMove={magnet.onMouseMove}
      onMouseLeave={magnet.onMouseLeave}
      href={`#/project/${project.slug || project.id}`}
      className={`project-card ${sizeClass}`}
    >
      <div className="project-card__media">
        <SafeImg src={project.cover} alt={project.title} className="project-card__img" />
        {project.featured && <span className="project-card__featured">À la une</span>}
        <div className="project-card__overlay">
          <span className="mono">Voir le projet</span>
          <span className="mono">→</span>
        </div>
      </div>
      <div className="project-card__meta">
        <h3 className="project-card__title">{project.title}</h3>
        <span className="project-card__cat">{cat?.name || '—'}</span>
      </div>
      <div className="project-card__sub">
        <span>{project.location}</span>
        <span>{project.surface} m² · {project.year}</span>
      </div>
    </a>
  );
}
