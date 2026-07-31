export const EXTRA_RARITIES = [
  { key: 'LILAS', label: 'Lilás', shortLabel: 'L', className: 'rarity-lilas' },
  { key: 'BRONZE', label: 'Bronze', shortLabel: 'B', className: 'rarity-bronze' },
  { key: 'PRATA', label: 'Prata', shortLabel: 'P', className: 'rarity-prata' },
  { key: 'OURO', label: 'Ouro', shortLabel: 'O', className: 'rarity-ouro' },
];

export const EXTRA_PLAYERS = [
  { code: 'EX01', name: 'Lionel Messi', team: 'Argentina' },
  { code: 'EX02', name: 'Jeremy Doku', team: 'Belgica' },
  { code: 'EX03', name: 'Vinicius Junior', team: 'Brasil' },
  { code: 'EX04', name: 'Alphonso Davies', team: 'Canada' },
  { code: 'EX05', name: 'Luis Diaz', team: 'Colombia' },
  { code: 'EX06', name: 'Luka Modric', team: 'Croacia' },
  { code: 'EX07', name: 'Moises Caicedo', team: 'Equador' },
  { code: 'EX08', name: 'Mohamed Salah', team: 'Egito' },
  { code: 'EX09', name: 'Jude Bellingham', team: 'Inglaterra' },
  { code: 'EX10', name: 'Kylian Mbappe', team: 'Franca' },
  { code: 'EX11', name: 'Florian Wirtz', team: 'Alemanha' },
  { code: 'EX12', name: 'Heung-min Son', team: 'Coreia do Sul' },
  { code: 'EX13', name: 'Raul Jimenez', team: 'Mexico' },
  { code: 'EX14', name: 'Achraf Hakimi', team: 'Marrocos' },
  { code: 'EX15', name: 'Cody Gakpo', team: 'Paises Baixos' },
  { code: 'EX16', name: 'Erling Haaland', team: 'Noruega' },
  { code: 'EX17', name: 'Cristiano Ronaldo', team: 'Portugal' },
  { code: 'EX18', name: 'Lamine Yamal', team: 'Espanha' },
  { code: 'EX19', name: 'Federico Valverde', team: 'Uruguai' },
  { code: 'EX20', name: 'Christian Pulisic', team: 'Estados Unidos' },
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
