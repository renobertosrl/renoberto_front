import { useState, useRef, useMemo } from 'react';
import * as api from '../services/api.js';
import SafeImg from '../components/SafeImg.jsx';
import { useToast } from '../components/Toast.jsx';

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ============ Admin shell ============

export default function AdminApp({ state, setState }) {
  const [tab, setTab] = useState('dashboard');
  const [editingProject, setEditingProject] = useState(null);
  const [changingPwd, setChangingPwd] = useState(false);

  if (!state.auth) return <LoginScreen setState={setState} />;

  const unreadCount = state.messages.filter(m => !m.read).length;

  const sections = [
    { id: 'dashboard',    label: 'Tableau de bord',    icon: '◆' },
    { id: 'projects',     label: 'Réalisations',        icon: '▣', count: state.projects.length },
    { id: 'categories',   label: 'Catégories',          icon: '⊞', count: state.categories.length },
    { id: 'services',     label: 'Services & tarifs',   icon: '⚒', count: state.services.length },
    { id: 'testimonials', label: 'Témoignages',         icon: '❝', count: state.testimonials.length },
    { id: 'team',         label: 'Équipe',              icon: '◯', count: state.team.length },
    { id: 'process',      label: 'Démarche',            icon: '↗', count: state.process.length },
    { id: 'content',      label: 'Textes & images',     icon: '✎' },
    { id: 'contact',      label: 'Coordonnées',         icon: '☎' },
    { id: 'messages',     label: 'Messages',            icon: '✉', count: unreadCount, badge: unreadCount > 0 },
  ];

  const handleLogout = () => {
    api.logout();
    setState(s => ({ ...s, auth: null, messages: [] }));
  };

  if (editingProject) {
    return (
      <ProjectEditor
        project={editingProject === 'new' ? null : editingProject}
        state={state}
        setState={setState}
        onClose={() => setEditingProject(null)}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="brand__mono" style={{ marginRight: 6 }}><em>R</em></span>Renoberto
        </div>
        <div className="admin-sidebar__sub">Panneau admin · Bruxelles</div>
        <nav className="admin-nav">
          {sections.map(s => (
            <button key={s.id} className={tab === s.id ? 'is-active' : ''} onClick={() => setTab(s.id)}>
              <span style={{ width: 16, color: 'var(--accent)', fontSize: 12 }}>{s.icon}</span>
              <span>{s.label}</span>
              {s.count !== undefined && s.count > 0 && (
                <span className="admin-nav__count" style={s.badge ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : {}}>{s.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__foot">
          <a href="#/" style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: 8 }}>← Retour au site</a>
          <div className="mono muted" style={{ fontSize: 11, marginBottom: 8 }}>{state.auth.email}</div>
          <button onClick={() => setChangingPwd(true)} style={{ color: 'var(--fg-muted)', fontSize: 12, display: 'block', marginBottom: 8 }}>
            Changer le mot de passe
          </button>
          <button onClick={handleLogout} style={{ color: 'var(--fg-muted)', fontSize: 12 }}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'dashboard'    && <Dashboard state={state} setEditingProject={setEditingProject} setTab={setTab} />}
        {tab === 'projects'     && <ProjectsAdmin state={state} setState={setState} setEditingProject={setEditingProject} />}
        {tab === 'categories'   && <CategoriesAdmin state={state} setState={setState} />}
        {tab === 'services'     && <ServicesAdmin state={state} setState={setState} />}
        {tab === 'testimonials' && <TestimonialsAdmin state={state} setState={setState} />}
        {tab === 'team'         && <TeamAdmin state={state} setState={setState} />}
        {tab === 'process'      && <ProcessAdmin state={state} setState={setState} />}
        {tab === 'content'      && <ContentAdmin state={state} setState={setState} />}
        {tab === 'contact'      && <ContactAdmin state={state} setState={setState} />}
        {tab === 'messages'     && <MessagesAdmin state={state} setState={setState} />}
      </main>

      {changingPwd && <PasswordModal onClose={() => setChangingPwd(false)} />}
    </div>
  );
}

// ============ Login ============

function LoginScreen({ setState }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const user = await api.login(email, pwd);
      const messages = await api.getMessages();
      setState(s => ({ ...s, auth: user, messages }));
    } catch (e) {
      setErr(e.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="brand__mono" style={{ marginRight: 6 }}><em>R</em></span>Renoberto
        </div>
        <div className="login-card__sub">Panneau d'administration</div>
        <form className="form-grid" onSubmit={submit}>
          <div className="field">
            <label className="field__label">Email</label>
            <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
          </div>
          <div className="field">
            <label className="field__label">Mot de passe</label>
            <input type="password" required value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(''); }} autoFocus />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
          {err && <p style={{ color: '#ef6b6b', fontSize: 12, textAlign: 'center' }}>{err}</p>}
        </form>
      </div>
    </div>
  );
}

// ============ Password modal ============

function PasswordModal({ onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) { toast('Les mots de passe ne correspondent pas'); return; }
    if (form.next.length < 8) { toast('Minimum 8 caractères'); return; }
    setLoading(true);
    try {
      await api.changePassword(form.current, form.next);
      toast('Mot de passe mis à jour', 'success');
      onClose();
    } catch (e) {
      toast(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="card-block" style={{ width: 400, margin: 0 }} onClick={e => e.stopPropagation()}>
        <div className="card-block__title">Changer le mot de passe</div>
        <form className="form-grid" onSubmit={submit} style={{ marginTop: 16 }}>
          <div className="field">
            <label className="field__label">Mot de passe actuel</label>
            <input type="password" required value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} autoFocus />
          </div>
          <div className="field">
            <label className="field__label">Nouveau mot de passe</label>
            <input type="password" required value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field__label">Confirmer</label>
            <input type="password" required value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn--ghost btn--small">Annuler</button>
            <button type="submit" className="btn btn--primary btn--small" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Dashboard ============

function Dashboard({ state, setEditingProject, setTab }) {
  const totalViews = state.projects.reduce((s, p) => s + (p.views || 0), 0);
  const unread = state.messages.filter(m => !m.read).length;
  const featured = state.projects.filter(p => p.featured).length;
  const firstName = state.auth?.name?.split(' ')[0] || state.auth?.email?.split('@')[0] || 'Admin';

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="admin-head__sub">Vue d'ensemble</div>
          <h1>Bonjour, {firstName}</h1>
        </div>
        <button onClick={() => setEditingProject('new')} className="btn btn--primary btn--small">+ Nouvelle réalisation</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi__label">Réalisations</div>
          <div className="kpi__num">{state.projects.length}</div>
          <div className="kpi__delta">{featured} à la une</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Vues totales</div>
          <div className="kpi__num">{totalViews.toLocaleString('fr-FR')}</div>
          <div className="kpi__delta">Portfolio</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Messages non lus</div>
          <div className="kpi__num">{unread}</div>
          <div className="kpi__delta" style={{ color: unread > 0 ? 'var(--accent)' : 'var(--fg-muted)' }}>
            {unread > 0 ? 'Action requise' : 'Tout est traité'}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Témoignages</div>
          <div className="kpi__num">{state.testimonials.length}</div>
          <div className="kpi__delta">Note moyenne : 5/5</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card-block" style={{ marginBottom: 0 }}>
          <div className="card-block__title">Top réalisations</div>
          <div className="card-block__sub">Les plus consultées</div>
          <table className="admin-table" style={{ background: 'transparent', border: 'none' }}>
            <tbody>
              {[...state.projects].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td style={{ width: 76 }}><SafeImg src={p.cover} className="admin-table__thumb" /></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{p.location} · {p.year}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ color: 'var(--accent)' }}>{(p.views || 0).toLocaleString('fr-FR')}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>vues</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-block" style={{ marginBottom: 0 }}>
          <div className="card-block__title">Derniers messages</div>
          <div className="card-block__sub">Inbox</div>
          {state.messages.slice(0, 4).map(m => (
            <div key={m.id} style={{ paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>
                  {m.name}
                  {!m.read && <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', marginLeft: 8, verticalAlign: 'middle' }}></span>}
                </span>
                <span className="mono muted" style={{ fontSize: 10 }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : ''}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject || m.body}</div>
            </div>
          ))}
          <button onClick={() => setTab('messages')} className="btn btn--ghost btn--small" style={{ marginTop: 16 }}>Voir tout</button>
        </div>
      </div>
    </>
  );
}

// ============ Projects admin ============

function ProjectsAdmin({ state, setState, setEditingProject }) {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const projects = useMemo(() => {
    let list = state.projects;
    if (filter !== 'all') list = list.filter(p => p.category === filter);
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [state.projects, filter, search]);

  const toggleFeatured = async (p) => {
    try {
      const updated = await api.updateProject(p.id, { featured: !p.featured });
      setState(s => ({ ...s, projects: s.projects.map(x => x.id === p.id ? updated : x) }));
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cette réalisation ?')) return;
    try {
      await api.deleteProject(id);
      setState(s => ({ ...s, projects: s.projects.filter(p => p.id !== id) }));
      toast('Réalisation supprimée.', 'success');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="admin-head__sub">Réalisations · {state.projects.length}</div>
          <h1>Portfolio</h1>
        </div>
        <button onClick={() => setEditingProject('new')} className="btn btn--primary">+ Nouvelle réalisation</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 1, minWidth: 200 }}>
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Toutes catégories</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}></th>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Lieu</th>
            <th style={{ width: 80 }}>Année</th>
            <th style={{ width: 80 }}>Vues</th>
            <th style={{ width: 120 }}>Statut</th>
            <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => {
            const cat = state.categories.find(c => c.id === p.category);
            return (
              <tr key={p.id}>
                <td><SafeImg src={p.cover} className="admin-table__thumb" /></td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{p.surface} m² · {p.duration}</div>
                </td>
                <td className="muted">{cat?.name}</td>
                <td className="muted">{p.location}</td>
                <td className="muted">{p.year}</td>
                <td className="mono" style={{ color: 'var(--accent)' }}>{(p.views || 0).toLocaleString('fr-FR')}</td>
                <td>
                  <button onClick={() => toggleFeatured(p)} className={`admin-pill ${p.featured ? 'admin-pill--featured' : ''}`} style={{ cursor: 'pointer' }}>
                    {p.featured ? '★ À la une' : '☆ Standard'}
                  </button>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <a href={`#/project/${p.slug || p.id}`} target="_blank" className="admin-iconbtn" title="Voir">↗</a>
                    <button onClick={() => setEditingProject(p)} className="admin-iconbtn" title="Modifier">✎</button>
                    <button onClick={() => remove(p.id)} className="admin-iconbtn admin-iconbtn--danger" title="Supprimer">✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ============ Project editor ============

function ProjectEditor({ project, state, setState, onClose }) {
  const toast = useToast();
  const blank = {
    title: '', slug: '', category: state.categories[0]?.id || '',
    location: '', surface: 0, duration: '', year: new Date().getFullYear(),
    featured: false, summary: '', description: '',
    cover: '', images: [], materials: [], beforeAfter: null,
  };
  const [p, setP] = useState(project ? { ...blank, ...project } : blank);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isNew = !project;
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!p.title.trim()) { toast('Le titre est obligatoire'); return; }
    setSaving(true);
    try {
      const { id, views, ...data } = p;
      const payload = { ...data, slug: slugify(p.title), cover: p.cover || p.images[0] || '' };
      if (isNew) {
        const result = await api.createProject(payload);
        setState(s => ({ ...s, projects: [result, ...s.projects] }));
      } else {
        const result = await api.updateProject(id, payload);
        setState(s => ({ ...s, projects: s.projects.map(x => x.id === id ? result : x) }));
      }
      toast('Réalisation enregistrée.', 'success');
      onClose();
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(f => api.uploadImage(f).then(r => r.url)));
      setP(prev => ({ ...prev, images: [...prev.images, ...urls], cover: prev.cover || urls[0] || '' }));
    } catch (e) {
      toast('Erreur upload : ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) await handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setP(prev => {
      const next = prev.images.filter((_, i) => i !== idx);
      const cover = prev.cover === prev.images[idx] ? (next[0] || '') : prev.cover;
      return { ...prev, images: next, cover };
    });
  };

  return (
    <div className="admin-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
      <div className="admin-head">
        <div>
          <div className="admin-head__sub">{isNew ? 'Nouvelle réalisation' : 'Modifier la réalisation'}</div>
          <h1>{p.title || 'Sans titre'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn btn--ghost btn--small">Annuler</button>
          <button onClick={save} className="btn btn--primary btn--small" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer →'}
          </button>
        </div>
      </div>

      <div className="card-block">
        <div className="card-block__title">Photos</div>
        <div className="card-block__sub">
          {uploading ? 'Upload vers Cloudinary...' : 'Glissez-déposez ou cliquez · La première photo sera la couverture'}
        </div>
        <div
          className={`dropzone ${dragOver ? 'is-over' : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone__icon">{uploading ? '⟳' : '↓'}</div>
          <div className="dropzone__title">{uploading ? 'Upload en cours...' : 'Déposez vos photos ici'}</div>
          <div className="dropzone__sub">JPG · PNG · WEBP — Plusieurs fichiers acceptés</div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        </div>
        {p.images.length > 0 && (
          <div className="thumbs-grid">
            {p.images.map((img, i) => (
              <div key={i} className="thumb">
                <img src={img} alt="" />
                <button className="thumb__close" onClick={() => removeImage(i)}>×</button>
                {p.cover === img
                  ? <span className="thumb__badge">Couverture</span>
                  : <button className="thumb__badge thumb__badge--ghost" onClick={() => set('cover', img)}>Faire couverture</button>
                }
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-block">
        <div className="card-block__title">Informations</div>
        <div className="form-grid">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Titre *</label>
              <input type="text" value={p.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Catégorie</label>
              <select value={p.category} onChange={(e) => set('category', e.target.value)}>
                {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Lieu</label>
              <input type="text" value={p.location} onChange={(e) => set('location', e.target.value)} placeholder="Bruxelles" />
            </div>
            <div className="field">
              <label className="field__label">Année</label>
              <input type="number" value={p.year} onChange={(e) => set('year', +e.target.value)} />
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Surface (m²)</label>
              <input type="number" value={p.surface} onChange={(e) => set('surface', +e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Durée du chantier</label>
              <input type="text" value={p.duration} onChange={(e) => set('duration', e.target.value)} placeholder="3 semaines" />
            </div>
          </div>
          <div className="field">
            <label className="field__label">Résumé court</label>
            <textarea rows="2" value={p.summary} onChange={(e) => set('summary', e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Description complète</label>
            <textarea rows="5" value={p.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Matériaux & finitions (un par ligne)</label>
            <textarea rows="4" value={(p.materials || []).join('\n')} onChange={(e) => set('materials', e.target.value.split('\n').filter(x => x.trim()))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={p.featured} onChange={(e) => set('featured', e.target.checked)} />
            <span>Marquer comme "à la une" (apparaîtra sur la page d'accueil)</span>
          </label>
        </div>
      </div>

      <div className="card-block">
        <div className="card-block__title">Avant / Après (optionnel)</div>
        <div className="form-grid form-grid--2">
          <BeforeAfterUpload
            label="Image AVANT"
            value={p.beforeAfter?.before || ''}
            onChange={(url) => set('beforeAfter', { ...(p.beforeAfter || {}), before: url })}
          />
          <BeforeAfterUpload
            label="Image APRÈS"
            value={p.beforeAfter?.after || ''}
            onChange={(url) => set('beforeAfter', { ...(p.beforeAfter || {}), after: url })}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
        <button onClick={onClose} className="btn btn--ghost">Annuler</button>
        <button onClick={save} className="btn btn--primary" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer la réalisation →'}
        </button>
      </div>
    </div>
  );
}

// ============ Before/After upload ============

function BeforeAfterUpload({ label, value, onChange }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
    } catch (e) {
      toast('Erreur upload : ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {value && (
        <div style={{ marginBottom: 8, borderRadius: 6, overflow: 'hidden', aspectRatio: '16/9', background: 'var(--bg-elev-2)' }}>
          <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
        <label className="btn btn--ghost btn--small" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {uploading ? '⟳' : '↑ Upload'}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}

// ============ Categories admin ============

function CategoriesAdmin({ state, setState }) {
  const toast = useToast();

  const add = async () => {
    const name = prompt('Nom de la catégorie ?');
    if (!name) return;
    const id = slugify(name);
    try {
      const cat = await api.createCategory({ id, name });
      setState(s => ({ ...s, categories: [...s.categories, cat] }));
      toast('Catégorie ajoutée.', 'success');
    } catch (e) { toast(e.message); }
  };

  const rename = async (cat) => {
    const name = prompt('Nouveau nom ?', cat.name);
    if (!name || name === cat.name) return;
    try {
      const updated = await api.updateCategory(cat.id, { name });
      setState(s => ({ ...s, categories: s.categories.map(c => c.id === cat.id ? updated : c) }));
      toast('Catégorie renommée.', 'success');
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (state.projects.some(p => p.category === id)) { toast('Des projets utilisent cette catégorie.'); return; }
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.deleteCategory(id);
      setState(s => ({ ...s, categories: s.categories.filter(c => c.id !== id) }));
      toast('Catégorie supprimée.', 'success');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="admin-head__sub">Catégories · {state.categories.length}</div>
          <h1>Organisation</h1>
        </div>
        <button onClick={add} className="btn btn--primary">+ Nouvelle catégorie</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr><th>Nom</th><th style={{ width: 100 }}>Slug</th><th style={{ width: 120 }}>Projets</th><th style={{ width: 140, textAlign: 'right' }}>Actions</th></tr>
        </thead>
        <tbody>
          {state.categories.map(c => (
            <tr key={c.id}>
              <td style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{c.name}</td>
              <td className="mono muted">{c.id}</td>
              <td className="muted">{state.projects.filter(p => p.category === c.id).length}</td>
              <td>
                <div className="admin-row-actions">
                  <button onClick={() => rename(c)} className="admin-iconbtn" title="Renommer">✎</button>
                  <button onClick={() => remove(c.id)} className="admin-iconbtn admin-iconbtn--danger" title="Supprimer">✕</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ============ Services admin ============

function ServicesAdmin({ state, setState }) {
  const toast = useToast();
  const update = (id, patch) => setState(s => ({ ...s, services: s.services.map(x => x.id === id ? { ...x, ...patch } : x) }));

  const save = async (id) => {
    const svc = state.services.find(x => x.id === id);
    try {
      await api.updateService(id, { cat: svc.cat, title: svc.title, desc: svc.desc, price: svc.price });
      toast('Service enregistré.', 'success');
    } catch (e) { toast(e.message); }
  };

  const add = async () => {
    try {
      const result = await api.createService({ cat: state.categories[0]?.id || '', title: 'Nouveau service', desc: '', price: '', order: state.services.length });
      setState(s => ({ ...s, services: [...s.services, result] }));
      toast('Service ajouté.', 'success');
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await api.deleteService(id);
      setState(s => ({ ...s, services: s.services.filter(x => x.id !== id) }));
      toast('Service supprimé.', 'success');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Services & tarifs</div><h1>Prestations</h1></div>
        <button onClick={add} className="btn btn--primary">+ Nouveau service</button>
      </div>
      <div className="form-grid">
        {state.services.map((s, i) => (
          <div key={s.id} className="card-block" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div className="mono muted">0{i + 1}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => save(s.id)} className="btn btn--ghost btn--small">Enregistrer</button>
                <button onClick={() => remove(s.id)} className="admin-iconbtn admin-iconbtn--danger">✕</button>
              </div>
            </div>
            <div className="form-grid form-grid--2">
              <div className="field">
                <label className="field__label">Titre</label>
                <input type="text" value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} />
              </div>
              <div className="field">
                <label className="field__label">Catégorie</label>
                <select value={s.cat} onChange={(e) => update(s.id, { cat: e.target.value })}>
                  {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label className="field__label">Description</label>
              <textarea rows="3" value={s.desc} onChange={(e) => update(s.id, { desc: e.target.value })} />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label className="field__label">Tarif indicatif</label>
              <input type="text" value={s.price} onChange={(e) => update(s.id, { price: e.target.value })} placeholder="À partir de XX€/m²" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ Testimonials admin ============

function TestimonialsAdmin({ state, setState }) {
  const toast = useToast();
  const update = (id, patch) => setState(s => ({ ...s, testimonials: s.testimonials.map(x => x.id === id ? { ...x, ...patch } : x) }));

  const save = async (id) => {
    const t = state.testimonials.find(x => x.id === id);
    try {
      await api.updateTestimonial(id, { quote: t.quote, name: t.name, location: t.location });
      toast('Témoignage enregistré.', 'success');
    } catch (e) { toast(e.message); }
  };

  const add = async () => {
    try {
      const result = await api.createTestimonial({ quote: '', name: '', location: '' });
      setState(s => ({ ...s, testimonials: [result, ...s.testimonials] }));
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await api.deleteTestimonial(id);
      setState(s => ({ ...s, testimonials: s.testimonials.filter(x => x.id !== id) }));
      toast('Témoignage supprimé.', 'success');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Témoignages</div><h1>Paroles de clients</h1></div>
        <button onClick={add} className="btn btn--primary">+ Nouveau témoignage</button>
      </div>
      <div className="form-grid">
        {state.testimonials.map(t => (
          <div key={t.id} className="card-block" style={{ marginBottom: 0 }}>
            <div className="field">
              <label className="field__label">Citation</label>
              <textarea rows="3" value={t.quote} onChange={(e) => update(t.id, { quote: e.target.value })} />
            </div>
            <div className="form-grid form-grid--2" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="field__label">Nom</label>
                <input type="text" value={t.name} onChange={(e) => update(t.id, { name: e.target.value })} />
              </div>
              <div className="field">
                <label className="field__label">Lieu</label>
                <input type="text" value={t.location} onChange={(e) => update(t.id, { location: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => save(t.id)} className="btn btn--ghost btn--small">Enregistrer</button>
              <button onClick={() => remove(t.id)} className="admin-iconbtn admin-iconbtn--danger">✕ Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ Team admin ============

function TeamAdmin({ state, setState }) {
  const toast = useToast();
  const update = (id, patch) => setState(s => ({ ...s, team: s.team.map(x => x.id === id ? { ...x, ...patch } : x) }));

  const save = async (id) => {
    const m = state.team.find(x => x.id === id);
    try {
      await api.updateTeamMember(id, { name: m.name, role: m.role, photo: m.photo });
      toast('Membre enregistré.', 'success');
    } catch (e) { toast(e.message); }
  };

  const add = async () => {
    try {
      const result = await api.createTeamMember({ name: 'Nouveau membre', role: '', photo: '', order: state.team.length });
      setState(s => ({ ...s, team: [...s.team, result] }));
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await api.deleteTeamMember(id);
      setState(s => ({ ...s, team: s.team.filter(x => x.id !== id) }));
      toast('Membre supprimé.', 'success');
    } catch (e) { toast(e.message); }
  };

  const uploadPhoto = async (id, files) => {
    if (!files || !files[0]) return;
    try {
      const { url } = await api.uploadImage(files[0]);
      update(id, { photo: url });
      await api.updateTeamMember(id, { photo: url });
      toast('Photo mise à jour.', 'success');
    } catch (e) { toast('Erreur upload : ' + e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Équipe</div><h1>L'atelier</h1></div>
        <button onClick={add} className="btn btn--primary">+ Ajouter un membre</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {state.team.map(m => (
          <div key={m.id} className="card-block" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ cursor: 'pointer' }}>
                <div style={{ width: 100, height: 120, background: 'var(--bg-elev-2)', borderRadius: 8, backgroundImage: `url(${m.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--line)' }}></div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadPhoto(m.id, e.target.files)} />
                <div className="mono muted" style={{ textAlign: 'center', marginTop: 8, fontSize: 9 }}>Changer photo</div>
              </label>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label className="field__label">Nom</label>
                  <input type="text" value={m.name} onChange={(e) => update(m.id, { name: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field__label">Rôle</label>
                  <input type="text" value={m.role} onChange={(e) => update(m.id, { role: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => save(m.id)} className="btn btn--ghost btn--small">Enregistrer</button>
                  <button onClick={() => remove(m.id)} className="admin-iconbtn admin-iconbtn--danger">✕</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ Process admin ============

function ProcessAdmin({ state, setState }) {
  const toast = useToast();
  const [dirty, setDirty] = useState(false);

  const update = (id, patch) => {
    setState(s => ({ ...s, process: s.process.map(x => x.id === id ? { ...x, ...patch } : x) }));
    setDirty(true);
  };

  const add = async () => {
    try {
      const result = await api.createStep({ title: 'Nouvelle étape', desc: '', order: state.process.length });
      setState(s => ({ ...s, process: [...s.process, result] }));
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await api.deleteStep(id);
      setState(s => ({ ...s, process: s.process.filter(x => x.id !== id) }));
      toast('Étape supprimée.', 'success');
    } catch (e) { toast(e.message); }
  };

  const move = (idx, dir) => {
    setState(s => {
      const arr = [...s.process];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return s;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...s, process: arr };
    });
    setDirty(true);
  };

  const saveAll = async () => {
    try {
      await Promise.all(state.process.map((p, i) => api.updateStep(p.id, { title: p.title, desc: p.desc, order: i })));
      await api.reorderSteps(state.process.map(p => p.id));
      setDirty(false);
      toast('Démarche enregistrée.', 'success');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Démarche · {state.process.length} étapes</div><h1>Processus</h1></div>
        <div style={{ display: 'flex', gap: 12 }}>
          {dirty && <button onClick={saveAll} className="btn btn--primary btn--small">Enregistrer les modifications</button>}
          <button onClick={add} className="btn btn--ghost btn--small">+ Nouvelle étape</button>
        </div>
      </div>
      <div className="form-grid">
        {state.process.map((p, i) => (
          <div key={p.id} className="card-block" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', fontStyle: 'italic' }}>0{i + 1}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => move(i, -1)} className="admin-iconbtn" disabled={i === 0}>↑</button>
                <button onClick={() => move(i, 1)} className="admin-iconbtn" disabled={i === state.process.length - 1}>↓</button>
                <button onClick={() => remove(p.id)} className="admin-iconbtn admin-iconbtn--danger">✕</button>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Titre</label>
              <input type="text" value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label className="field__label">Description</label>
              <textarea rows="3" value={p.desc} onChange={(e) => update(p.id, { desc: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ Content (About) admin ============

const DEFAULT_STATS = [
  { num: '50+', label: 'Chantiers livrés en 2 ans' },
  { num: '10 ans', label: "D'expérience sur le terrain" },
  { num: '7 j', label: 'Pour recevoir votre devis' },
  { num: '10 ans', label: 'Garantie décennale' },
];

function ContentAdmin({ state, setState }) {
  const toast = useToast();
  const a = state.content.about;
  const heroImage = state.content.heroImage || '';
  const stats = state.content.stats?.length ? state.content.stats : DEFAULT_STATS;
  const [saving, setSaving] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [savingStats, setSavingStats] = useState(false);

  const updateAbout = (patch) => setState(s => ({ ...s, content: { ...s.content, about: { ...s.content.about, ...patch } } }));
  const setHeroImage = (url) => setState(s => ({ ...s, content: { ...s.content, heroImage: url } }));
  const updateStat = (i, patch) => setState(s => {
    const next = [...(s.content.stats?.length ? s.content.stats : DEFAULT_STATS)];
    next[i] = { ...next[i], ...patch };
    return { ...s, content: { ...s.content, stats: next } };
  });

  const save = async () => {
    setSaving(true);
    try {
      await api.updateAbout(state.content.about);
      toast('Page À propos enregistrée.', 'success');
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveHero = async (url) => {
    setSavingHero(true);
    try {
      await api.updateHeroImage(url);
      toast('Image hero enregistrée.', 'success');
    } catch (e) {
      toast(e.message);
    } finally {
      setSavingHero(false);
    }
  };

  const saveStats = async () => {
    setSavingStats(true);
    try {
      await api.updateStats(stats);
      toast('Statistiques enregistrées.', 'success');
    } catch (e) {
      toast(e.message);
    } finally {
      setSavingStats(false);
    }
  };

  const uploadAboutImage = async (files) => {
    if (!files || !files[0]) return;
    try {
      const { url } = await api.uploadImage(files[0]);
      const updated = { ...state.content.about, image: url };
      updateAbout({ image: url });
      await api.updateAbout(updated);
      toast('Image mise à jour.', 'success');
    } catch (e) { toast('Erreur upload : ' + e.message); }
  };

  const uploadHeroFile = async (files) => {
    if (!files || !files[0]) return;
    try {
      const { url } = await api.uploadImage(files[0]);
      setHeroImage(url);
      await saveHero(url);
    } catch (e) { toast('Erreur upload : ' + e.message); }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Textes & images</div><h1>Page "L'atelier"</h1></div>
        <button onClick={save} className="btn btn--primary btn--small" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer →'}
        </button>
      </div>

      <div className="card-block">
        <div className="card-block__title">Image hero (page d'accueil)</div>
        <div className="card-block__sub">Fond du bandeau principal — indépendant des projets</div>
        <div className="field" style={{ marginTop: 16 }}>
          {heroImage && (
            <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/6', background: 'var(--bg-elev-2)' }}>
              <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://... ou uploadez une image"
              style={{ flex: 1 }}
            />
            <label className="btn btn--ghost btn--small" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ↑ Upload
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadHeroFile(e.target.files)} />
            </label>
            <button
              className="btn btn--ghost btn--small"
              disabled={savingHero}
              onClick={() => saveHero(heroImage)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {savingHero ? '...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div className="card-block__title">Statistiques (bandeau chiffres)</div>
            <div className="card-block__sub">Les 4 chiffres clés affichés sur la page d'accueil</div>
          </div>
          <button onClick={saveStats} className="btn btn--ghost btn--small" disabled={savingStats}>
            {savingStats ? '...' : 'Enregistrer'}
          </button>
        </div>
        <div className="form-grid">
          {stats.map((s, i) => (
            <div key={i} className="form-grid form-grid--2" style={{ background: 'var(--bg-elev-2)', padding: '12px 16px', borderRadius: 6 }}>
              <div className="field">
                <label className="field__label">Chiffre {i + 1}</label>
                <input type="text" value={s.num} onChange={(e) => updateStat(i, { num: e.target.value })} placeholder="ex: 50+" />
              </div>
              <div className="field">
                <label className="field__label">Label</label>
                <input type="text" value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-block">
        <div className="card-block__title">Page À propos</div>
        <div className="form-grid">
          <div className="field">
            <label className="field__label">Titre principal</label>
            <input type="text" value={a.title || ''} onChange={(e) => updateAbout({ title: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Texte (séparer paragraphes par ligne vide · **gras**)</label>
            <textarea rows="8" value={a.body || ''} onChange={(e) => updateAbout({ body: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Image principale</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 160, aspectRatio: '4/5', background: 'var(--bg-elev-2)', backgroundImage: `url(${a.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--line)', borderRadius: 8 }}></div>
              <div style={{ flex: 1 }}>
                <input type="text" value={a.image || ''} onChange={(e) => updateAbout({ image: e.target.value })} placeholder="URL ou uploadez ci-dessous" />
                <label style={{ marginTop: 12, display: 'inline-block', cursor: 'pointer' }} className="btn btn--ghost btn--small">
                  ↑ Uploader
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadAboutImage(e.target.files)} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============ Contact admin ============

function ContactAdmin({ state, setState }) {
  const toast = useToast();
  const c = state.content.contact;
  const [saving, setSaving] = useState(false);

  const update = (patch) => setState(s => ({ ...s, content: { ...s.content, contact: { ...s.content.contact, ...patch } } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateContact(state.content.contact);
      toast('Coordonnées enregistrées.', 'success');
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div><div className="admin-head__sub">Coordonnées</div><h1>Informations de contact</h1></div>
        <button onClick={save} className="btn btn--primary btn--small" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer →'}
        </button>
      </div>
      <div className="card-block">
        <div className="form-grid">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Téléphone</label>
              <input type="text" value={c.phone || ''} onChange={(e) => update({ phone: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">WhatsApp</label>
              <input type="text" value={c.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="field__label">Email</label>
            <input type="email" value={c.email || ''} onChange={(e) => update({ email: e.target.value })} />
          </div>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Adresse</label>
              <input type="text" value={c.address || ''} onChange={(e) => update({ address: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Ville / code postal</label>
              <input type="text" value={c.city || ''} onChange={(e) => update({ city: e.target.value })} />
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label">Horaires</label>
              <input type="text" value={c.hours || ''} onChange={(e) => update({ hours: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Instagram</label>
              <input type="text" value={c.instagram || ''} onChange={(e) => update({ instagram: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============ Messages admin ============

function MessagesAdmin({ state, setState }) {
  const toast = useToast();
  const [open, setOpen] = useState(null);

  const toggleRead = async (id, currentRead) => {
    try {
      const updated = await api.updateMessage(id, { read: !currentRead });
      setState(s => ({ ...s, messages: s.messages.map(m => m.id === id ? updated : m) }));
    } catch (e) { toast(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await api.deleteMessageApi(id);
      setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) }));
      toast('Message supprimé.', 'success');
    } catch (e) { toast(e.message); }
  };

  const markAllRead = async () => {
    const unread = state.messages.filter(m => !m.read);
    try {
      await Promise.all(unread.map(m => api.updateMessage(m.id, { read: true })));
      setState(s => ({ ...s, messages: s.messages.map(m => ({ ...m, read: true })) }));
      toast('Tous les messages marqués comme lus.', 'success');
    } catch (e) { toast(e.message); }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '';

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="admin-head__sub">Inbox · {state.messages.filter(m => !m.read).length} non lus</div>
          <h1>Messages</h1>
        </div>
        <button onClick={markAllRead} className="btn btn--ghost btn--small">Tout marquer comme lu</button>
      </div>
      <div className="card-block">
        {state.messages.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: 40 }}>Aucun message pour le moment.</p>
        ) : state.messages.map(m => (
          <div key={m.id} className={`msg-row ${m.read ? '' : 'is-new'}`} onClick={() => { setOpen(open === m.id ? null : m.id); if (!m.read) toggleRead(m.id, false); }} style={{ cursor: 'pointer' }}>
            <div className="msg-row__who">
              <span className="msg-row__name">{m.name}</span>
              <span className="msg-row__contact">{m.email}</span>
              {m.phone && <span className="msg-row__contact">{m.phone}</span>}
            </div>
            <div>
              {m.subject && <div style={{ fontWeight: 500, marginBottom: 6 }}>{m.subject}</div>}
              <div className="msg-row__body" style={open === m.id ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {m.body}
              </div>
              {open === m.id && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
                  <a href={`mailto:${m.email}`} className="btn btn--ghost btn--small">Répondre par email</a>
                  {m.phone && <a href={`tel:${m.phone.replace(/\s/g, '')}`} className="btn btn--ghost btn--small">Appeler</a>}
                  <button onClick={() => toggleRead(m.id, m.read)} className="btn btn--ghost btn--small">{m.read ? 'Marquer non lu' : 'Marquer lu'}</button>
                  <button onClick={() => remove(m.id)} className="btn btn--ghost btn--small" style={{ color: '#ef6b6b', borderColor: '#ef6b6b40' }}>Supprimer</button>
                </div>
              )}
            </div>
            <div className="msg-row__date">{formatDate(m.createdAt)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
