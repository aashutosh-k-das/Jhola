import axios from 'axios';
import { loadJSON } from './storage';

export const AUTH_KEY = 'jhola_auth';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 20000 });

const getToken = () => loadJSON(AUTH_KEY)?.token;

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    const status = err.response?.status;
    const message =
      err.response?.data?.message ||
      (!err.response ? 'Unable to reach Jhola servers. Please check your connection.' : err.message);
    if (status === 401 && getToken()) window.dispatchEvent(new Event('jhola:unauthorized'));
    return Promise.reject(Object.assign(new Error(message), { status }));
  }
);

export default api;
