import './App.css';

import { ALBUM_DATA, STICKER_STATUS, generateStickers, getTotalStickers } from './data/stickers';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from './lib/supabase';

const STORAGE_KEY = 'cromos-fifa-2026';
const LOCAL_USER_KEY = 'cromos-user';

function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState(null); // null, 'falta', 'tenho', 'repetido'
  const [countryFilter, setCountryFilter] = useState(''); // filtro por país

  // Lista de todos os países para o dropdown
  const allCountries = ALBUM_DATA.flatMap(group => 
    group.teams.map(team => ({ code: team.code, name: team.name, flag: team.flag, group: group.group }))
  );

  // Stickers state - sempre carrega do localStorage
  const [stickerStates, setStickerStates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Guardar no localStorage sempre
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickerStates));
    // Se estiver logado, sincronizar com Supabase
    if (user) {
      syncToSupabase();
    }
  }, [stickerStates]);

  // Carregar do Supabase quando faz login
  useEffect(() => {
    if (user) {
      loadFromSupabase();
    }
  }, [user]);

  const loadFromSupabase = async () => {
    try {
      const { data } = await supabase
        .from('sticker_data')
        .select('stickers')
        .eq('user_id', user.id)
        .single();

      if (data?.stickers && Object.keys(data.stickers).length > 0) {
        setStickerStates(data.stickers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.stickers));
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
  };

  const syncToSupabase = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from('sticker_data')
        .upsert({ 
          user_id: user.id, 
          stickers: stickerStates,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
    }
    setSaving(false);
  };

  // Login
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('Preenche username e password');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password', password)
      .single();

    if (error || !userData) {
      setAuthError('Utilizador não existe ou password errada');
      setAuthLoading(false);
      return;
    }

    setUser(userData);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
    setUsername('');
    setPassword('');
    setShowAuthForm(false);
    setAuthLoading(false);
  };

  // Registar
  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('Preenche username e password');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    // Verificar se username existe
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      setAuthError('Username já existe');
      setAuthLoading(false);
      return;
    }

    // Criar utilizador
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ username: username.toLowerCase(), password }])
      .select()
      .single();

    if (error) {
      setAuthError('Erro ao criar conta');
      setAuthLoading(false);
      return;
    }

    // Criar entrada de stickers com dados atuais
    await supabase
      .from('sticker_data')
      .insert([{ user_id: newUser.id, stickers: stickerStates }]);

    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    setUsername('');
    setPassword('');
    setShowAuthForm(false);
    setAuthLoading(false);
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setStickerStates({});
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

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
      if (status === STICKER_STATUS.OWNED) acc.owned++;
      else if (status === STICKER_STATUS.DUPLICATE) { acc.owned++; acc.duplicates++; }
      return acc;
    },
    { owned: 0, duplicates: 0 }
  );

  const totalStickers = getTotalStickers();
  const percentage = totalStickers > 0 ? Math.round((counts.owned / totalStickers) * 100) : 0;

  const handlePrint = () => window.print();
  
  const handleReset = () => {
    if (window.confirm('Tens a certeza que queres limpar toda a caderneta?')) {
      setStickerStates({});
    }
  };

  // Gerar texto com cromos em falta
  const generateMissingText = () => {
    const lines = ['🏆 FIFA World Cup 2026', 'Cromos em Falta', ''];
    let totalMissing = 0;
    
    ALBUM_DATA.forEach((groupData) => {
      groupData.teams.forEach((team) => {
        const teamStickers = generateStickers(team);
        const missing = teamStickers.filter(
          (id) => !stickerStates[id] || stickerStates[id] === STICKER_STATUS.NONE
        );
        
        if (missing.length > 0) {
          // Extrair só o número do sticker
          const numbers = missing.map(id => {
            const num = id.replace(/^[A-Z]+/, '').replace(/^0+/, '') || '0';
            return num;
          }).join(', ');
          lines.push(`${team.code} ${team.flag}: ${numbers}`);
          totalMissing += missing.length;
        }
      });
    });
    
    lines.push('');
    lines.push(`Total: ${totalMissing} cromos em falta`);
    lines.push('');
    lines.push('📱 cadernetacromosmundial2026.org');
    
    return lines.join('\n');
  };

  // Copiar lista de faltantes para clipboard
  const handleCopyMissing = async () => {
    const text = generateMissingText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="app">
      <header className="header no-print">
        {/* Auth Corner */}
        <div className="auth-corner">
          {user ? (
            <div className="user-logged">
              <span className="user-info">👤 {user.username}</span>
              {saving && <span className="saving-indicator">💾</span>}
              <button className="btn-small" onClick={handleLogout}>Sair</button>
            </div>
          ) : (
            <div className="auth-section">
              {showAuthForm ? (
                <div className="auth-form">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={authLoading}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                  />
                  <div className="auth-buttons">
                    <button onClick={handleLogin} disabled={authLoading}>Entrar</button>
                    <button onClick={handleRegister} disabled={authLoading}>Registar</button>
                    <button className="btn-cancel" onClick={() => { setShowAuthForm(false); setAuthError(''); }}>✕</button>
                  </div>
                  {authError && <div className="auth-error">{authError}</div>}
                </div>
              ) : (
                <button className="btn-small" onClick={() => setShowAuthForm(true)}>🔐 Login</button>
              )}
            </div>
          )}
        </div>

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
          <button className="btn btn-print" onClick={handlePrint}>🖨️ Imprimir</button>
          <button className="btn btn-copy" onClick={handleCopyMissing}>
            {copied ? '✅ Copiado!' : '📋 Copiar Faltantes'}
          </button>
          <button className="btn btn-reset" onClick={handleReset}>🗑️ Limpar</button>
        </div>
        <div className="legend">
          <button 
            className={`legend-item ${filter === 'falta' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'falta' ? null : 'falta')}
          >
            <span className="legend-box none"></span> Falta
          </button>
          <button 
            className={`legend-item ${filter === 'tenho' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'tenho' ? null : 'tenho')}
          >
            <span className="legend-box owned"></span> Tenho
          </button>
          <button 
            className={`legend-item ${filter === 'repetido' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'repetido' ? null : 'repetido')}
          >
            <span className="legend-box duplicate"></span> Repetido
          </button>
        </div>
        <div className="country-filter">
          <select 
            value={countryFilter} 
            onChange={(e) => setCountryFilter(e.target.value)}
            className="country-select"
          >
            <option value="">🌍 Todos os países</option>
            {allCountries.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="print-header print-only">
        <h1>🏆 Caderneta FIFA World Cup 2026</h1>
        <p>Cromos: {counts.owned}/{totalStickers} ({percentage}%) | Repetidos: {counts.duplicates}</p>
      </div>

      <main className="album">
        {ALBUM_DATA.map((groupData) => {
          // Filtrar equipas por país se selecionado
          const filteredTeams = countryFilter 
            ? groupData.teams.filter(team => team.code === countryFilter)
            : groupData.teams;
          
          // Não mostrar grupo se não tem equipas após filtro
          if (filteredTeams.length === 0) return null;
          
          return (
          <section key={groupData.group} className="group">
            <h2 className="group-title">{groupData.group}</h2>
            <div className="teams">
              {filteredTeams.map((team) => {
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
                    {teamStickers
                      .filter((stickerId) => {
                        const status = stickerStates[stickerId] || STICKER_STATUS.NONE;
                        if (!filter) return true;
                        if (filter === 'falta') return status === STICKER_STATUS.NONE;
                        if (filter === 'tenho') return status === STICKER_STATUS.OWNED || status === STICKER_STATUS.DUPLICATE;
                        if (filter === 'repetido') return status === STICKER_STATUS.DUPLICATE;
                        return true;
                      })
                      .map((stickerId) => {
                      const status = stickerStates[stickerId] || STICKER_STATUS.NONE;
                      // No filtro "tenho", mostrar duplicados como verde
                      const displayClass = filter === 'tenho' && status === STICKER_STATUS.DUPLICATE 
                        ? 'owned' 
                        : status === STICKER_STATUS.OWNED ? 'owned' 
                        : status === STICKER_STATUS.DUPLICATE ? 'duplicate' : '';
                      return (
                        <button
                          key={stickerId}
                          className={`sticker ${displayClass}`}
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
        );
        })}
      </main>

      <footer className="footer no-print">
        <p>Clica num cromo para marcar: 1º clique = ✅ Tenho | 2º clique = 🔄 Repetido | 3º clique = Limpar</p>
        <p className="footer-hint">🔐 Ao registar, guarda a seleção atual na cloud | Ao sair, limpa tudo localmente</p>
        <p className="signature">made by Leonor Pereira ⚽</p>
      </footer>
    </div>
  );
}

export default App;
