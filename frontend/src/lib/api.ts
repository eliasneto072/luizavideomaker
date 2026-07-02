import axios from 'axios';

/**
 * Cliente HTTP da aplicação.
 *
 * Centraliza a comunicação com a API. Em desenvolvimento, o Vite faz
 * proxy de /api para o backend (evitando CORS); em produção, a mesma
 * base relativa funciona quando front e API compartilham o domínio.
 *
 * Um interceptor anexa automaticamente o token de admin (quando houver)
 * às requisições do painel. O token de acesso às galerias é tratado
 * separadamente, pois tem escopo próprio.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const ADMIN_TOKEN_KEY = 'lv_admin_token';

/** Salva ou remove o token de admin do armazenamento local. */
export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

/** Recupera o token de admin salvo (ou null). */
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

// Anexa o token de admin às requisições, quando presente.
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
