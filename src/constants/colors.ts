export const Colors = {
    white: '#FFFFFF',
    black: '#000000',
    background: '#F5F5F5',
 
    btnPrimary: '#E15610',
    labelPrimary: '#FFFFFF',
    txtPrimary: '#121214',
 
    semantic: {
        error: {
            bg: '#FFEBEE',
            border: '#B71C1C',
            text: '#B71C1C'
        },
        success: {
            bg: '#E8F5E9',
            border: '#1B5E20',
            text: '#1B5E20'
        },
        warning: {
            bg: '#FFF8E1',
            border: '#FF8F00',
            text: '#FF8F00'
        },
        info: {
            bg: '#E3F2FD',
            border: '#2196F3',
            text: '#0D47A1'
        }
    },
 
    gray: {
        100: '#F2F2F2',
        500: '#999999',
        800: '#333333',
    },
 
    // ─── Tema Black & White (dark + dourado) — usado nas telas migradas ───────
    // Tokens ADITIVOS: não alteram nenhuma cor já existente acima.
    dark: {
        deepBg:     '#05070B',
        background: '#0B0F14',
        card:       '#11161D',
        cardAlt:    '#18202A',
        border:     '#2A3442',
        muted:      '#3A4556',
    },
    gold: {
        light:   '#E8D4A0',
        base:    '#C8A96E',
        dark:    '#A07840',
        bg:      '#1A1408',
        alpha18: 'rgba(200,169,110,0.18)',
        alpha30: 'rgba(200,169,110,0.30)',
        alpha45: 'rgba(200,169,110,0.45)',
    },
    whiteAlpha: {
        '05': 'rgba(255,255,255,0.05)',
        '08': 'rgba(255,255,255,0.08)',
        '30': 'rgba(255,255,255,0.30)',
        '35': 'rgba(255,255,255,0.35)',
        '45': 'rgba(255,255,255,0.45)',
        '55': 'rgba(255,255,255,0.55)',
        '65': 'rgba(255,255,255,0.65)',
    },
 
    // Cores de atributos (estilo LoL) — usadas na Pokédex dark
    stats: {
        hp:             '#22C55E',
        attack:         '#EF4444',
        defense:        '#C2410C',
        specialAttack:  '#A855F7',
        specialDefense: '#22D3EE',
        speed:          '#FACC15',
        hpBg:             'rgba(34,197,94,0.15)',
        attackBg:         'rgba(239,68,68,0.15)',
        defenseBg:        'rgba(194,65,12,0.15)',
        specialAttackBg:  'rgba(168,85,247,0.15)',
        specialDefenseBg: 'rgba(34,211,238,0.15)',
        speedBg:          'rgba(250,204,21,0.15)',
    },
 
    // Paleta de tipos do tema DARK (Pokédex migrada). Separada de `types`
    // (tema claro) para não afetar Meu Time / new-pokemon.
    typesDark: {
        fogo:     { bg: '#1A0D09', accent: '#FF7849', glow: 'rgba(255,120,73,0.45)' },
        água:     { bg: '#09131A', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.45)' },
        grama:    { bg: '#0B160D', accent: '#68D391', glow: 'rgba(104,211,145,0.45)' },
        elétrico: { bg: '#1A1708', accent: '#FFD54A', glow: 'rgba(255,213,74,0.45)' },
        psíquico: { bg: '#180C16', accent: '#F472B6', glow: 'rgba(244,114,182,0.45)' },
        gelo:     { bg: '#0A1618', accent: '#7DD3FC', glow: 'rgba(125,211,252,0.45)' },
        dragão:   { bg: '#0A1020', accent: '#60A5FA', glow: 'rgba(96,165,250,0.45)' },
        trevas:   { bg: '#111111', accent: '#A8A29E', glow: 'rgba(168,162,158,0.35)' },
        fada:     { bg: '#180E18', accent: '#F9A8D4', glow: 'rgba(249,168,212,0.45)' },
        lutador:  { bg: '#1A0B09', accent: '#F87171', glow: 'rgba(248,113,113,0.45)' },
        veneno:   { bg: '#140A18', accent: '#C084FC', glow: 'rgba(192,132,252,0.45)' },
        terra:    { bg: '#17110B', accent: '#D4A373', glow: 'rgba(212,163,115,0.45)' },
        pedra:    { bg: '#15120F', accent: '#BCAAA4', glow: 'rgba(188,170,164,0.40)' },
        inseto:   { bg: '#10160A', accent: '#A3E635', glow: 'rgba(163,230,53,0.45)' },
        fantasma: { bg: '#100C18', accent: '#A78BFA', glow: 'rgba(167,139,250,0.45)' },
        aço:      { bg: '#11161A', accent: '#94A3B8', glow: 'rgba(148,163,184,0.45)' },
        voador:   { bg: '#0A1218', accent: '#7DD3FC', glow: 'rgba(125,211,252,0.45)' },
        normal:   { bg: '#121212', accent: '#D4D4D4', glow: 'rgba(212,212,212,0.30)' },
    } as Record<string, { bg: string; accent: string; glow: string }>,
 
    // Cores de tipo para as novas telas (pokedex, new-pokemon)
    types: {
        fogo:     { bg: '#FFF0E6', accent: '#E15610', glow: 'rgba(225,86,16,0.3)'    },
        água:     { bg: '#E6F4FF', accent: '#2196F3', glow: 'rgba(33,150,243,0.3)'   },
        grama:    { bg: '#E8F5E9', accent: '#388E3C', glow: 'rgba(56,142,60,0.3)'    },
        elétrico: { bg: '#FFFDE7', accent: '#F9A825', glow: 'rgba(249,168,37,0.3)'   },
        psíquico: { bg: '#FCE4EC', accent: '#C2185B', glow: 'rgba(194,24,91,0.3)'    },
        gelo:     { bg: '#E0F7FA', accent: '#0097A7', glow: 'rgba(0,151,167,0.3)'    },
        dragão:   { bg: '#EDE7F6', accent: '#512DA8', glow: 'rgba(81,45,168,0.3)'    },
        trevas:   { bg: '#EFEBE9', accent: '#5D4037', glow: 'rgba(93,64,55,0.3)'     },
        fada:     { bg: '#FCE4EC', accent: '#E91E63', glow: 'rgba(233,30,99,0.3)'    },
        lutador:  { bg: '#FBE9E7', accent: '#BF360C', glow: 'rgba(191,54,12,0.3)'    },
        veneno:   { bg: '#F3E5F5', accent: '#7B1FA2', glow: 'rgba(123,31,162,0.3)'   },
        terra:    { bg: '#FFF3E0', accent: '#E65100', glow: 'rgba(230,81,0,0.3)'     },
        pedra:    { bg: '#EFEBE9', accent: '#795548', glow: 'rgba(121,85,72,0.3)'    },
        inseto:   { bg: '#F1F8E9', accent: '#558B2F', glow: 'rgba(85,139,47,0.3)'   },
        fantasma: { bg: '#EDE7F6', accent: '#4527A0', glow: 'rgba(69,39,160,0.3)'   },
        aço:      { bg: '#ECEFF1', accent: '#455A64', glow: 'rgba(69,90,100,0.3)'   },
        voador:   { bg: '#E3F2FD', accent: '#1976D2', glow: 'rgba(25,118,210,0.3)'  },
        normal:   { bg: '#F5F5F5', accent: '#757575', glow: 'rgba(117,117,117,0.3)' },
    } as Record<string, { bg: string; accent: string; glow: string }>,
} as const;
 
export function getColor(types: string[]): { bg: string; accent: string; glow: string } {
    const primary = types[0] ?? 'normal';
    return Colors.types[primary] ?? Colors.types['normal'];
}
 
// Versão dark (Pokédex migrada) — lê da paleta `typesDark`.
export function getColorDark(types: string[]): { bg: string; accent: string; glow: string } {
    const primary = types[0] ?? 'normal';
    return Colors.typesDark[primary] ?? Colors.typesDark['normal'];
}
 