import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '@/components/header';
import { Colors, getColorDark } from '@/constants/colors';
import { TYPE_MAP, TYPE_ICONS } from '@/constants/pokemon';
import { useAuth } from '@/context/AuthContext';
import { getUserStats, UserStats } from '@/integration/authIntegration';
import { getPokemons } from '@/integration/pokemonIntegration';
import { Pokemon } from '@types/pokemon';
 
const isWeb = Platform.OS === 'web';
const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
 
// ── Insígnias de ginásio (Kanto) e progressão de nível ───────────────────────
// O nível é derivado das VITÓRIAS. Cada faixa de vitórias dá uma insígnia.
const GYM_BADGES = [
  { name: 'Pedra',     color: '#A1887F' }, // Boulder  (Brock)
  { name: 'Cascata',   color: '#4FC3F7' }, // Cascade  (Misty)
  { name: 'Trovão',    color: '#FFD54A' }, // Thunder  (Surge)
  { name: 'Arco-íris', color: '#68D391' }, // Rainbow  (Erika)
  { name: 'Alma',      color: '#F472B6' }, // Soul     (Koga)
  { name: 'Pântano',   color: '#C084FC' }, // Marsh    (Sabrina)
  { name: 'Vulcão',    color: '#FF7849' }, // Volcano  (Blaine)
  { name: 'Terra',     color: '#D4A373' }, // Earth    (Giovanni)
];
 
// Vitórias acumuladas necessárias para cada nível (1 a 8). Ajuste à vontade.
const WIN_THRESHOLDS = [0, 5, 12, 22, 35, 55, 80, 110];
 
function computeLevel(wins: number) {
  let level = 1;
  for (let i = 0; i < WIN_THRESHOLDS.length; i++) {
    if (wins >= WIN_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}
 
const TYPES = Object.keys(TYPE_ICONS); // tipos em pt
 
export default function ProfileTreinador() {
  const { user, userId } = useAuth();
  const [avatarUri, setAvatarUri]     = useState<string | null>(null);
  const [stats, setStats]             = useState<UserStats | null>(null);
  const [pokemons, setPokemons]       = useState<Pokemon[]>([]);
  const [favType, setFavType]         = useState<string | null>(null);
  const [favPokemonId, setFavPokemonId] = useState<number | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
 
  const [typeModal, setTypeModal]       = useState(false);
  const [pokemonModal, setPokemonModal] = useState(false);
 
  // ── Chaves vinculadas ao userId (não somem no logout) ─────────────────────
  const avatarKey     = userId ? `@Profile:avatar:${userId}` : null;
  const favTypeKey    = userId ? `@Profile:favType:${userId}` : null;
  const favPokemonKey = userId ? `@Profile:favPokemon:${userId}` : null;
 
  useEffect(() => {
    if (!userId) return;
 
    async function loadData() {
      try {
        setIsLoading(true);
 
        const [data, all] = await Promise.all([
          getUserStats(userId!),
          getPokemons(151),
        ]);
        setStats(data);
        setPokemons(all);
 
        // Avatar + preferências salvas localmente (vinculadas ao userId)
        if (avatarKey) {
          const savedAvatar = await AsyncStorage.getItem(avatarKey);
          if (savedAvatar) setAvatarUri(savedAvatar);
        }
        if (favTypeKey) {
          const savedType = await AsyncStorage.getItem(favTypeKey);
          if (savedType) setFavType(savedType);
        }
        if (favPokemonKey) {
          const savedPoke = await AsyncStorage.getItem(favPokemonKey);
          if (savedPoke) setFavPokemonId(Number(savedPoke));
        }
      } catch {
        setError('Não foi possível carregar as estatísticas.');
      } finally {
        setIsLoading(false);
      }
    }
 
    loadData();
  }, [userId]);
 
  // ── Cálculos derivados ─────────────────────────────────────────────────────
  const vitorias = Number(stats?.vitorias ?? 0);
  const derrotas = Number(stats?.derrotas ?? 0);
  const partidas = vitorias + derrotas;
  const winRate  = partidas > 0 ? Math.round((vitorias / partidas) * 100) : 0;
 
  const level     = computeLevel(vitorias);
  const badge     = GYM_BADGES[level - 1];
  const isMaxLvl  = level >= WIN_THRESHOLDS.length;
  const curThr    = WIN_THRESHOLDS[level - 1];
  const nextThr   = isMaxLvl ? curThr : WIN_THRESHOLDS[level];
  const xpPct     = isMaxLvl ? 100 : Math.round(((vitorias - curThr) / (nextThr - curThr)) * 100);
  const winsToNext = isMaxLvl ? 0 : nextThr - vitorias;
 
  // Cor de destaque: tipo favorito (se houver) tinge os detalhes; senão, dourado.
  const accent = favType ? getColorDark([favType]).accent : Colors.gold.base;
 
  const favPokemon = pokemons.find((p) => p.id === favPokemonId) ?? null;
 
  // ── Avatar (lógica original preservada — web only) ─────────────────────────
  function handlePickImage() {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const uri = ev.target?.result as string;
          setAvatarUri(uri);
          if (avatarKey) {
            await AsyncStorage.setItem(avatarKey, uri);
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  }
 
  // ── Seletores (persistem por userId) ───────────────────────────────────────
  async function pickType(t: string) {
    setFavType(t);
    setTypeModal(false);
    if (favTypeKey) await AsyncStorage.setItem(favTypeKey, t);
  }
 
  async function pickPokemon(p: Pokemon) {
    setFavPokemonId(p.id);
    setPokemonModal(false);
    if (favPokemonKey) await AsyncStorage.setItem(favPokemonKey, String(p.id));
  }
 
  if (isLoading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.gold.base} />
      </View>
    );
  }
 
  if (error) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <Text style={{ color: '#EF4444' }}>{error}</Text>
      </View>
    );
  }
 
  return (
    <View style={styles.wrapper}>
      <Header variant="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
 
        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={[styles.heroTopAccent, { backgroundColor: accent }]} />
 
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
            <View style={[styles.avatarContainer, { borderColor: accent }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>🎮</Text>
                </View>
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: accent }]}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
 
          <Text style={styles.trainerName}>{user ?? 'Treinador'}</Text>
          <View style={[styles.rankBadge, { borderColor: accent + '66', backgroundColor: accent + '18' }]}>
            <Text style={[styles.rankText, { color: accent }]}>
              NÍVEL {level} • INSÍGNIA {badge.name.toUpperCase()}
            </Text>
          </View>
        </View>
 
        {/* ── Nível & Insígnia (barra de XP) ── */}
        <Text style={styles.sectionTitle}>NÍVEL & INSÍGNIA</Text>
        <View style={styles.card}>
          <View style={styles.xpRow}>
            {/* Insígnia (losango) */}
            <View style={styles.badgeBox}>
              <View style={[styles.badgeDiamond, { backgroundColor: badge.color, borderColor: badge.color }]} />
              <Text style={styles.badgeLevel}>{level}</Text>
            </View>
 
            <View style={styles.xpInfo}>
              <View style={styles.xpHeaderRow}>
                <Text style={styles.xpBadgeName}>INSÍGNIA {badge.name}</Text>
                <Text style={[styles.xpLevel, { color: accent }]}>NÍVEL {level}</Text>
              </View>
 
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${xpPct}%` as any, backgroundColor: accent }]} />
              </View>
 
              <Text style={styles.xpHint}>
                {isMaxLvl
                  ? 'Nível máximo alcançado! Todas as insígnias conquistadas.'
                  : `${winsToNext} vitória(s) para a próxima insígnia (${GYM_BADGES[level].name})`}
              </Text>
            </View>
          </View>
        </View>
 
        {/* ── Estatísticas ── */}
        <Text style={styles.sectionTitle}>ESTATÍSTICAS</Text>
        <View style={styles.card}>
          <View style={styles.mainStatBlock}>
            <Text style={styles.mainStatValue}>{partidas}</Text>
            <Text style={styles.mainStatLabel}>PARTIDAS JOGADAS</Text>
          </View>
 
          <View style={styles.statsDivider} />
 
          <View style={styles.wlRow}>
            <View style={styles.wlBlock}>
              <Text style={[styles.wlValue, { color: '#22C55E' }]}>{vitorias}</Text>
              <Text style={styles.wlLabel}>VITÓRIAS</Text>
            </View>
 
            <View style={styles.winRateBlock}>
              <View style={[styles.winRateCircle, { borderColor: accent }]}>
                <Text style={[styles.winRateValue, { color: accent }]}>{winRate}%</Text>
                <Text style={[styles.winRateLabel, { color: accent }]}>WIN{'\n'}RATE</Text>
              </View>
            </View>
 
            <View style={styles.wlBlock}>
              <Text style={[styles.wlValue, { color: '#EF4444' }]}>{derrotas}</Text>
              <Text style={styles.wlLabel}>DERROTAS</Text>
            </View>
          </View>
 
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: '#22C55E' }]}>V</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${winRate}%` as any }]} />
            </View>
            <Text style={[styles.progressLabel, { color: '#EF4444' }]}>D</Text>
          </View>
        </View>
 
        {/* ── Preferências: Tipo favorito + Pokémon favorito ── */}
        <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
        <View style={styles.prefsRow}>
          {/* Tipo favorito */}
          <TouchableOpacity style={styles.prefCard} activeOpacity={0.85} onPress={() => setTypeModal(true)}>
            <Text style={styles.prefLabel}>TIPO FAVORITO</Text>
            {favType ? (
              <View style={[styles.prefTypePill, { backgroundColor: accent + '22', borderColor: accent + '66' }]}>
                <Text style={styles.prefTypeEmoji}>{TYPE_ICONS[favType] ?? '⭐'}</Text>
                <Text style={[styles.prefTypeName, { color: accent }]}>{favType}</Text>
              </View>
            ) : (
              <Text style={styles.prefEmpty}>Toque para escolher</Text>
            )}
          </TouchableOpacity>
 
          {/* Pokémon favorito */}
          <TouchableOpacity style={styles.prefCard} activeOpacity={0.85} onPress={() => setPokemonModal(true)}>
            <Text style={styles.prefLabel}>POKÉMON FAVORITO</Text>
            {favPokemon ? (
              <View style={styles.prefPokemon}>
                <Image source={{ uri: favPokemon.imagem }} style={styles.prefPokemonImg} resizeMode="contain" />
                <Text style={styles.prefPokemonName} numberOfLines={1}>{favPokemon.nome}</Text>
              </View>
            ) : (
              <Text style={styles.prefEmpty}>Toque para escolher</Text>
            )}
          </TouchableOpacity>
        </View>
 
      </ScrollView>
 
      {/* ── Modal: escolher tipo favorito ── */}
      <Modal visible={typeModal} transparent animationType="fade" onRequestClose={() => setTypeModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTypeModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalTopAccent, { backgroundColor: Colors.gold.base }]} />
            <Text style={styles.modalTitle}>ESCOLHA SEU TIPO FAVORITO</Text>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => {
                const c = getColorDark([t]).accent;
                const selected = favType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.8}
                    onPress={() => pickType(t)}
                    style={[
                      styles.typeChip,
                      { borderColor: selected ? c : Colors.dark.border, backgroundColor: selected ? c + '22' : Colors.dark.deepBg },
                    ]}
                  >
                    <Text style={styles.typeChipEmoji}>{TYPE_ICONS[t]}</Text>
                    <Text style={[styles.typeChipName, { color: selected ? c : Colors.whiteAlpha['65'] }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
 
      {/* ── Modal: escolher pokémon favorito ── */}
      <Modal visible={pokemonModal} transparent animationType="fade" onRequestClose={() => setPokemonModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPokemonModal(false)}>
          <Pressable style={[styles.modalCard, styles.modalCardTall]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalTopAccent, { backgroundColor: Colors.gold.base }]} />
            <Text style={styles.modalTitle}>ESCOLHA SEU POKÉMON FAVORITO</Text>
            <FlatList
              data={pokemons}
              keyExtractor={(item) => item.index}
              numColumns={4}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
              renderItem={({ item }) => {
                const c = getColorDark(item.tipos.map(mapType));
                const selected = favPokemonId === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => pickPokemon(item)}
                    style={[
                      styles.pokeTile,
                      { backgroundColor: c.bg, borderColor: selected ? Colors.gold.base : c.accent },
                    ]}
                  >
                    <Image source={{ uri: item.imagem }} style={styles.pokeTileImg} resizeMode="contain" />
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrapper:       { flex: 1, backgroundColor: Colors.dark.deepBg },
  centered:      { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
 
  // Hero
  heroCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: isWeb ? 28 : 16,
    marginTop: 8,
    borderRadius: 2,
    borderWidth: 1, borderColor: Colors.dark.border,
    alignItems: 'center',
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroTopAccent: { width: '100%', height: 3 },
  avatarWrapper:  { marginTop: 22, marginBottom: 12 },
  avatarContainer: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, overflow: 'hidden', backgroundColor: Colors.dark.deepBg,
  },
  avatarImage:       { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:       { fontSize: 40 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.dark.card,
  },
  editBadgeText: { fontSize: 11 },
  trainerName: { color: Colors.white, fontSize: isWeb ? 22 : 20, fontWeight: '900', letterSpacing: 1, textTransform: 'capitalize' },
  rankBadge: {
    marginTop: 8,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 2,
  },
  rankText: { fontSize: isWeb ? 10 : 9, fontWeight: '800', letterSpacing: 1.5 },
 
  sectionTitle: {
    color: Colors.gold.base, fontSize: isWeb ? 11 : 10,
    fontWeight: '800', letterSpacing: 3,
    paddingHorizontal: isWeb ? 28 : 16,
    marginTop: 22, marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: isWeb ? 28 : 16,
    borderRadius: 2, borderWidth: 1, borderColor: Colors.dark.border,
    padding: 18, gap: 14,
  },
 
  // XP / insígnia
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  badgeBox: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  badgeDiamond: {
    position: 'absolute', width: 38, height: 38, borderRadius: 4, borderWidth: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.9,
  },
  badgeLevel: { color: Colors.dark.deepBg, fontSize: 18, fontWeight: '900' },
  xpInfo: { flex: 1, gap: 6 },
  xpHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  xpBadgeName: { color: Colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  xpLevel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  xpBarBg: { height: 8, backgroundColor: Colors.dark.deepBg, borderRadius: 2, overflow: 'hidden', borderWidth: 1, borderColor: Colors.dark.border },
  xpBarFill: { height: '100%', borderRadius: 1 },
  xpHint: { color: Colors.whiteAlpha['45'], fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
 
  // Estatísticas
  mainStatBlock:  { alignItems: 'center' },
  mainStatValue:  { color: Colors.white, fontSize: isWeb ? 48 : 40, fontWeight: '900', lineHeight: isWeb ? 52 : 44 },
  mainStatLabel:  { color: Colors.whiteAlpha['45'], fontSize: isWeb ? 10 : 9, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  statsDivider:   { height: 1, backgroundColor: Colors.dark.border },
  wlRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  wlBlock:        { alignItems: 'center', gap: 4 },
  wlValue:        { fontSize: isWeb ? 28 : 24, fontWeight: '900' },
  wlLabel:        { color: Colors.whiteAlpha['45'], fontSize: isWeb ? 9 : 8, fontWeight: '700', letterSpacing: 1.5 },
  winRateBlock:   { alignItems: 'center' },
  winRateCircle: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.deepBg,
  },
  winRateValue:   { fontSize: isWeb ? 18 : 16, fontWeight: '900' },
  winRateLabel:   { fontSize: 8, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center', opacity: 0.8 },
  progressRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel:  { fontSize: 10, fontWeight: '800' },
  progressBg:     { flex: 1, height: 6, backgroundColor: 'rgba(239,68,68,0.25)', borderRadius: 2, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: '#22C55E', borderRadius: 2 },
 
  // Preferências
  prefsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: isWeb ? 28 : 16 },
  prefCard: {
    flex: 1, backgroundColor: Colors.dark.card,
    borderRadius: 2, borderWidth: 1, borderColor: Colors.dark.border,
    padding: 16, gap: 10, minHeight: 120, justifyContent: 'flex-start',
  },
  prefLabel: { color: Colors.gold.base, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  prefEmpty: { color: Colors.whiteAlpha['35'], fontSize: 11, fontWeight: '600', marginTop: 4 },
  prefTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 2, borderWidth: 1, marginTop: 4,
  },
  prefTypeEmoji: { fontSize: 14 },
  prefTypeName: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  prefPokemon: { alignItems: 'center', gap: 4, marginTop: 2 },
  prefPokemonImg: { width: 64, height: 64 },
  prefPokemonName: { color: Colors.white, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
 
  // Modais
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: Colors.dark.card, borderRadius: 2, borderWidth: 1, borderColor: Colors.dark.border, overflow: 'hidden', padding: 18 },
  modalCardTall: { maxHeight: '80%' },
  modalTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  modalTitle: { color: Colors.gold.base, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 14, marginTop: 4 },
 
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 2, borderWidth: 1 },
  typeChipEmoji: { fontSize: 14 },
  typeChipName: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'capitalize' },
 
  pokeTile: { flex: 1, aspectRatio: 1, borderRadius: 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center', maxWidth: '23.5%' },
  pokeTileImg: { width: '82%', height: '82%' },
});