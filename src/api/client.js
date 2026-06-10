// yapp backend API istemcisi (axios) + token yönetimi (secure-store).
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Prod backend (Hetzner, nginx /yapp/ → localhost:4000, HTTPS).
export const API_BASE = 'https://167-233-44-62.sslip.io/yapp';

const TOKEN_KEY = 'yapp_token';
let memToken = null;

export async function loadToken() {
  if (memToken) return memToken;
  memToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memToken;
}
export async function setToken(t) {
  memToken = t;
  if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const t = await loadToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// ---- Auth ----
export const authDev = (name) => api.post('/auth/dev', { name }).then((r) => r.data);
export const authApple = (identityToken, name) => api.post('/auth/apple', { identityToken, name }).then((r) => r.data);
export const authGoogle = (idToken) => api.post('/auth/google', { idToken }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.user);
export const becomeDev = () => api.post('/auth/become-dev').then((r) => r.data.user);
export const acceptTerms = () => api.post('/auth/accept-terms').then((r) => r.data.user);

// ---- Taksonomi ----
export const getSectors = () => api.get('/sectors').then((r) => r.data.sectors);
export const getTemplates = (sector) => api.get('/templates', { params: { sector } }).then((r) => r.data.templates);

// ---- Vitrin ----
export const getStorefront = (params) => api.get('/storefront', { params }).then((r) => r.data.businesses);
export const getAppBySlug = (slug) => api.get(`/storefront/${slug}`).then((r) => r.data);

// ---- İndirilenler ----
export const getInstalls = () => api.get('/installs').then((r) => r.data.apps);
export const install = (businessId) => api.post(`/installs/${businessId}`).then((r) => r.data);
export const uninstall = (businessId) => api.delete(`/installs/${businessId}`).then((r) => r.data);

// ---- Satıcı başvurusu ----
export const sellerApply = (data) => api.post('/seller/apply', data).then((r) => r.data.user);
export const sellerStatus = () => api.get('/seller/status').then((r) => r.data.user);
export const adminPending = () => api.get('/seller/admin/pending').then((r) => r.data.applications);
export const adminApprove = (id) => api.post(`/seller/admin/${id}/approve`).then((r) => r.data.user);
export const adminReject = (id, reason) => api.post(`/seller/admin/${id}/reject`, { reason }).then((r) => r.data.user);

// ---- İşletme (dev) ----
export const myBusinesses = () => api.get('/businesses/mine').then((r) => r.data.businesses);
export const createBusiness = (data) => api.post('/businesses', data).then((r) => r.data.business);
export const getBusiness = (id) => api.get(`/businesses/${id}`).then((r) => r.data);
export const updateBusiness = (id, data) => api.put(`/businesses/${id}`, data).then((r) => r.data.business);
export const updateConfig = (id, data) => api.put(`/businesses/${id}/config`, data).then((r) => r.data.config);
export const publishBusiness = (id) => api.post(`/businesses/${id}/publish`).then((r) => r.data.business);
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`).then((r) => r.data);

export default api;
