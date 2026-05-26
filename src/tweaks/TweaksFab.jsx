import { useState, useEffect } from 'react';

export default function TweaksFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode' || t === '__edit_mode_dismissed') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (open) return null;
  return (
    <button
      className="tweaks-fab"
      onClick={() => window.postMessage({ type: '__activate_edit_mode' }, '*')}
      title="Personnaliser le thème et la mise en page"
    >
      <span className="tweaks-fab__icon" aria-hidden>✦</span>
      <span>Personnaliser</span>
    </button>
  );
}
