import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
 
import { Header } from '@/components/header';
import { PokeballLoading } from '@/components/pokeball-loading';
import { getPokemons } from '@/integration/pokemonIntegration';
import { Pokemon, Poder } from '@types/pokemon';
import { getColorDark, Colors } from '@/constants/colors';
import { TYPE_MAP, TYPE_ICONS } from '@/constants/pokemon';
 
// ─── Mapeamentos ──────────────────────────────────────────────────────────────
 
const STAT_ABBR: Record<string, string> = {
  hp:               'HP',
  attack:           'ATK',
  defense:          'DEF',
  'special-attack': 'SP.ATK',
  'special-defense':'SP.DEF',
  speed:            'SPD',
};
 
const STAT_COLOR_MAP: Record<string, string> = {
  hp:               Colors.stats.hp,
  attack:           Colors.stats.attack,
  defense:          Colors.stats.defense,
  'special-attack': Colors.stats.specialAttack,
  'special-defense':Colors.stats.specialDefense,
  speed:            Colors.stats.speed,
};
 
const STAT_BG_MAP: Record<string, string> = {
  hp:               Colors.stats.hpBg,
  attack:           Colors.stats.attackBg,
  defense:          Colors.stats.defenseBg,
  'special-attack': Colors.stats.specialAttackBg,
  'special-defense':Colors.stats.specialDefenseBg,
  speed:            Colors.stats.speedBg,
};
 
const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
const isWeb = Platform.OS === 'web';
 
// Lupa desenhada com Views (mesmo estilo "feito à mão" do sanduíche).
function MagnifierIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 13, height: 13, borderRadius: 999, borderWidth: 2, borderColor: color }} />
      <View style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 2, height: 7, borderRadius: 2, backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  );
}
 
// ─── Layout: tiles pequenos e quadrados (coleção de campeões do LoL) ──────────
const TILE_TARGET = isWeb ? 96 : 84;
const TILE_GAP    = 8;
const H_PAD       = 12;
 
export default function Dashboard() {
  const { width } = useWindowDimensions();
  const [loading, setLoading]           = useState(true);
  const [pokemons, setPokemons]         = useState<Pokemon[]>([]);
  const [selected, setSelected]         = useState<Pokemon | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
 
  // Busca: campo que desliza da direita
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const slide = useRef(new Animated.Value(1)).current; // 0 = aberto, 1 = escondido (à direita)
  const inputRef = useRef<TextInput>(null);
 
  function openSearch() {
    setSearchOpen(true);
    slide.setValue(1);
    Animated.timing(slide, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
      inputRef.current?.focus();
    });
  }
 
  function closeSearch() {
    Animated.timing(slide, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      setSearchOpen(false);
      setQuery('');
    });
  }
 
  function toggleSearch() {
    if (searchOpen) closeSearch();
    else openSearch();
  }
 
  // Filtra por nome OU número (id / índice formatado)
  const q = query.trim().toLowerCase();
  const filtered = q
    ? pokemons.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          String(p.id) === q ||
          String(p.id).includes(q) ||
          p.index.includes(q)
      )
    : pokemons;
 
  // Calcula quantas colunas cabem e distribui a largura igualmente.
  const available = width - H_PAD * 2;
  const cols      = Math.max(3, Math.floor((available + TILE_GAP) / (TILE_TARGET + TILE_GAP)));
  const tileSize  = Math.floor((available - TILE_GAP * (cols - 1)) / cols);
 
  useEffect(() => {
    async function load() {
      try {
        const all = await getPokemons(151);
        setPokemons(all);
      } catch (e) {
        console.error('Erro ao carregar pokémons:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
 
  const handleSelect = useCallback((pokemon: Pokemon) => {
    setSelected(pokemon);
    setModalVisible(true);
  }, []);
 
  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelected(null), 250);
  }, []);
 
  // ─── Tile quadrado ──────────────────────────────────────────────────────────
  const renderTile = (pokemon: Pokemon) => {
    const ptTypes  = pokemon.tipos.map(mapType);
    const colors   = getColorDark(ptTypes);
    const isChosen = selected?.index === pokemon.index && modalVisible;
 
    return (
      <TouchableOpacity
        key={pokemon.index}
        activeOpacity={0.8}
        onPress={() => handleSelect(pokemon)}
        style={{ width: tileSize }}
      >
        <View
          style={[
            styles.tile,
            {
              width: tileSize,
              height: tileSize,
              backgroundColor: colors.bg,
              borderColor: isChosen ? Colors.gold.base : colors.accent,
            },
          ]}
        >
          {isChosen && (
            <>
              <View style={[styles.cornerTL, { borderColor: Colors.gold.base }]} />
              <View style={[styles.cornerBR, { borderColor: Colors.gold.base }]} />
            </>
          )}
 
          <Image
            source={{ uri: pokemon.imagem }}
            style={{ width: tileSize * 0.86, height: tileSize * 0.86 }}
            resizeMode="contain"
          />
 
          <Text style={[styles.tileIndex, { color: colors.accent + 'AA' }]}>
            {String(pokemon.index).padStart(3, '0')}
          </Text>
        </View>
 
        <Text
          style={[styles.tileName, { color: isChosen ? Colors.gold.base : Colors.whiteAlpha['65'] }]}
          numberOfLines={1}
        >
          {pokemon.nome}
        </Text>
      </TouchableOpacity>
    );
  };
 
  // ─── Modal de detalhe ─────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selected) return null;
 
    const ptTypes = selected.tipos.map(mapType);
    const colors  = getColorDark(ptTypes);
    const abilities: string[] = Array.from(new Set(selected.habilidades ?? []));
 
    // Somatória de poder (BST) — total das stats base.
    const totalPoder = selected.poderes.reduce((sum, p) => sum + p.forca, 0);
 
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.modalBackdrop} onPress={handleClose}>
          <Pressable
            style={[
              styles.modalCard,
              { borderColor: colors.accent },
              Platform.OS === 'web'
                ? ({ boxShadow: `0 0 48px ${colors.glow}, 0 24px 64px rgba(0,0,0,0.7)` } as any)
                : {
                    shadowColor: colors.accent,
                    shadowOpacity: 0.45,
                    shadowRadius: 24,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 16,
                  },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalTopBar, { backgroundColor: Colors.gold.base }]} />
 
            <View style={[styles.modalHeader, { backgroundColor: colors.bg }]}>
              <Text style={[styles.modalIndex, { color: colors.accent + '66' }]}>
                #{String(selected.index).padStart(3, '0')}
              </Text>
 
              <Image source={{ uri: selected.imagem }} style={styles.modalImage} resizeMode="contain" />
 
              <View style={styles.modalNameRow}>
                <Text style={[styles.modalName, { color: Colors.white }]}>{selected.nome}</Text>
                <View style={styles.modalTypesRow}>
                  {ptTypes.map((t: string) => (
                    <View
                      key={t}
                      style={[
                        styles.modalTypePill,
                        { backgroundColor: colors.accent + '22', borderColor: colors.accent + '66' },
                      ]}
                    >
                      <Text style={styles.modalTypeEmoji}>{TYPE_ICONS[t] ?? '⚪'}</Text>
                      <Text style={[styles.modalTypeLabel, { color: colors.accent }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
 
            <View style={styles.modalBody}>
              {/* ── Atributos ── */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <View style={[styles.modalSectionAccent, { backgroundColor: Colors.gold.base }]} />
                  <Text style={styles.modalSectionTitle}>ATRIBUTOS</Text>
                  {/* Somatória de poder */}
                  <View style={styles.totalBadge}>
                    <Text style={styles.totalBadgeLabel}>PODER TOTAL</Text>
                    <Text style={styles.totalBadgeValue}>{totalPoder}</Text>
                  </View>
                </View>
 
                <View style={styles.statsGrid}>
                  {selected.poderes.map((poder: Poder) => {
                    const statColor = STAT_COLOR_MAP[poder.nome] ?? colors.accent;
                    const statBg    = STAT_BG_MAP[poder.nome]    ?? colors.accent + '15';
                    const pct       = Math.min((poder.forca / 150) * 100, 100);
                    const label     = STAT_ABBR[poder.nome] ?? poder.nome.slice(0, 4).toUpperCase();
 
                    return (
                      <View key={poder.nome} style={[styles.statCard, { backgroundColor: statBg }]}>
                        <Text style={[styles.statCardLabel, { color: statColor }]}>{label}</Text>
                        <Text style={[styles.statCardValue, { color: statColor }]}>{poder.forca}</Text>
                        <View style={styles.statCardBarBg}>
                          <View style={[styles.statCardBarFill, { width: `${pct}%` as any, backgroundColor: statColor }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
 
              {/* ── Habilidades ── */}
              {abilities.length > 0 && (
                <View style={[styles.modalSection, styles.modalSectionLast]}>
                  <View style={styles.modalSectionHeader}>
                    <View style={[styles.modalSectionAccent, { backgroundColor: Colors.gold.base }]} />
                    <Text style={styles.modalSectionTitle}>HABILIDADES</Text>
                  </View>
 
                  <View style={styles.abilitiesRow}>
                    {abilities.map((ab: string) => (
                      <View
                        key={ab}
                        style={[styles.abilityPill, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '44' }]}
                      >
                        <Text style={[styles.abilityText, { color: colors.accent }]}>{ab.replace(/-/g, ' ')}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
 
            <TouchableOpacity style={styles.modalClose} onPress={handleClose}>
              <View style={[styles.modalCloseInner, { borderColor: Colors.dark.border }]}>
                <Text style={styles.modalCloseText}>✕</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };
 
  return (
    <View style={styles.wrapper}>
      <Header
        showGreeting
        variant="dark"
        right={
          <TouchableOpacity
            onPress={toggleSearch}
            style={styles.searchBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <MagnifierIcon color={Colors.gold.base} />
          </TouchableOpacity>
        }
      />
 
      {/* Campo de busca deslizante (direita → esquerda) */}
      {searchOpen && (
        <View style={styles.searchBarRow}>
          <Animated.View
            style={[
              styles.searchBar,
              {
                opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
              },
            ]}
          >
            <MagnifierIcon color={Colors.whiteAlpha['45']} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nome ou número..."
              placeholderTextColor={Colors.whiteAlpha['35']}
              selectionColor={Colors.gold.base}
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />
            <TouchableOpacity onPress={closeSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClose}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
 
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowLine} />
        <Text style={styles.eyebrowText}>
          {q ? `${filtered.length} RESULTADO(S)` : 'GERAÇÃO I • 151 POKÉMON'}
        </Text>
        <View style={styles.eyebrowLine} />
      </View>
 
      {loading ? (
        <PokeballLoading />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <Text style={styles.noResults}>
              Nenhum pokémon encontrado para "{query.trim()}".
            </Text>
          ) : (
            <View style={[styles.grid, { paddingHorizontal: H_PAD, gap: TILE_GAP }]}>
              {filtered.map(renderTile)}
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
 
      {renderModal()}
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.dark.deepBg },
 
  // Busca
  searchBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 2, borderWidth: 1, borderColor: Colors.gold.alpha30, backgroundColor: 'transparent',
  },
  searchBarRow: { paddingHorizontal: isWeb ? 28 : 16, paddingBottom: 8, overflow: 'hidden' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 46, paddingHorizontal: 14,
    backgroundColor: Colors.dark.card, borderRadius: 2,
    borderWidth: 1, borderColor: Colors.gold.alpha30,
  },
  searchInput: {
    flex: 1, color: Colors.white, fontSize: 14, letterSpacing: 0.3,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  searchClose: { color: Colors.whiteAlpha['55'], fontSize: 14, fontWeight: '700' },
  noResults: { color: Colors.whiteAlpha['45'], fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
 
  eyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  eyebrowLine: { flex: 1, height: 1, backgroundColor: Colors.gold.base, opacity: 0.4 },
  eyebrowText: { color: Colors.gold.base, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
 
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'flex-start' },
  bottomSpacer: { height: 24 },
 
  tile: {
    borderRadius: 2, borderWidth: 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    ...(Platform.OS !== 'web'
      ? { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 5, elevation: 4 }
      : { boxShadow: '0 2px 10px rgba(0,0,0,0.45)' } as any),
  },
  tileIndex: { position: 'absolute', bottom: 2, right: 3, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  tileName: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'capitalize', textAlign: 'center', marginTop: 4 },
  cornerTL: { position: 'absolute', top: 3, left: 3, width: 10, height: 10, borderTopWidth: 2, borderLeftWidth: 2, zIndex: 2 },
  cornerBR: { position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderBottomWidth: 2, borderRightWidth: 2, zIndex: 2 },
 
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: Colors.dark.card, borderRadius: 2, borderWidth: 1.5, overflow: 'hidden', maxHeight: '90%' },
  modalTopBar: { height: 2, width: '100%' },
 
  modalHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, gap: 8 },
  modalIndex: { fontSize: 10, fontWeight: '700', letterSpacing: 3, alignSelf: 'flex-start' },
  modalImage: { width: 140, height: 140 },
  modalNameRow: { alignItems: 'center', gap: 8, width: '100%' },
  modalName: { fontSize: 22, fontWeight: '900', letterSpacing: 1.5, textTransform: 'capitalize', textAlign: 'center' },
  modalTypesRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  modalTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2, borderWidth: 1 },
  modalTypeEmoji: { fontSize: 12 },
  modalTypeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
 
  modalBody: { borderTopWidth: 1, borderTopColor: Colors.dark.border, paddingBottom: 16 },
  modalBodyContent: { paddingBottom: 16 },
 
  modalSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  modalSectionLast: { borderBottomWidth: 0 },
  modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalSectionAccent: { width: 2, height: 12 },
  modalSectionTitle: { color: Colors.whiteAlpha['55'], fontSize: 9, fontWeight: '800', letterSpacing: 3 },
 
  // Badge da somatória de poder (BST)
  totalBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.gold.alpha30, backgroundColor: Colors.gold.bg,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2,
  },
  totalBadgeLabel: { color: Colors.gold.base, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  totalBadgeValue: { color: Colors.gold.light, fontSize: 12, fontWeight: '900' },
 
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statCard: { width: '30.5%', borderRadius: 2, padding: 10, gap: 4 },
  statCardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  statCardValue: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  statCardBarBg: { height: 3, backgroundColor: Colors.whiteAlpha['08'], borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  statCardBarFill: { height: '100%', borderRadius: 2 },
 
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  abilityPill: { borderRadius: 2, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  abilityText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'capitalize' },
 
  modalClose: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  modalCloseInner: { width: 28, height: 28, borderRadius: 2, borderWidth: 1, backgroundColor: Colors.dark.deepBg, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { color: Colors.whiteAlpha['55'], fontSize: 12, fontWeight: '700', lineHeight: 14 },
});
