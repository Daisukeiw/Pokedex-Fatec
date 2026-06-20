import axios from 'axios';

// ─── Base URL da API Pokemon ──────────────────────────────────────────────────
const BASE_URL = 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

// ─── Instância Axios configurada ──────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s — evita travamento silencioso no Android
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor de requisição:
 * A API Pokemon não usa token JWT — sem injeção de Authorization.
 * O interceptor permanece para facilitar adição futura de headers.
 */
apiClient.interceptors.request.use((config) => {
  return config;
});

/**
 * Interceptor de resposta:
 * Loga erros de rede no console para facilitar diagnóstico no Android.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.warn('[apiClient] Erro de rede:', error?.message, error?.config?.url);
    }
    return Promise.reject(error);
  }
);
