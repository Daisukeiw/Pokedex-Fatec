export const FIREWORK_COLORS = [
    '#FFD600', '#FF6B35', '#F06292', '#4FC3F7',
    '#66BB6A', '#AB47BC', '#80DEEA', '#EF5350',
    '#AED581', '#7E57C2', '#F48FB1', '#FFCA28',
  ];
  
  export const Colors = {
    white: '#FFFFFF',
    black: '#111827',
  
    background: '#EEF6FB',
    surface: 'rgba(255,255,255,0.72)',
    surfaceDeep: '#E3EEF5',
    surfaceAlt: '#F8FBFD',
    surfaceCard: 'rgba(255,255,255,0.82)',
    surfaceHighlight: '#FFFFFF',
  
    btnPrimary: '#F8FAFC',
    labelPrimary: '#1F2937',
    txtPrimary: '#1F2937',
  
    overlayDark: 'rgba(255,255,255,0.18)',
    pokeballRed: '#EF4444',
  
    game: {
      win: '#22C55E',
      loss: '#EF4444',
    },
  
    semantic: {
      error:   { bg: '#FEECEC', border: '#F87171', text: '#B91C1C' },
      success: { bg: '#ECFDF3', border: '#4ADE80', text: '#166534' },
      warning: { bg: '#FEFCE8', border: '#FACC15', text: '#854D0E' },
      info:    { bg: '#EFF6FF', border: '#60A5FA', text: '#1D4ED8' },
    },
  
    gray: {
      100: '#F8FAFC',
      500: '#94A3B8',
      800: '#334155',
    },
  
    whiteAlpha: {
      '05': 'rgba(255,255,255,0.05)',
      '06': 'rgba(255,255,255,0.06)',
      '07': 'rgba(255,255,255,0.07)',
      '08': 'rgba(255,255,255,0.08)',
      '12': 'rgba(255,255,255,0.12)',
      '30': 'rgba(255,255,255,0.30)',
      '35': 'rgba(255,255,255,0.35)',
      '40': 'rgba(255,255,255,0.40)',
      '45': 'rgba(255,255,255,0.45)',
      '50': 'rgba(255,255,255,0.50)',
      '55': 'rgba(255,255,255,0.55)',
      '65': 'rgba(255,255,255,0.65)',
    },
  
    primaryAlpha: {
      '18': 'rgba(255,255,255,0.18)',
      '25': 'rgba(255,255,255,0.25)',
      '30': 'rgba(255,255,255,0.30)',
      '60': 'rgba(255,255,255,0.60)',
    },
    
    types: {
      fogo:     { bg: '#1a0a00', accent: '#FF6B35', glow: 'rgba(255,107,53,0.5)'   },
      água:     { bg: '#00091a', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.5)'   },
      grama:    { bg: '#001a00', accent: '#66BB6A', glow: 'rgba(102,187,106,0.5)'  },
      elétrico: { bg: '#1a1400', accent: '#FFD600', glow: 'rgba(255,214,0,0.5)'    },
      psíquico: { bg: '#1a0010', accent: '#F06292', glow: 'rgba(240,98,146,0.5)'   },
      gelo:     { bg: '#001218', accent: '#80DEEA', glow: 'rgba(128,222,234,0.5)'  },
      dragão:   { bg: '#081426', accent: '#3B78D8', glow: 'rgba(59,120,216,0.5)'   },
      trevas:   { bg: '#0d0d0d', accent: '#8D6E63', glow: 'rgba(141,110,99,0.5)'   },
      fada:     { bg: '#1a0018', accent: '#F48FB1', glow: 'rgba(244,143,177,0.5)'  },
      lutador:  { bg: '#1a0500', accent: '#EF5350', glow: 'rgba(239,83,80,0.5)'    },
      veneno:   { bg: '#0f001a', accent: '#AB47BC', glow: 'rgba(171,71,188,0.5)'   },
      terra:    { bg: '#1a1000', accent: '#D4A373', glow: 'rgba(212,163,115,0.5)'  },
      pedra:    { bg: '#141008', accent: '#BCAAA4', glow: 'rgba(188,170,164,0.5)'  },
      inseto:   { bg: '#0a1400', accent: '#AED581', glow: 'rgba(174,213,129,0.5)'  },
      fantasma: { bg: '#0a0014', accent: '#9575CD', glow: 'rgba(149,117,205,0.5)'  },
      aço:      { bg: '#0f0f14', accent: '#90A4AE', glow: 'rgba(144,164,174,0.5)'  },
      voador:   { bg: '#000d1a', accent: '#81D4FA', glow: 'rgba(129,212,250,0.5)'  },
      normal:   { bg: '#111111', accent: '#BDBDBD', glow: 'rgba(189,189,189,0.4)'  },
    } as Record<string, { bg: string; accent: string; glow: string }>,
  } as const;
  
  export function getColor(types: string[]): { bg: string; accent: string; glow: string } {
    const primary = types[0] ?? 'normal';
    return Colors.types[primary] ?? Colors.types['normal'];
  }
  