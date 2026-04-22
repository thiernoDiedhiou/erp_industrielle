import axios from 'axios';
import { getSAToken, logoutSA } from './super-admin-auth';

export const saApi = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1',
});

saApi.interceptors.request.use((config) => {
  const token = getSAToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

saApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) logoutSA();
    return Promise.reject(err);
  },
);
