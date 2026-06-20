import { apiClient } from './apiClient';
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
export interface TeamResponse {
  team: number[];        // lista de IDs dos pokémons no time
  captured: number[];    // lista de IDs dos pokémons capturados
}
 
// ─── Time ─────────────────────────────────────────────────────────────────────
 
/**
 * GET /pokemon/v1/team?user-id=:userId
 * Retorna o time atual e os pokémons capturados do usuário.
 */
export async function getTeam(userId: string): Promise<TeamResponse> {
  const response = await apiClient.get<TeamResponse>('/pokemon/v1/team', {
    params: { 'user-id': userId },
  });
  return response.data;
}
 
/**
 * PUT /pokemon/v1/team?user-id=:userId&removed-pokemon=:removedId&new-pokemon=:newId
 * Troca um pokémon do time por outro.
 */
export async function updateTeam(
  userId: string,
  removedPokemonId: number,
  newPokemonId: number
): Promise<void> {
  await apiClient.put('/pokemon/v1/team', null, {
    params: {
      'user-id': userId,
      'removed-pokemon': removedPokemonId,
      'new-pokemon': newPokemonId,
    },
  });
}
 
/**
 * Inicializa o time do usuário com 5 pokémons aleatórios.
 * Chama PUT /pokemon/v1/team para cada pokémon adicionado.
 * Usa removed-pokemon=0 como convenção para "adicionar ao slot vazio".
 *
 * ATENÇÃO: Este endpoint PUT troca um pokémon por outro (removed -> new).
 * Para popular um time vazio, chamamos addCapturedPokemon + updateTeam.
 * A estratégia é: adicionar cada pokémon como capturado e depois ao time.
 */
export async function initializeTeamWithRandom(
  userId: string,
  randomIds: number[]
): Promise<void> {
  // Adiciona cada pokémon à lista de capturados e ao time em sequência
  for (const pokemonId of randomIds) {
    // Adiciona aos capturados primeiro
    await apiClient.put('/pokemon/v1/captured', null, {
      params: {
        'user-id': userId,
        'pokemon-id': pokemonId,
      },
    });
  }
 
  // Agora adiciona ao time: usa removed-pokemon=0 para slots vazios
  for (const pokemonId of randomIds) {
    await apiClient.put('/pokemon/v1/team', null, {
      params: {
        'user-id': userId,
        'removed-pokemon': 0,
        'new-pokemon': pokemonId,
      },
    });
  }
}
 
// ─── Pokémons Capturados ──────────────────────────────────────────────────────
 
/**
 * PUT /pokemon/v1/captured?user-id=:userId&pokemon-id=:pokemonId
 * Adiciona um pokémon à lista de capturados do usuário.
 */
export async function addCapturedPokemon(
  userId: string,
  pokemonId: number
): Promise<void> {
  await apiClient.put('/pokemon/v1/captured', null, {
    params: {
      'user-id': userId,
      'pokemon-id': pokemonId,
    },
  });
}
 
/**
 * DELETE /pokemon/v1/captured?user-id=:userId&pokemon-id=:pokemonId
 * Remove um pokémon da lista de capturados do usuário.
 */
export async function removeCapturedPokemon(
  userId: string,
  pokemonId: number
): Promise<void> {
  await apiClient.delete('/pokemon/v1/captured', {
    params: {
      'user-id': userId,
      'pokemon-id': pokemonId,
    },
  });
}