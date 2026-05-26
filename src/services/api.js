const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'rb_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erreur serveur');
  }
  return res.json();
}

// Public state
export const getState = () => apiFetch('/state');

// Auth
export const login = async (email, password) => {
  const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setToken(data.token);
  return data.user;
};
export const logout = () => setToken(null);
export const getMe = () => apiFetch('/auth/me');
export const changePassword = (currentPassword, newPassword) =>
  apiFetch('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });

// Projects
export const createProject = (data) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' });
export const viewProject = (id) => apiFetch(`/projects/${id}/view`, { method: 'POST' });

// Categories
export const createCategory = (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' });

// Services
export const createService = (data) => apiFetch('/services', { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id, data) => apiFetch(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteService = (id) => apiFetch(`/services/${id}`, { method: 'DELETE' });

// Testimonials
export const createTestimonial = (data) => apiFetch('/testimonials', { method: 'POST', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => apiFetch(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => apiFetch(`/testimonials/${id}`, { method: 'DELETE' });

// Team
export const createTeamMember = (data) => apiFetch('/team', { method: 'POST', body: JSON.stringify(data) });
export const updateTeamMember = (id, data) => apiFetch(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTeamMember = (id) => apiFetch(`/team/${id}`, { method: 'DELETE' });

// Process
export const createStep = (data) => apiFetch('/process', { method: 'POST', body: JSON.stringify(data) });
export const updateStep = (id, data) => apiFetch(`/process/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteStep = (id) => apiFetch(`/process/${id}`, { method: 'DELETE' });
export const reorderSteps = (ids) => apiFetch('/process/reorder', { method: 'PUT', body: JSON.stringify({ ids }) });

// Content
export const updateAbout = (data) => apiFetch('/content/about', { method: 'PUT', body: JSON.stringify(data) });
export const updateContact = (data) => apiFetch('/content/contact', { method: 'PUT', body: JSON.stringify(data) });
export const updateHeroImage = (heroImage) => apiFetch('/content/hero', { method: 'PUT', body: JSON.stringify({ heroImage }) });
export const updateStats = (stats) => apiFetch('/content/stats', { method: 'PUT', body: JSON.stringify({ stats }) });

// Messages
export const getMessages = () => apiFetch('/messages');
export const createMessage = (data) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(data) });
export const updateMessage = (id, data) => apiFetch(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMessageApi = (id) => apiFetch(`/messages/${id}`, { method: 'DELETE' });

// Upload to Cloudinary
export const uploadImage = async (file) => {
  const token = getToken();
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erreur upload');
  }
  return res.json(); // { url, publicId }
};
