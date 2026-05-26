import ProjectCard from './ProjectCard.jsx';

const SIZES = ['wide', 'narrow', 'narrow', 'wide', 'normal', 'normal'];

export default function ProjectsMosaic({ projects, state }) {
  return (
    <div className="projects-grid">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} state={state} size={SIZES[i % SIZES.length]} />
      ))}
    </div>
  );
}
