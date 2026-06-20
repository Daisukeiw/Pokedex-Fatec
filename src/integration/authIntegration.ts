import { apiClient } from './apiClient';
 
// ─── Tipos de resposta da API ─────────────────────────────────────────────────
 
export interface RegisterResponse {
  id: string;
  username: string;
}
 
export interface LoginResponse {
  userId: string;
  // A API não retorna token — autenticação é feita só com userId.
}
 
export interface UserStats {
  level: string;
  vitorias: string;
  derrotas: string;
}
 
// ─── Auth ─────────────────────────────────────────────────────────────────────
 
/**
 * POST /auth/v1/register
 * Cria uma nova conta na API. Retorna id e username do usuário criado.
 */
export async function registerUser(
  username: string,
  password: string
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/auth/v1/register', {
    username,
    password,
  });
  return response.data;
}
 
/**
 * POST /auth/v1/login
 * Autentica o usuário e retorna o token JWT + userId.
 */
export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/v1/login', {
    username,
    password,
  });
  return response.data;
}
 
// ─── Perfil / Stats ───────────────────────────────────────────────────────────
 
/**
 * GET /auth/v1/stats/:userId
 * Retorna as estatísticas (nível, vitórias, derrotas) do treinador.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const response = await apiClient.get<UserStats>(`/auth/v1/stats/${userId}`);
  return response.data;
}
 
/**
 * PUT /auth/v1/stats/:userId
 * Atualiza as estatísticas (nível, vitórias, derrotas) do treinador.
 */
export async function updateUserStats(
  userId: string,
  stats: UserStats
): Promise<void> {
  await apiClient.put(`/auth/v1/stats/${userId}`, stats);
}
 