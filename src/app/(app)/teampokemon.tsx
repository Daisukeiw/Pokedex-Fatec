import React, { useEffect, useState } from 'react';
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
    FlatList,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '@/components/header';
import { Alert } from '@/components/alert';
import { Colors, getColorDark } from '@/constants/colors';
import { getTeam } from '@/integration/teamIntegration';
import { setCapturedIds, MAX_CAPTURED } from '@/storage/capturedStorage';
import { useAuth } from '@/context/AuthContext';
import { Pokemon } from '@types/pokemon';
import { TYPE_MAP, TYPE_ICONS } from '@/constants/pokemon';
 
const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
const TEAM_SIZE = 5;

// Soma das stats base de um pokémon (BST).
const pokemonPower = (p: Pokemon) => p.poderes.reduce((s, x) => s + x.forca, 0);

// Mapas de exibição das stats (iguais aos da Pokédex)
const STAT_ABBR: Record<string, string> = {
    hp: 'HP', attack: 'ATK', defense: 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
};
const STAT_COLOR_MAP: Record<string, string> = {
    hp: Colors.stats.hp, attack: Colors.stats.attack, defense: Colors.stats.defense,
    'special-attack': Colors.stats.specialAttack, 'special-defense': Colors.stats.specialDefense, speed: Colors.stats.speed,
};
const STAT_BG_MAP: Record<string, string> = {
    hp: Colors.stats.hpBg, attack: Colors.stats.attackBg, defense: Colors.stats.defenseBg,
    'special-attack': Colors.stats.specialAttackBg, 'special-defense': Colors.stats.specialDefenseBg, speed: Colors.stats.speedBg,
};
 
// ─── Componentes internos ─────────────────────────────────────────────────────
 
function TeamSlot({ pokemon, index, onPress, onRemove }: {
    pokemon: Pokemon | null;
    index: number;
    onPress: () => void;
    onRemove: () => void;
}) {
    const colors = pokemon
        ? getColorDark(pokemon.tipos.map(mapType))
        : { bg: Colors.dark.cardAlt, accent: Colors.whiteAlpha['35'], glow: '' };
 
    return (
        <TouchableOpacity
            style={[
                styles.teamSlot,
                { backgroundColor: colors.bg, borderColor: pokemon ? colors.accent : Colors.dark.border },
                !pokemon && styles.teamSlotEmpty,
            ]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {pokemon ? (
                <>
                    <TouchableOpacity
                        style={styles.removeBadge}
                        onPress={onRemove}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.removeBadgeText}>−</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: pokemon.imagem }} style={styles.teamSlotImage} resizeMode="contain" />
                    <Text style={[styles.teamSlotName, { color: colors.accent }]} numberOfLines={1}>
                        {pokemon.nome.toUpperCase()}
                    </Text>
                    <Text style={[styles.teamSlotIndex, { color: colors.accent + 'AA' }]}>
                        #{pokemon.index}
                    </Text>
                </>
            ) : (
                <>
                    <View style={styles.emptySlotCircle}>
                        <Text style={styles.emptySlotPlus}>+</Text>
                    </View>
                    <Text style={styles.emptySlotLabel}>SLOT {index + 1}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
 
function BenchCard({ pokemon, onSelect, inTeam }: {
    pokemon: Pokemon;
    onSelect: () => void;
    inTeam: boolean;
}) {
    const colors = getColorDark(pokemon.tipos.map(mapType));
    return (
        <TouchableOpacity
            style={[
                styles.benchCard,
                { backgroundColor: colors.bg, borderColor: colors.accent },
                inTeam && styles.benchCardInTeam,
            ]}
            onPress={onSelect}
            activeOpacity={0.75}
            disabled={inTeam}
        >
            {inTeam && (
                <View style={styles.inTeamOverlay}>
                    <Text style={styles.inTeamText}>✓ No Time</Text>
                </View>
            )}
            <Image source={{ uri: pokemon.imagem }} style={styles.benchImage} resizeMode="contain" />
            <Text style={[styles.benchName, { color: colors.accent }]} numberOfLines={1}>
                {pokemon.nome.toUpperCase()}
            </Text>
            <Text style={[styles.benchIndex, { color: colors.accent + '99' }]}>#{pokemon.index}</Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.accent + '22', borderColor: colors.accent + '44' }]}>
                <Text style={[styles.typeBadgeText, { color: colors.accent }]}>
                    {pokemon.tipos[0]?.toUpperCase() ?? '?'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
 
// ─── Tela principal ───────────────────────────────────────────────────────────
 
export default function TeamPokemon() {
    const { userId } = useAuth();
 
    const [loading, setLoading]           = useState(true);
    const [bench, setBench]               = useState<Pokemon[]>([]);
    const [team, setTeam]                 = useState<(Pokemon | null)[]>(Array(TEAM_SIZE).fill(null));
    const [editingSlot, setEditingSlot]   = useState<number | null>(null);

    // Detalhes de um pokémon do time (abre ao tocar no card)
    const [detailSlot, setDetailSlot]       = useState<number | null>(null);
    const [confirmRelease, setConfirmRelease] = useState(false);

    // Pop-up reutilizável de aviso
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMsg, setAlertMsg]         = useState('');
    function showPopup(message: string) {
        setAlertMsg(message);
        setAlertVisible(true);
    }
 
    // Chave do time vinculada ao userId — igual à lógica do avatar
    const teamKey = userId ? `@Team:${userId}` : null;
 
    // ── Carrega time + banco do SERVIDOR (fonte de verdade, igual em todo aparelho)
    useEffect(() => {
        async function load() {
            if (!userId) { setLoading(false); return; }
            try {
                const { team: serverTeam, captured } = await getTeam(userId);

                // Time: completa até TEAM_SIZE slots
                const teamSlots: (Pokemon | null)[] = [...serverTeam];
                while (teamSlots.length < TEAM_SIZE) teamSlots.push(null);
                setTeam(teamSlots.slice(0, TEAM_SIZE));

                // Banco (capturados) vem do servidor
                setBench(captured);
            } catch (e) {
                console.error('Erro ao carregar o time do servidor:', e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [userId]);
 
    // ── Salva o time atual no AsyncStorage ────────────────────────────────────
    async function saveTeam(newTeam: (Pokemon | null)[]) {
        if (!teamKey) return;
        const ids = newTeam.map((p) => p?.id ?? null).filter(Boolean) as number[];
        // Salva somente os IDs dos pokémons presentes (null = slot vazio ignorado)
        await AsyncStorage.setItem(teamKey, JSON.stringify(ids));
    }

    // ── Salva o banco (capturados) no AsyncStorage ────────────────────────────
    async function saveBench(newBench: Pokemon[]) {
        if (!userId) return;
        await setCapturedIds(userId, newBench.map((p) => p.id));
    }

    // ── Toque no slot ─────────────────────────────────────────────────────────
    // Slot preenchido → abre os detalhes do pokémon (com opções).
    // Slot vazio → adiciona um pokémon do banco (precisa de banco).
    function handleSlotPress(slotIndex: number) {
        if (team[slotIndex]) {
            setDetailSlot(slotIndex);
            setConfirmRelease(false);
            return;
        }
        if (bench.length === 0) {
            showPopup('Para modificar seu time vença ao menos 1 batalha');
            return;
        }
        setEditingSlot(slotIndex);
    }

    function closeDetail() {
        setDetailSlot(null);
        setConfirmRelease(false);
    }

    // ── "Trocar Pokémon" (a partir dos detalhes) → abre o banco para o slot ───
    function handleSwapFromDetail() {
        if (bench.length === 0) {
            showPopup('Para modificar seu time vença ao menos 1 batalha');
            return;
        }
        const slot = detailSlot;
        closeDetail();
        setEditingSlot(slot);
    }

    // ── "Libertar Pokémon" → remove do time PARA SEMPRE (não vai pro banco) ───
    async function handleRelease() {
        if (detailSlot === null) return;
        // Regra: só altera o time com pelo menos 1 pokémon no banco
        if (bench.length === 0) {
            showPopup('Para modificar seu time vença ao menos 1 batalha');
            return;
        }
        const newTeam = [...team];
        newTeam[detailSlot] = null;
        setTeam(newTeam);
        await saveTeam(newTeam); // banco NÃO é alterado → pokémon perdido
        closeDetail();
    }
 
    // ── Troca/coloca pokémon do banco em um slot do time ──────────────────────
    // Move o pokémon escolhido do BANCO para o slot. Se o slot já tinha um
    // pokémon, esse antigo volta para o BANCO (troca). Pools são disjuntos.
    async function handleSelectPokemon(pokemon: Pokemon) {
        if (editingSlot === null) return;

        const newTeam = [...team];
        const previous = newTeam[editingSlot]; // pode ser null
        newTeam[editingSlot] = pokemon;

        // tira o escolhido do banco; devolve o antigo (se havia) ao banco
        let newBench = bench.filter((p) => p.id !== pokemon.id);
        if (previous) newBench = [...newBench, previous];

        setTeam(newTeam);
        setBench(newBench);
        setEditingSlot(null);
        await Promise.all([saveTeam(newTeam), saveBench(newBench)]);
    }
 
    // ── Remove pokémon do time → vai para o banco ─────────────────────────────
    async function handleRemoveFromTeam(slotIndex: number) {
        // 1) Trava: precisa ter vencido ao menos 1 batalha (banco não vazio)
        if (bench.length === 0) {
            showPopup('Para modificar seu time vença ao menos 1 batalha');
            return;
        }
        const removed = team[slotIndex];
        if (!removed) return;

        // 2) Teto: o banco não pode passar de 25 pokémons
        if (bench.length >= MAX_CAPTURED) {
            showPopup(`Seu banco está cheio (${MAX_CAPTURED}/${MAX_CAPTURED}). Libere espaço antes de retirar do time.`);
            return;
        }

        // 3) Move o pokémon do time para o banco
        const newTeam = [...team];
        newTeam[slotIndex] = null;
        const newBench = [...bench, removed];

        setTeam(newTeam);
        setBench(newBench);
        await Promise.all([saveTeam(newTeam), saveBench(newBench)]);
    }
 
    const filledSlots = team.filter(Boolean).length;
    // Poder total do time = soma das stats base de cada pokémon presente.
    const teamPower = team.reduce((sum, p) => sum + (p ? pokemonPower(p) : 0), 0);

    // Pokémon atualmente em detalhe (e suas cores/total)
    const detailPokemon = detailSlot !== null ? team[detailSlot] : null;
    const detailColors = detailPokemon
        ? getColorDark(detailPokemon.tipos.map(mapType))
        : { bg: Colors.dark.card, accent: Colors.gold.base, glow: '' };
    const detailTotal = detailPokemon ? pokemonPower(detailPokemon) : 0;
 
    if (loading) {
        return (
            <View style={styles.wrapper}>
                <Header variant="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.gold.base} />
                    <Text style={styles.loadingText}>Carregando pokémons...</Text>
                </View>
            </View>
        );
    }
 
    return (
        <View style={styles.wrapper}>
            <Header variant="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
 
                {/* Header do time */}
                <View style={styles.teamHeaderRow}>
                    <View>
                        <Text style={styles.pageTitle}>MEU TIME</Text>
                        <Text style={styles.pageSubtitle}>
                            {filledSlots}/{TEAM_SIZE} pokémons selecionados
                        </Text>
                    </View>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>{filledSlots}</Text>
                        <Text style={styles.counterMax}>/{TEAM_SIZE}</Text>
                    </View>
                </View>
 
                {/* Grade de slots */}
                <View style={styles.teamGrid}>
                    {team.map((pokemon, i) => (
                        <TeamSlot
                            key={i}
                            index={i}
                            pokemon={pokemon}
                            onPress={() => handleSlotPress(i)}
                            onRemove={() => handleRemoveFromTeam(i)}
                        />
                    ))}
                </View>

                {/* Poder total do time */}
                <View style={styles.powerPanel}>
                    <View style={styles.powerAccent} />
                    <View style={styles.powerTextWrap}>
                        <Text style={styles.powerLabel}>PODER TOTAL DO TIME</Text>
                        <Text style={styles.powerHint}>soma das stats base dos {filledSlots} pokémon</Text>
                    </View>
                    <Text style={styles.powerValue}>{teamPower}</Text>
                </View>

                <Text style={styles.teamHint}>
                    Toque em um slot para escolher/trocar • Toque na esfera (−) para remover
                </Text>
 
                {/* Banco de reserva */}
                <Text style={styles.sectionTitle}>BANCO DE POKÉMONS</Text>
                <Text style={styles.benchSubtitle}>
                    {bench.length === 0
                        ? 'Vazio — vença batalhas para capturar pokémons do adversário'
                        : `${bench.length}/${MAX_CAPTURED} no banco — toque para colocar no time`}
                </Text>
 
                {bench.length === 0 ? (
                    <View style={styles.benchEmpty}>
                        <Text style={styles.benchEmptyText}>
                            Seu banco está vazio.{'\n'}
                            Vença batalhas para capturar os pokémons do adversário!
                        </Text>
                    </View>
                ) : (
                    <View style={styles.benchGrid}>
                        {bench.map((pokemon) => (
                            <BenchCard
                                key={pokemon.index}
                                pokemon={pokemon}
                                inTeam={false}
                                onSelect={() => {
                                    const firstEmpty = team.findIndex((s) => s === null);
                                    if (firstEmpty === -1) {
                                        showPopup('Seu time já está completo (5/5). Retire um pokémon antes de adicionar outro.');
                                        return;
                                    }
                                    const newTeam = [...team];
                                    newTeam[firstEmpty] = pokemon;
                                    const newBench = bench.filter((p) => p.id !== pokemon.id);
                                    setTeam(newTeam);
                                    setBench(newBench);
                                    saveTeam(newTeam);
                                    saveBench(newBench);
                                }}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
 
            {/* Modal de seleção para slot específico */}
            <Modal
                visible={editingSlot !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setEditingSlot(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setEditingSlot(null)}>
                    <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalTopAccent} />
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>ESCOLHER PARA SLOT {(editingSlot ?? 0) + 1}</Text>
                        <Text style={styles.modalSubtitle}>Selecione um pokémon do banco</Text>
                        <FlatList
                            data={bench}
                            keyExtractor={(item) => item.index}
                            numColumns={3}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <Text style={styles.modalEmptyText}>
                                    Nenhum pokémon no banco ainda.{'\n'}
                                    Vença batalhas para capturar!
                                </Text>
                            }
                            renderItem={({ item }) => {
                                const colors = getColorDark(item.tipos.map(mapType));
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalCard,
                                            { backgroundColor: colors.bg, borderColor: colors.accent },
                                        ]}
                                        onPress={() => handleSelectPokemon(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Image source={{ uri: item.imagem }} style={styles.modalCardImage} resizeMode="contain" />
                                        <Text style={[styles.modalCardName, { color: colors.accent }]} numberOfLines={1}>
                                            {item.nome.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>

            {/* Modal de DETALHES do pokémon do time (toque no card) */}
            <Modal
                visible={detailSlot !== null && !!detailPokemon}
                transparent
                animationType="fade"
                onRequestClose={closeDetail}
                statusBarTranslucent
            >
                <Pressable style={styles.detailBackdrop} onPress={closeDetail}>
                    {detailPokemon && (
                        <Pressable
                            style={[styles.detailCard, { borderColor: detailColors.accent }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={[styles.detailTopBar, { backgroundColor: Colors.gold.base }]} />

                            {/* Cabeçalho */}
                            <View style={[styles.detailHeader, { backgroundColor: detailColors.bg }]}>
                                <Text style={[styles.detailIndex, { color: detailColors.accent + '66' }]}>
                                    #{detailPokemon.index}
                                </Text>
                                <Image source={{ uri: detailPokemon.imagem }} style={styles.detailImage} resizeMode="contain" />
                                <Text style={styles.detailName}>{detailPokemon.nome}</Text>
                                <View style={styles.detailTypesRow}>
                                    {detailPokemon.tipos.map(mapType).map((t) => (
                                        <View
                                            key={t}
                                            style={[styles.detailTypePill, { backgroundColor: detailColors.accent + '22', borderColor: detailColors.accent + '66' }]}
                                        >
                                            <Text style={styles.detailTypeEmoji}>{TYPE_ICONS[t] ?? '⚪'}</Text>
                                            <Text style={[styles.detailTypeLabel, { color: detailColors.accent }]}>{t}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Atributos */}
                            <View style={styles.detailSection}>
                                <View style={styles.detailSectionHeader}>
                                    <View style={[styles.detailSectionAccent, { backgroundColor: Colors.gold.base }]} />
                                    <Text style={styles.detailSectionTitle}>ATRIBUTOS</Text>
                                    <View style={styles.detailTotalBadge}>
                                        <Text style={styles.detailTotalLabel}>PODER TOTAL</Text>
                                        <Text style={styles.detailTotalValue}>{detailTotal}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailStatsGrid}>
                                    {detailPokemon.poderes.map((poder) => {
                                        const sc = STAT_COLOR_MAP[poder.nome] ?? detailColors.accent;
                                        const sb = STAT_BG_MAP[poder.nome] ?? detailColors.accent + '15';
                                        const pct = Math.min((poder.forca / 150) * 100, 100);
                                        const label = STAT_ABBR[poder.nome] ?? poder.nome.slice(0, 4).toUpperCase();
                                        return (
                                            <View key={poder.nome} style={[styles.detailStatCard, { backgroundColor: sb }]}>
                                                <Text style={[styles.detailStatLabel, { color: sc }]}>{label}</Text>
                                                <Text style={[styles.detailStatValue, { color: sc }]}>{poder.forca}</Text>
                                                <View style={styles.detailStatBarBg}>
                                                    <View style={[styles.detailStatBarFill, { width: `${pct}%` as any, backgroundColor: sc }]} />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Ações */}
                            {confirmRelease ? (
                                <View style={styles.detailActionsArea}>
                                    <Text style={styles.releaseWarn}>
                                        Tem certeza? Você perderá {detailPokemon.nome} para sempre.
                                    </Text>
                                    <View style={styles.detailActionsRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.actionGhost]}
                                            onPress={() => setConfirmRelease(false)}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.actionGhostText}>CANCELAR</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.actionDanger]}
                                            onPress={handleRelease}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.actionDangerText}>CONFIRMAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.detailActionsArea}>
                                    <View style={styles.detailActionsRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.actionSwap]}
                                            onPress={handleSwapFromDetail}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.actionSwapText}>TROCAR POKÉMON</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.actionRelease]}
                                            onPress={() => {
                                                if (bench.length === 0) {
                                                    showPopup('Para modificar seu time vença ao menos 1 batalha');
                                                    return;
                                                }
                                                setConfirmRelease(true);
                                            }}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.actionReleaseText}>LIBERTAR POKÉMON</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={styles.detailClose} onPress={closeDetail}>
                                <View style={styles.detailCloseInner}>
                                    <Text style={styles.detailCloseText}>✕</Text>
                                </View>
                            </TouchableOpacity>
                        </Pressable>
                    )}
                </Pressable>
            </Modal>

            {/* Pop-up de aviso (time travado / banco cheio) */}
            <Alert
                title="Aviso"
                message={alertMsg}
                type="warning"
                visible={alertVisible}
                onClose={() => setAlertVisible(false)}
            />
        </View>
    );
}
 
const isWeb = Platform.OS === 'web';
 
const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: Colors.dark.deepBg },
    scrollContent: { paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: Colors.whiteAlpha['45'], fontWeight: '600' },
    teamHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 28 : 16, marginTop: 8, marginBottom: 14,
    },
    pageTitle:    { color: Colors.white, fontSize: isWeb ? 20 : 18, fontWeight: '900', letterSpacing: 2 },
    pageSubtitle: { color: Colors.whiteAlpha['45'], fontSize: isWeb ? 11 : 10, fontWeight: '600', marginTop: 2 },
    counterBadge: {
        flexDirection: 'row', alignItems: 'baseline',
        backgroundColor: Colors.gold.bg, borderWidth: 1,
        borderColor: Colors.gold.alpha30, borderRadius: 2,
        paddingHorizontal: 12, paddingVertical: 6,
    },
    counterText: { color: Colors.gold.base, fontSize: isWeb ? 24 : 22, fontWeight: '900' },
    counterMax:  { color: Colors.gold.base, fontSize: isWeb ? 14 : 12, fontWeight: '700', opacity: 0.6 },
    teamGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
        paddingHorizontal: isWeb ? 28 : 16, justifyContent: 'center',
    },
    teamSlot: {
        width: isWeb ? 130 : 108, height: isWeb ? 150 : 128,
        borderRadius: 2, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center',
        padding: 8, gap: 4, position: 'relative', overflow: 'visible',
        ...(Platform.OS !== 'web'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 }
            : { boxShadow: '0 2px 10px rgba(0,0,0,0.45)' } as any),
    },
    teamSlotEmpty: { borderStyle: 'dashed', backgroundColor: Colors.dark.cardAlt, borderColor: Colors.gold.alpha30 },
    teamSlotImage: { width: 64, height: 64 },
    teamSlotName:  { fontSize: isWeb ? 10 : 9, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
    teamSlotIndex: { fontSize: isWeb ? 9 : 8, fontWeight: '700' },
    removeBadge: {
        position: 'absolute', top: -8, right: -8,
        width: 24, height: 24, borderRadius: 2,
        backgroundColor: '#EF4444',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: Colors.dark.deepBg,
        zIndex: 5,
    },
    removeBadgeText: { color: Colors.white, fontSize: 16, fontWeight: '900', lineHeight: 18 },
    emptySlotCircle: {
        width: 44, height: 44, borderRadius: 2, borderWidth: 2,
        borderColor: Colors.gold.alpha30, borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center',
    },
    emptySlotPlus:  { color: Colors.gold.base, fontSize: 22, lineHeight: 26 },
    emptySlotLabel: { color: Colors.whiteAlpha['45'], fontSize: 9, fontWeight: '700', letterSpacing: 1 },

    // Painel de poder total
    powerPanel: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginHorizontal: isWeb ? 28 : 16, marginTop: 16,
        backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.gold.alpha30,
        borderRadius: 2, paddingVertical: 14, paddingHorizontal: 16, overflow: 'hidden',
    },
    powerAccent: { width: 3, alignSelf: 'stretch', backgroundColor: Colors.gold.base },
    powerTextWrap: { flex: 1, gap: 2 },
    powerLabel: { color: Colors.gold.base, fontSize: isWeb ? 11 : 10, fontWeight: '800', letterSpacing: 2 },
    powerHint: { color: Colors.whiteAlpha['45'], fontSize: 9, fontWeight: '600' },
    powerValue: { color: Colors.white, fontSize: isWeb ? 34 : 30, fontWeight: '900', letterSpacing: 1 },

    teamHint: { color: Colors.whiteAlpha['35'], fontSize: isWeb ? 10 : 9, textAlign: 'center', marginTop: 10, marginHorizontal: 20 },
    sectionTitle: {
        color: Colors.gold.base, fontSize: isWeb ? 11 : 10, fontWeight: '800', letterSpacing: 3,
        paddingHorizontal: isWeb ? 28 : 16, marginTop: 28, marginBottom: 4,
    },
    benchSubtitle: { color: Colors.whiteAlpha['45'], fontSize: isWeb ? 10 : 9, fontWeight: '600', paddingHorizontal: isWeb ? 28 : 16, marginBottom: 12 },
    benchEmpty: {
        marginHorizontal: isWeb ? 28 : 16, marginTop: 8,
        paddingVertical: 32, paddingHorizontal: 20,
        borderRadius: 2, borderWidth: 1.5, borderStyle: 'dashed',
        borderColor: Colors.gold.alpha30, backgroundColor: Colors.dark.card,
        alignItems: 'center', justifyContent: 'center',
    },
    benchEmptyText: { color: Colors.whiteAlpha['45'], fontSize: isWeb ? 12 : 11, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
    modalEmptyText: { color: Colors.whiteAlpha['45'], fontSize: 12, fontWeight: '600', textAlign: 'center', paddingVertical: 32, lineHeight: 18 },
    benchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: isWeb ? 28 : 16, justifyContent: 'center' },
    benchCard: {
        width: isWeb ? 110 : 96, height: isWeb ? 130 : 114,
        borderRadius: 2, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center',
        padding: 6, gap: 3, position: 'relative', overflow: 'hidden',
    },
    benchCardInTeam: { opacity: 0.5 },
    inTeamOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center', zIndex: 2, borderRadius: 1,
    },
    inTeamText:    { color: Colors.white, fontSize: 11, fontWeight: '900' },
    benchImage:    { width: 52, height: 52 },
    benchName:     { fontSize: isWeb ? 9 : 8, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
    benchIndex:    { fontSize: 8, fontWeight: '700' },
    typeBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 2, borderWidth: 1 },
    typeBadgeText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
    modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: Colors.dark.card, borderTopLeftRadius: 2, borderTopRightRadius: 2,
        borderTopWidth: 1, borderColor: Colors.dark.border,
        paddingTop: 12, paddingHorizontal: 16, paddingBottom: 32, maxHeight: '75%',
    },
    modalTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.gold.base },
    modalHandle:   { width: 40, height: 4, backgroundColor: Colors.dark.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    modalTitle:    { color: Colors.gold.base, fontSize: 14, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginBottom: 4 },
    modalSubtitle: { color: Colors.whiteAlpha['45'], fontSize: 11, textAlign: 'center', marginBottom: 16 },
    modalList:     { paddingBottom: 8 },
    modalCard: {
        flex: 1, margin: 5, borderRadius: 2, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center',
        padding: 8, gap: 4, minWidth: 90, maxWidth: 110,
    },
    modalCardImage: { width: 52, height: 52 },
    modalCardName:  { fontSize: 8, fontWeight: '800', textAlign: 'center' },

    // ── Modal de detalhes ─────────────────────────────────────────────────────
    detailBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    detailCard: { width: '100%', maxWidth: 420, backgroundColor: Colors.dark.card, borderRadius: 2, borderWidth: 1.5, overflow: 'hidden', maxHeight: '92%' },
    detailTopBar: { height: 2, width: '100%' },
    detailHeader: { alignItems: 'center', paddingTop: 18, paddingBottom: 14, paddingHorizontal: 20, gap: 6 },
    detailIndex: { fontSize: 10, fontWeight: '700', letterSpacing: 3, alignSelf: 'flex-start' },
    detailImage: { width: 120, height: 120 },
    detailName: { color: Colors.white, fontSize: 20, fontWeight: '900', letterSpacing: 1.5, textTransform: 'capitalize', textAlign: 'center' },
    detailTypesRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
    detailTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2, borderWidth: 1 },
    detailTypeEmoji: { fontSize: 12 },
    detailTypeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

    detailSection: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, borderTopWidth: 1, borderTopColor: Colors.dark.border },
    detailSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    detailSectionAccent: { width: 2, height: 12 },
    detailSectionTitle: { color: Colors.whiteAlpha['55'], fontSize: 9, fontWeight: '800', letterSpacing: 3 },
    detailTotalBadge: {
        marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1, borderColor: Colors.gold.alpha30, backgroundColor: Colors.gold.bg,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2,
    },
    detailTotalLabel: { color: Colors.gold.base, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
    detailTotalValue: { color: Colors.gold.light, fontSize: 12, fontWeight: '900' },
    detailStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    detailStatCard: { width: '30.5%', borderRadius: 2, padding: 8, gap: 3 },
    detailStatLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    detailStatValue: { fontSize: 18, fontWeight: '900', lineHeight: 22 },
    detailStatBarBg: { height: 3, backgroundColor: Colors.whiteAlpha['08'], borderRadius: 2, overflow: 'hidden', marginTop: 2 },
    detailStatBarFill: { height: '100%', borderRadius: 2 },

    // Ações (Trocar / Libertar) lado a lado
    detailActionsArea: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18, gap: 10, borderTopWidth: 1, borderTopColor: Colors.dark.border, marginTop: 6 },
    detailActionsRow: { flexDirection: 'row', gap: 14 },
    actionBtn: { flex: 1, height: 46, borderRadius: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    actionSwap: { backgroundColor: Colors.gold.base, borderColor: Colors.gold.light },
    actionSwapText: { color: Colors.dark.deepBg, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    actionRelease: { backgroundColor: 'transparent', borderColor: '#EF4444' },
    actionReleaseText: { color: '#EF4444', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    actionGhost: { backgroundColor: 'transparent', borderColor: Colors.dark.border },
    actionGhostText: { color: Colors.whiteAlpha['55'], fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    actionDanger: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
    actionDangerText: { color: Colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    releaseWarn: { color: '#EF4444', fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

    detailClose: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
    detailCloseInner: { width: 28, height: 28, borderRadius: 2, borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.deepBg, justifyContent: 'center', alignItems: 'center' },
    detailCloseText: { color: Colors.whiteAlpha['55'], fontSize: 12, fontWeight: '700', lineHeight: 14 },
});
