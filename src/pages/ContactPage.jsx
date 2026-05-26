import { useState } from 'react';
import { createMessage } from '../services/api.js';

export default function ContactPage({ state }) {
  const c = state.content.contact;
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', body: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.body) return;
    setSending(true);
    setError('');
    try {
      await createMessage(form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', body: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setSending(false);
    }
  };

  if (!c || !c.phone) return null;
  const waNum = c.whatsapp?.replace(/\D/g, '') || c.phone?.replace(/\D/g, '') || '';

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 80 }}>
          <span className="eyebrow">Contact</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 7vw, 96px)', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 24, maxWidth: '14ch' }}>
            Parlons de votre <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>projet.</em>
          </h1>
        </div>
        <div className="contact-grid">
          <div>
            <div className="contact-row">
              <div className="contact-row__label">Téléphone</div>
              <div className="contact-row__value">
                <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
                <small>Lun – Ven · 8h – 18h</small>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-row__label">WhatsApp</div>
              <div className="contact-row__value">
                <a href={`https://wa.me/${waNum}`}>{c.whatsapp || c.phone}</a>
                <small>Réponse sous 2h en moyenne</small>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-row__label">Email</div>
              <div className="contact-row__value">
                <a href={`mailto:${c.email}`}>{c.email}</a>
                <small>Devis sous 7 jours</small>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-row__label">Atelier</div>
              <div className="contact-row__value">
                {c.address}
                <small>{c.city}</small>
              </div>
            </div>
            <div className="map-frame" style={{ marginTop: 40 }}>
              <div className="map-frame__pin"></div>
              <div className="map-frame__address">
                <strong>Renoberto</strong>
                <span>{c.address}, {c.city}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="card-block">
              <div className="card-block__title">Demander un devis</div>
              <div className="card-block__sub">Réponse sous 24h ouvrées</div>
              <form className="form-grid" onSubmit={submit}>
                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label className="field__label">Nom complet *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field__label">Téléphone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field__label">Type de projet</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option value="">Choisir...</option>
                    {state.services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="field__label">Votre projet *</label>
                    <span className="mono muted" style={{ fontSize: 11 }}>{form.body.length}/1000</span>
                  </div>
                  <textarea required rows="5" maxLength={1000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Décrivez votre projet, la surface, vos contraintes, votre budget..." />
                </div>
                {error && <p style={{ color: '#ef6b6b', fontSize: 13, textAlign: 'center' }}>{error}</p>}
                <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
                  {sent ? 'Message envoyé ✓' : sending ? 'Envoi...' : 'Envoyer'} <span className="arrow">{sent || sending ? '' : '→'}</span>
                </button>
                {sent && <p style={{ color: 'var(--accent)', fontSize: 13, textAlign: 'center' }}>Merci ! Nous vous recontactons sous 24h.</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
