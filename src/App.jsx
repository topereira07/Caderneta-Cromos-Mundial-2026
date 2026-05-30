import { useState, useEffect, useCallback } from 'react';
import { ALBUM_DATA, STICKER_STATUS, generateStickers, getTotalStickers } from './data/stickers';
import './App.css';

const STORAGE_KEY = 'cromos-fifa-2026';

function App() {
  const [stickerStates, setStickerStates] = useState(() => {
    // Carregar do localStorage se existir
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Guardar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickerStates));
  }, [stickerStates]);

  // Handler de clique num sticker
  const handleStickerClick = useCallback((stickerId) => {
    setStickerStates((prev) => {
      const currentStatus = prev[stickerId] || STICKER_STATUS.NONE;
      const nextStatus = (currentStatus + 1) % 3;
      
      if (nextStatus === STICKER_STATUS.NONE) {
        const { [stickerId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [stickerId]: nextStatus };
    });
  }, []);

  // Calcular contadores
  const counts = Object.values(stickerStates).reduce(
    (acc, status) => {
      if (status === STICKER_STATUS.OWNED) {
        acc.owned++;
      } else if (status === STICKER_STATUS.DUPLICATE) {
        acc.owned++;
        acc.duplicates++;
      }
      return acc;
    },
    { owned: 0, duplicates: 0 }
  );

  const totalStickers = getTotalStickers();
  const percentage = totalStickers > 0 ? Math.round((counts.owned / totalStickers) * 100) : 0;

  // Função de impressão
  const handlePrint = () => {
    window.print();
  };

  // Função para limpar tudo
  const handleReset = () => {
    if (window.confirm('Tens a certeza que queres limpar toda a caderneta?')) {
      setStickerStates({});
    }
  };

  return (
    <div className="app">
      <header className="header no-print">
        <h1>🏆 Caderneta FIFA World Cup 2026</h1>
        <div className="stats">
          <div className="stat-item owned">
            <span className="stat-value">{counts.owned}</span>
            <span className="stat-label">Cromos</span>
          </div>
          <div className="stat-item progress">
            <span className="stat-value">{percentage}%</span>
            <span className="stat-label">de {totalStickers}</span>
          </div>
          <div className="stat-item duplicates">
            <span className="stat-value">{counts.duplicates}</span>
            <span className="stat-label">Repetidos</span>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-print" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="btn btn-reset" onClick={handleReset}>
            🗑️ Limpar
          </button>
        </div>
        <div className="legend">
          <span className="legend-item">
            <span className="legend-box none"></span> Falta
          </span>
          <span className="legend-item">
            <span className="legend-box owned"></span> Tenho
          </span>
          <span className="legend-item">
            <span className="legend-box duplicate"></span> Repetido
          </span>
        </div>
      </header>

      <div className="print-header print-only">
        <h1>🏆 Caderneta FIFA World Cup 2026</h1>
        <p>Cromos: {counts.owned}/{totalStickers} ({percentage}%) | Repetidos: {counts.duplicates}</p>
      </div>

      <main className="album">
        {ALBUM_DATA.map((groupData) => (
          <section key={groupData.group} className="group">
            <h2 className="group-title">{groupData.group}</h2>
            <div className="teams">
              {groupData.teams.map((team) => {
                const teamStickers = generateStickers(team);
                const ownedCount = teamStickers.filter(
                  (id) => stickerStates[id] === STICKER_STATUS.OWNED || stickerStates[id] === STICKER_STATUS.DUPLICATE
                ).length;
                const teamPercentage = Math.round((ownedCount / teamStickers.length) * 100);
                
                return (
                <div key={team.code} className="team">
                  <div className="team-header">
                    <span className="team-flag">{team.flag}</span>
                    <span className="team-name">{team.name}</span>
                    <span className={`team-percentage ${teamPercentage === 100 ? 'complete' : ''}`}>
                      {teamPercentage}%
                    </span>
                  </div>
                  <div className="stickers">
                    {teamStickers.map((stickerId) => {
                      const status = stickerStates[stickerId] || STICKER_STATUS.NONE;
                      const statusClass =
                        status === STICKER_STATUS.OWNED
                          ? 'owned'
                          : status === STICKER_STATUS.DUPLICATE
                          ? 'duplicate'
                          : '';
                      return (
                        <button
                          key={stickerId}
                          className={`sticker ${statusClass}`}
                          onClick={() => handleStickerClick(stickerId)}
                          title={`${stickerId} - Clica para alternar estado`}
                        >
                          {stickerId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer no-print">
        <p>Clica num cromo para marcar: 1º clique = ✅ Tenho | 2º clique = 🔄 Repetido | 3º clique = Limpar</p>
        <p className="signature">made by Leonor Pereira ⚽</p>
      </footer>
    </div>
  );
}

export default App;
