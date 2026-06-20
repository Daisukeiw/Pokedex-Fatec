import AsyncStorage from '@react-native-async-storage/async-storage';
 
// ─── Banco de Pokémons Capturados ─────────────────────────────────────────────
//
// O "banco" começa VAZIO e só cresce quando o jogador vence uma batalha e captura
// um pokémon do adversário. Os dados ficam salvos por usuário em
// `@Captured:{userId}` e NÃO são apagados no logout — assim o banco persiste
// entre sessões e recarregamentos, igual ao time.
//
// Guardamos apenas os IDs numéricos (ex.: 25 = Pikachu). Os dados visuais
// (nome, imagem, tipos) são resolvidos depois pela PokéAPI.
 
const capturedKey = (userId: string) => `@Captured:${userId}`;
 
/** Capacidade máxima do banco. */
export const MAX_CAPTURED = 25;
 
/** Lê os IDs dos pokémons capturados do usuário. Retorna [] se não houver nenhum. */
export async function getCapturedIds(userId: string): Promise<number[]> {
  const raw = await AsyncStorage.getItem(capturedKey(userId));
  return raw ? JSON.parse(raw) : [];
}
 
/**
 * Adiciona um pokémon ao banco (chamado ao VENCER uma batalha).
 * Ignora duplicados e respeita o teto de MAX_CAPTURED (25).
 * Retorna a lista atualizada de IDs.
 */
export async function addCapturedId(
  userId: string,
  pokemonId: number
): Promise<number[]> {
  const current = await getCapturedIds(userId);
  if (current.includes(pokemonId)) return current;     // já tem, não duplica
  if (current.length >= MAX_CAPTURED) return current;  // banco cheio, ignora
  const updated = [...current, pokemonId];
  await AsyncStorage.setItem(capturedKey(userId), JSON.stringify(updated));
  return updated;
}
 
/**
 * Sobrescreve a lista inteira do banco (usado em trocas time↔banco).
 * Sempre respeita o teto de MAX_CAPTURED (25).
 */
export async function setCapturedIds(
  userId: string,
  ids: number[]
): Promise<number[]> {
  const capped = ids.slice(0, MAX_CAPTURED);
  await AsyncStorage.setItem(capturedKey(userId), JSON.stringify(capped));
  return capped;
}
 
/** Remove um pokémon do banco. Retorna a lista atualizada de IDs. */
export async function removeCapturedId(
  userId: string,
  pokemonId: number
): Promise<number[]> {
  const current = await getCapturedIds(userId);
  const updated = current.filter((id) => id !== pokemonId);
  await AsyncStorage.setItem(capturedKey(userId), JSON.stringify(updated));
  return updated;
}
 