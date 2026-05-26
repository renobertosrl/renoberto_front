import { DEFAULT_STATE } from './seed.js';

const STORAGE_KEY = 'renoberto_v2';

export const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='%23252220'/>
        <stop offset='1' stop-color='%231a1815'/>
      </linearGradient>
    </defs>
    <rect width='800' height='600' fill='url(%23g)'/>
    <text x='50%' y='50%' fill='%23d97757' font-family='monospace' font-size='14' text-anchor='middle'>RENOBERTO · IMAGE</text>
  </svg>`
);

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.warn('Failed to load state, using defaults', e);
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    const toSave = { ...state };
    delete toSave.auth;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save state', e);
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

export const uid = () => 'x' + Math.random().toString(36).slice(2, 9);
