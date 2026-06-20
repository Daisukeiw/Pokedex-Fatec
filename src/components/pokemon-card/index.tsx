import { Image, Text, View } from 'react-native';
import { styles } from './style';

//A maior parte daqui pedi ajuda para a IA, tentando entender, adiantar e criar uma estrutura pra API
export interface PokemonCardData {
  // ID oficial (ou interno) do Pokémon.
  id: number;
  // Nome exibido no card.
  name: string;
  // URL opcional da imagem (sprite/capa). Se ausente, mostramos fallback.
  imageUrl?: string;
  // Tipos do Pokémon (ex.: fire, water).
  types: string[];
  // Medidas normalizadas para UI.

  // Habilidade principal para exibir no rodapé do card.
  ability: string;
  // Stats principais, já em formato pronto para API.
  stats: {
    hp: number;
    attack: number;
    defense: number;
    SpecialAttack: number;
    SpecialDefense: number;
    Speed: number;
  };
}

interface PokemonCardProps {
  pokemon: PokemonCardData;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  // Evita renderização de imagem inválida quando não existe URL.
  const hasImage = Boolean(pokemon.imageUrl);

  return (
    <View style={styles.card}>
      {/* Cabeçalho: identificação + sprite do Pokémon. */}
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
          <Text style={styles.name}>{pokemon.name}</Text>
        </View>

        {hasImage ? (
          <Image source={{ uri: pokemon.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>?</Text>
          </View>
        )}
      </View>

      {/* Tipos renderizados dinamicamente para suportar 1 ou vários tipos vindos da API. */}
      <View style={styles.typesRow}>
        {pokemon.types.map((type) => (
          <View key={type} style={styles.typeBadge}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        ))}
      </View>

      {/* Linha de stats principais usadas no card resumido. */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>HP: {pokemon.stats.hp}</Text>
        <Text style={styles.statText}>Attack: {pokemon.stats.attack}</Text>
        <Text style={styles.statText}>Defense: {pokemon.stats.defense}</Text>
        <Text style={styles.statText}>Sp. Atk: {pokemon.stats.SpecialAttack}</Text>
        <Text style={styles.statText}>Sp. Def: {pokemon.stats.SpecialDefense}</Text>
        <Text style={styles.statText}>Speed: {pokemon.stats.Speed}</Text>
      </View>

      {/* Habilidade principal exibida abaixo dos atributos. */}
      <Text style={styles.abilityText}>Habilidade: {pokemon.ability}</Text>
    </View>
  );
}
