export const EXTRA_RARITIES = [
  { key: 'LILAS', label: 'Lilás', shortLabel: 'L', className: 'rarity-lilas' },
  { key: 'BRONZE', label: 'Bronze', shortLabel: 'B', className: 'rarity-bronze' },
  { key: 'PRATA', label: 'Prata', shortLabel: 'P', className: 'rarity-prata' },
  { key: 'OURO', label: 'Ouro', shortLabel: 'O', className: 'rarity-ouro' },
];

export const EXTRA_PLAYERS = [
  { code: 'EX01', name: 'Lionel Messi', team: 'Argentina', flag: '🇦🇷' },
  { code: 'EX02', name: 'Jeremy Doku', team: 'Belgica', flag: '🇧🇪' },
  { code: 'EX03', name: 'Vinicius Junior', team: 'Brasil', flag: '🇧🇷' },
  { code: 'EX04', name: 'Alphonso Davies', team: 'Canada', flag: '🇨🇦' },
  { code: 'EX05', name: 'Luis Diaz', team: 'Colombia', flag: '🇨🇴' },
  { code: 'EX06', name: 'Luka Modric', team: 'Croacia', flag: '🇭🇷' },
  { code: 'EX07', name: 'Moises Caicedo', team: 'Equador', flag: '🇪🇨' },
  { code: 'EX08', name: 'Mohamed Salah', team: 'Egito', flag: '🇪🇬' },
  { code: 'EX09', name: 'Jude Bellingham', team: 'Inglaterra', flag: '🏴' },
  { code: 'EX10', name: 'Kylian Mbappe', team: 'Franca', flag: '🇫🇷' },
  { code: 'EX11', name: 'Florian Wirtz', team: 'Alemanha', flag: '🇩🇪' },
  { code: 'EX12', name: 'Heung-min Son', team: 'Coreia do Sul', flag: '🇰🇷' },
  { code: 'EX13', name: 'Raul Jimenez', team: 'Mexico', flag: '🇲🇽' },
  { code: 'EX14', name: 'Achraf Hakimi', team: 'Marrocos', flag: '🇲🇦' },
  { code: 'EX15', name: 'Cody Gakpo', team: 'Paises Baixos', flag: '🇳🇱' },
  { code: 'EX16', name: 'Erling Haaland', team: 'Noruega', flag: '🇳🇴' },
  { code: 'EX17', name: 'Cristiano Ronaldo', team: 'Portugal', flag: '🇵🇹' },
  { code: 'EX18', name: 'Lamine Yamal', team: 'Espanha', flag: '🇪🇸' },
  { code: 'EX19', name: 'Federico Valverde', team: 'Uruguai', flag: '🇺🇾' },
  { code: 'EX20', name: 'Christian Pulisic', team: 'Estados Unidos', flag: '🇺🇸' },
];

export const getExtraStickerGroups = () => {
  return EXTRA_PLAYERS.map((player) => ({
    player,
    stickers: EXTRA_RARITIES.map((rarity) => ({
      id: `${player.code}_${rarity.key}`,
      rarityKey: rarity.key,
      rarityLabel: rarity.label,
      rarityShortLabel: rarity.shortLabel,
      rarityClassName: rarity.className,
    })),
  }));
};

export const getAllExtraStickerCodes = () => {
  return getExtraStickerGroups().flatMap((group) => group.stickers.map((sticker) => sticker.id));
};

export const getTotalExtraStickers = () => EXTRA_PLAYERS.length * EXTRA_RARITIES.length;
