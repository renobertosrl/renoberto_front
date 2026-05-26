import { useState, useCallback, useRef, createContext, useContext } from 'react';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const toast = useCallback((message, type = 'error') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: 13,
            maxWidth: 360,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: t.type === 'success' ? '#162016' : '#201616',
            border: `1px solid ${t.type === 'success' ? '#2d5a2d' : '#5a2d2d'}`,
            color: t.type === 'success' ? '#6fcf6f' : '#ef6b6b',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'toast-in 0.2s ease',
          }}>
            <span style={{ fontSize: 14 }}>{t.type === 'success' ? '✓' : '✕'}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
