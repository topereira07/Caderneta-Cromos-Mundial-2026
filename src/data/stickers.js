// Dados da caderneta de cromos FIFA World Cup 2026

export const STICKER_STATUS = {
  NONE: 0,
  OWNED: 1,      // Verde - Tenho
  DUPLICATE: 2,  // Amarelo - Repetido
};

// Mapeamento de códigos de país para emojis de bandeiras
const FLAGS = {
  FIFA: '🏆',
  MEX: '🇲🇽',
  RSA: '🇿🇦',
  KOR: '🇰🇷',
  CZE: '🇨🇿',
  CAN: '🇨🇦',
  BIH: '🇧🇦',
  QAT: '🇶🇦',
  SUI: '🇨🇭',
  BRA: '🇧🇷',
  MAR: '🇲🇦',
  HAI: '🇭🇹',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸',
  PAR: '🇵🇾',
  AUS: '🇦🇺',
  TUR: '🇹🇷',
  GER: '🇩🇪',
  CUW: '🇨🇼',
  CIV: '🇨🇮',
  ECU: '🇪🇨',
  NED: '🇳🇱',
  JPN: '🇯🇵',
  SWE: '🇸🇪',
  TUN: '🇹🇳',
  BEL: '🇧🇪',
  EGY: '🇪🇬',
  IRN: '🇮🇷',
  NZL: '🇳🇿',
  ESP: '🇪🇸',
  CPV: '🇨🇻',
  KSA: '🇸🇦',
  URU: '🇺🇾',
  FRA: '🇫🇷',
  SEN: '🇸🇳',
  IRQ: '🇮🇶',
  NOR: '🇳🇴',
  ARG: '🇦🇷',
  ALG: '🇩🇿',
  AUT: '🇦🇹',
  JOR: '🇯🇴',
  POR: '🇵🇹',
  COD: '🇨🇩',
  UZB: '🇺🇿',
  COL: '🇨🇴',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  CRO: '🇭🇷',
  GHA: '🇬🇭',
  PAN: '🇵🇦',
  COCA: '🥤',
};

// Estrutura da caderneta
export const ALBUM_DATA = [
  {
    group: 'FIFA',
    teams: [
      {
        code: 'FWC',
        name: 'FIFA',
        flag: FLAGS.FIFA,
        stickers: ['00', ...Array.from({ length: 19 }, (_, i) => `FWC${i + 1}`)],
      },
    ],
  },
  {
    group: 'GRUPO A',
    teams: [
      { code: 'MEX', name: 'MÉXICO', flag: FLAGS.MEX },
      { code: 'RSA', name: 'AFRICA SUL', flag: FLAGS.RSA },
      { code: 'KOR', name: 'COREIA', flag: FLAGS.KOR },
      { code: 'CZE', name: 'REP.CHECA', flag: FLAGS.CZE },
    ],
  },
  {
    group: 'GRUPO B',
    teams: [
      { code: 'CAN', name: 'CANADÁ', flag: FLAGS.CAN },
      { code: 'BIH', name: 'BÓSNIA', flag: FLAGS.BIH },
      { code: 'QAT', name: 'QATAR', flag: FLAGS.QAT },
      { code: 'SUI', name: 'SUÍÇA', flag: FLAGS.SUI },
    ],
  },
  {
    group: 'GRUPO C',
    teams: [
      { code: 'BRA', name: 'BRASIL', flag: FLAGS.BRA },
      { code: 'MAR', name: 'MARROCOS', flag: FLAGS.MAR },
      { code: 'HAI', name: 'HAITI', flag: FLAGS.HAI },
      { code: 'SCO', name: 'ESCÓCIA', flag: FLAGS.SCO },
    ],
  },
  {
    group: 'GRUPO D',
    teams: [
      { code: 'USA', name: 'USA', flag: FLAGS.USA },
      { code: 'PAR', name: 'PARAGUAI', flag: FLAGS.PAR },
      { code: 'AUS', name: 'AUSTRALIA', flag: FLAGS.AUS },
      { code: 'TUR', name: 'TURQUIA', flag: FLAGS.TUR },
    ],
  },
  {
    group: 'GRUPO E',
    teams: [
      { code: 'GER', name: 'ALEMANHA', flag: FLAGS.GER },
      { code: 'CUW', name: 'CURAÇAO', flag: FLAGS.CUW },
      { code: 'CIV', name: 'C.MARFIM', flag: FLAGS.CIV },
      { code: 'ECU', name: 'ECUADOR', flag: FLAGS.ECU },
    ],
  },
  {
    group: 'GRUPO F',
    teams: [
      { code: 'NED', name: 'HOLANDA', flag: FLAGS.NED },
      { code: 'JPN', name: 'JAPÃO', flag: FLAGS.JPN },
      { code: 'SWE', name: 'SUÉCIA', flag: FLAGS.SWE },
      { code: 'TUN', name: 'TUNISIA', flag: FLAGS.TUN },
    ],
  },
  {
    group: 'GRUPO G',
    teams: [
      { code: 'BEL', name: 'BÉLGICA', flag: FLAGS.BEL },
      { code: 'EGY', name: 'EGIPTO', flag: FLAGS.EGY },
      { code: 'IRN', name: 'IRÃO', flag: FLAGS.IRN },
      { code: 'NZL', name: 'N.ZELÂNDIA', flag: FLAGS.NZL },
    ],
  },
  {
    group: 'GRUPO H',
    teams: [
      { code: 'ESP', name: 'ESPANHA', flag: FLAGS.ESP },
      { code: 'CPV', name: 'CABO VERDE', flag: FLAGS.CPV },
      { code: 'KSA', name: 'ARÁBIA', flag: FLAGS.KSA },
      { code: 'URU', name: 'URUGUAI', flag: FLAGS.URU },
    ],
  },
  {
    group: 'GRUPO I',
    teams: [
      { code: 'FRA', name: 'FRANÇA', flag: FLAGS.FRA },
      { code: 'SEN', name: 'SENEGAL', flag: FLAGS.SEN },
      { code: 'IRQ', name: 'IRAQUE', flag: FLAGS.IRQ },
      { code: 'NOR', name: 'NORUEGA', flag: FLAGS.NOR },
    ],
  },
  {
    group: 'GRUPO J',
    teams: [
      { code: 'ARG', name: 'ARGENTINA', flag: FLAGS.ARG },
      { code: 'ALG', name: 'ALGERIA', flag: FLAGS.ALG },
      { code: 'AUT', name: 'AUSTRIA', flag: FLAGS.AUT },
      { code: 'JOR', name: 'JORDANIA', flag: FLAGS.JOR },
    ],
  },
  {
    group: 'GRUPO K',
    teams: [
      { code: 'POR', name: 'PORTUGAL', flag: FLAGS.POR },
      { code: 'COD', name: 'CONGO', flag: FLAGS.COD },
      { code: 'UZB', name: 'UZBEQUISTÃO', flag: FLAGS.UZB },
      { code: 'COL', name: 'COLÔMBIA', flag: FLAGS.COL },
    ],
  },
  {
    group: 'GRUPO L',
    teams: [
      { code: 'ENG', name: 'INGLATERRA', flag: FLAGS.ENG },
      { code: 'CRO', name: 'CROÁCIA', flag: FLAGS.CRO },
      { code: 'GHA', name: 'GANA', flag: FLAGS.GHA },
      { code: 'PAN', name: 'PANAMÁ', flag: FLAGS.PAN },
    ],
  },
  {
    group: 'COCA-COLA',
    teams: [
      {
        code: 'CC',
        name: 'COCA-COLA',
        flag: FLAGS.COCA,
        stickers: Array.from({ length: 12 }, (_, i) => `CC${i + 1}`),
      },
    ],
  },
];

// Gerar stickers para cada equipa (20 stickers cada, exceto FIFA que já tem definidos)
export const generateStickers = (team) => {
  if (team.stickers) return team.stickers;
  return Array.from({ length: 20 }, (_, i) => `${team.code}${i + 1}`);
};

// Calcular total de stickers na caderneta
export const getTotalStickers = () => {
  let total = 0;
  ALBUM_DATA.forEach((group) => {
    group.teams.forEach((team) => {
      total += generateStickers(team).length;
    });
  });
  return total;
};
