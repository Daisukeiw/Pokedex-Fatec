import { apiClient } from './apiClient';
import { Pokemon } from '@types/pokemon';

// ─── Mapeia o pokémon vindo do servidor para o formato do app ─────────────────
// Servidor: { index:"86", name, image, types:[], abilities:[{name,strength}] }
// App:      { id, index:"086", nome, imagem, tipos:[], poderes:[{nome,forca}] }
function mapServerPokemon(sp: any): Pokemon {
  return {
    id: Number(sp.index),
    index: String(sp.index).padStart(3, '0'),
    nome: sp.name,
    imagem: sp.image,
    tipos: sp.types ?? [],
    poderes: (sp.abilities ?? []).map((a: any) => ({ nome: a.name, forca: a.strength })),
    habilidades: [],
  };
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TeamResponse {
  team: Pokemon[];      // pokémons no time (já no formato do app)
  captured: Pokemon[];  // pokémons capturados (banco)
}

// ─── Time ─────────────────────────────────────────────────────────────────────

/**
 * GET /pokemon/v1/team?user-id=:userId
 * Retorna o time atual e os pokémons capturados do usuário, já convertidos
 * para o formato usado pelo app. Essa é a FONTE DE VERDADE do time — por isso
 * fica igual em qualquer dispositivo logado na mesma conta.
 */
export async function getTeam(userId: string): Promise<TeamResponse> {
  const response = await apiClient.get('/pokemon/v1/team', {
    params: { 'user-id': userId },
  });
  const data = response.data ?? {};
  return {
    team:     (data.team ?? []).map(mapServerPokemon),
    captured: (data.capture ?? []).map(mapServerPokemon), // servidor usa "capture"
  };
}

/**
 * PUT /pokemon/v1/team?user-id=:userId&removed-pokemon=:removedId&new-pokemon=:newId
 * Troca um pokémon do time por outro (usado quando a batalha for implementada).
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

// ─── Pokémons Capturados ──────────────────────────────────────────────────────

/**
 * PUT /pokemon/v1/captured?user-id=:userId&pokemon-id=:pokemonId
 * Adiciona um pokémon à lista de capturados do usuário (ao vencer batalhas).
 */
export async function addCapturedPokemon(
  userId: string,
  pokemonId: number
): Promise<void> {
  await apiClient.put('/pokemon/v1/captured', null, {
    params: { 'user-id': userId, 'pokemon-id': pokemonId },
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
    params: { 'user-id': userId, 'pokemon-id': pokemonId },
  });
}
