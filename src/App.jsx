/* eslint-disable react-hooks/set-state-in-effect */
import './App.css';

import { ALBUM_DATA, STICKER_STATUS, generateStickers, getTotalStickers } from './data/stickers';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [backupStickers, setBackupStickers] = useState(null); // Para restaurar após limpar
  const isCloudLoaded = useRef(false); // Previne sync antes de carregar
  const userClearedData = useRef(false); // Flag para permitir sync de dados vazios após limpar
  const [filter, setFilter] = useState(null); // null, 'falta', 'tenho', 'repetido'
  const [countryFilter, setCountryFilter] = useState(''); // filtro por país

  // Estado de mensagens
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageTo, setNewMessageTo] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  // Lista de todos os países para o dropdown
  const allCountries = ALBUM_DATA.flatMap(group => 
    group.teams.map(team => ({ code: team.code, name: team.name, flag: team.flag, group: group.group }))
  );

  // Stickers state - sempre carrega do localStorage
  const [stickerStates, setStickerStates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const loadFromSupabase = useCallback(async () => {
    if (!user) return null;
    console.log('[Load] Tentando carregar para user_id:', user.id);
    try {
      const { data, error } = await supabase
        .from('sticker_data')
        .select('stickers')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[Load] ERRO Supabase:', error.message, error.code, error.details);
        return null;
      }

      if (data?.stickers && Object.keys(data.stickers).length > 0) {
        console.log('[Load] Dados encontrados:', Object.keys(data.stickers).length, 'cromos');
        return data.stickers;
      }
      console.log('[Load] Sem dados ou vazio');
    } catch (err) {
      console.error('[Load] ERRO catch:', err);
    }
    return null;
  }, [user]);

  const syncToSupabase = useCallback(async (stickers) => {
    if (!user) return;
    const numStickers = Object.keys(stickers || {}).length;
    console.log('[Sync] Enviando', numStickers, 'cromos para cloud, user_id:', user.id);
    try {
      const { data, error } = await supabase
        .from('sticker_data')
        .upsert({ 
          user_id: user.id, 
          stickers: stickers || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select();
      
      if (error) {
        console.error('[Sync] ERRO Supabase:', error.message, error.details, error.hint);
      } else {
        console.log('[Sync] Sucesso! Dados salvos:', data);
      }
    } catch (err) {
      console.error('[Sync] ERRO catch:', err);
    }
  }, [user]);

  // Guardar no localStorage sempre
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickerStates));
    
    // Debug: mostrar estado atual
    const numStickers = Object.keys(stickerStates).length;
    console.log(`[Effect] stickerStates mudou: ${numStickers} cromos, user: ${user?.id || 'null'}, cloudLoaded: ${isCloudLoaded.current}, userCleared: ${userClearedData.current}`);
    
    // Só sincroniza se:
    // 1. Tem user logado
    // 2. Já carregou da cloud
    // 3. Tem cromos OU o utilizador limpou intencionalmente
    if (user && isCloudLoaded.current && (numStickers > 0 || userClearedData.current)) {
      console.log('[Effect] -> Vai sincronizar');
      syncToSupabase(stickerStates);
      userClearedData.current = false; // Reset após sincronizar
    } else {
      console.log('[Effect] -> NÃO sincroniza:', !user ? 'sem user' : !isCloudLoaded.current ? 'cloud não carregada' : 'sem cromos e não foi limpo pelo user');
    }
  }, [stickerStates, user, syncToSupabase]);

  // Carregar do Supabase quando faz login
  useEffect(() => {
    if (user) {
      console.log('[UserEffect] User mudou, resetando cloudLoaded para false');
      isCloudLoaded.current = false; // Reset PRIMEIRO
      console.log('[UserEffect] Carregando do Supabase para user:', user.id);
      loadFromSupabase().then((data) => {
        if (data) {
          console.log('[UserEffect] Recebidos', Object.keys(data).length, 'cromos - atualizando state');
          setStickerStates(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          console.log('[UserEffect] Nenhum dado na cloud');
        }
        console.log('[UserEffect] Marcando cloudLoaded = true');
        isCloudLoaded.current = true;
      });
    } else {
      console.log('[UserEffect] User é null, resetando cloudLoaded');
      isCloudLoaded.current = false;
    }
  }, [user, loadFromSupabase]);

  // Carregar mensagens quando user está logado
  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:users!messages_from_user_id_fkey(username)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[Messages] Erro ao carregar:', error);
        return;
      }
      
      setMessages(data || []);
      setUnreadCount((data || []).filter(m => !m.read).length);
    } catch (err) {
      console.error('[Messages] Erro:', err);
    }
  }, [user]);

  // Carregar mensagens e configurar Realtime quando user muda
  useEffect(() => {
    if (user) {
      // Usar IIFE async para evitar aviso do linter
      (async () => {
        await loadMessages();
      })();
      
      // Subscrever Realtime para novas mensagens
      const subscription = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `to_user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[Realtime] Nova mensagem recebida:', payload);
            loadMessages(); // Recarregar todas as mensagens
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setMessages([]);
      setUnreadCount(0);
    }
  }, [user, loadMessages]);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!user || !newMessageTo.trim() || !newMessageText.trim()) {
      setMessageError('Preenche o destinatário e a mensagem');
      return;
    }
    
    setMessageSending(true);
    setMessageError('');
    
    try {
      // Encontrar utilizador pelo username
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', newMessageTo.toLowerCase().trim())
        .single();
      
      if (userError || !targetUser) {
        setMessageError('Utilizador não encontrado');
        setMessageSending(false);
        return;
      }
      
      if (targetUser.id === user.id) {
        setMessageError('Não podes enviar mensagem a ti próprio');
        setMessageSending(false);
        return;
      }
      
      // Enviar mensagem
      const { error: sendError } = await supabase
        .from('messages')
        .insert([{
          from_user_id: user.id,
          to_user_id: targetUser.id,
          message: newMessageText.trim()
        }]);
      
      if (sendError) {
        setMessageError('Erro ao enviar mensagem');
        setMessageSending(false);
        return;
      }
      
      setNewMessageTo('');
      setNewMessageText('');
      setMessageError('');
      alert(`Mensagem enviada para ${targetUser.username}!`);
    } catch (err) {
      console.error('[Messages] Erro ao enviar:', err);
      setMessageError('Erro ao enviar');
    }
    setMessageSending(false);
  };

  // Marcar mensagem como lida
  const markAsRead = async (messageId) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[Messages] Erro ao marcar como lida:', err);
    }
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

    // IMPORTANTE: Desativar sync ANTES de mudar o user
    console.log('[Login] Desativando sync antes de setUser');
    isCloudLoaded.current = false;
    
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
    // IMPORTANTE: Desativar sync ANTES de limpar dados
    isCloudLoaded.current = false;
    setUser(null);
    setStickerStates({});
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Logout] Dados locais limpos, cloud mantida intacta');
  };

  // Handler de clique num sticker
  const handleStickerClick = useCallback((stickerId) => {
    setStickerStates((prev) => {
      const currentStatus = prev[stickerId] || STICKER_STATUS.NONE;
      const nextStatus = (currentStatus + 1) % 3;
      
      if (nextStatus === STICKER_STATUS.NONE) {
        const newState = { ...prev };
        delete newState[stickerId];
        return newState;
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
    if (Object.keys(stickerStates).length === 0) return;
    if (window.confirm('Tens a certeza que queres limpar toda a caderneta?')) {
      setBackupStickers(stickerStates); // Guardar backup antes de limpar
      userClearedData.current = true; // Permitir sync de dados vazios
      setStickerStates({});
    }
  };

  const handleRestore = () => {
    if (backupStickers && Object.keys(backupStickers).length > 0) {
      userClearedData.current = false; // Cancelar a flag de limpeza
      setStickerStates(backupStickers);
      setBackupStickers(null);
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
              <button className="btn-small btn-messages" onClick={() => { setShowMessages(true); loadMessages(); }}>
                💬 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
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
          {backupStickers ? (
            <button className="btn btn-restore" onClick={handleRestore}>↩️ Restaurar</button>
          ) : (
            <button className="btn btn-reset" onClick={handleReset}>🗑️ Limpar</button>
          )}
          <button className="btn btn-help" onClick={() => setShowHelp(true)}>❓ Ajuda</button>
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
        <p className="signature">made by Maria Leonor Pereira ⚽</p>
      </footer>

      {/* Modal de Ajuda */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHelp(false)}>✕</button>
            <h2>🏆 Caderneta FIFA World Cup 2026</h2>
            <p className="modal-subtitle">Guia de utilização</p>
            
            <div className="help-section">
              <h3>🎯 Como usar os cromos</h3>
              <ul>
                <li><strong>1º clique</strong> → <span className="status-green">█</span> Verde = Já tenho</li>
                <li><strong>2º clique</strong> → <span className="status-yellow">█</span> Amarelo = Repetido</li>
                <li><strong>3º clique</strong> → Limpa (volta ao estado inicial)</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🔍 Filtros</h3>
              <ul>
                <li><strong>Falta</strong> - Mostra apenas os cromos em falta</li>
                <li><strong>Tenho</strong> - Mostra apenas os que já tens</li>
                <li><strong>Repetido</strong> - Mostra apenas os repetidos</li>
                <li><strong>Dropdown países</strong> - Filtra por seleção/país</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>📱 Botões</h3>
              <ul>
                <li><strong>🖨️ Imprimir</strong> - Gera versão para impressão</li>
                <li><strong>📋 Copiar Faltantes</strong> - Copia lista de cromos em falta para partilhar no WhatsApp/SMS</li>
                <li><strong>🗑️ Limpar</strong> - Apaga todos os dados (pede confirmação)</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🔐 Conta e sincronização</h3>
              <ul>
                <li><strong>Registar</strong> - Cria conta e guarda na cloud</li>
                <li><strong>Entrar</strong> - Carrega dados guardados</li>
                <li><strong>Sair</strong> - Limpa dados locais (cloud mantém)</li>
                <li>Sem conta = dados só no browser atual</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>📲 Instalar no telemóvel</h3>
              <div className="install-instructions">
                <h4>🍎 iPhone (Safari)</h4>
                <ol>
                  <li>Abre esta página no Safari</li>
                  <li>Toca no botão <strong>Partilhar</strong> (⬆️)</li>
                  <li>Escolhe <strong>"Adicionar ao ecrã inicial"</strong></li>
                  <li>Confirma o nome e toca <strong>Adicionar</strong></li>
                </ol>
                
                <h4>🤖 Android (Chrome)</h4>
                <ol>
                  <li>Abre esta página no Chrome</li>
                  <li>Toca no menu <strong>⋮</strong> (3 pontos)</li>
                  <li>Escolhe <strong>"Adicionar ao ecrã inicial"</strong></li>
                  <li>Confirma e toca <strong>Instalar</strong></li>
                </ol>
              </div>
            </div>

            <div className="help-section">
              <h3>✨ Funcionalidades</h3>
              <ul>
                <li>✅ Funciona offline (depois de instalada)</li>
                <li>✅ Guarda automaticamente no browser</li>
                <li>✅ Sincroniza entre dispositivos (com conta)</li>
                <li>✅ 980 cromos de 48 seleções + FIFA</li>
              </ul>
            </div>

            <p className="modal-footer">made by Maria Leonor Pereira ⚽</p>
          </div>
        </div>
      )}

      {/* Modal de Mensagens */}
      {showMessages && (
        <div className="modal-overlay" onClick={() => setShowMessages(false)}>
          <div className="modal-content messages-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMessages(false)}>×</button>
            <h2>💬 Mensagens</h2>
            
            {/* Enviar nova mensagem */}
            <div className="message-compose">
              <h3>📝 Nova Mensagem</h3>
              <input
                type="text"
                placeholder="Username do destinatário"
                value={newMessageTo}
                onChange={(e) => setNewMessageTo(e.target.value)}
                disabled={messageSending}
              />
              <textarea
                placeholder="Escreve a tua mensagem..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                disabled={messageSending}
                rows={3}
              />
              {messageError && <p className="error-text">{messageError}</p>}
              <button 
                className="btn-copy" 
                onClick={sendMessage} 
                disabled={messageSending}
              >
                {messageSending ? 'A enviar...' : '📤 Enviar'}
              </button>
            </div>

            {/* Inbox */}
            <div className="message-inbox">
              <h3>📥 Recebidas ({messages.length})</h3>
              {messages.length === 0 ? (
                <p className="no-messages">Não tens mensagens</p>
              ) : (
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`message-item ${!msg.read ? 'unread' : ''}`}
                      onClick={() => !msg.read && markAsRead(msg.id)}
                    >
                      <div className="message-header">
                        <span className="message-from">
                          👤 {msg.from_user?.username || 'Desconhecido'}
                        </span>
                        <span className="message-date">
                          {new Date(msg.created_at).toLocaleString('pt-PT', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      {!msg.read && <span className="new-badge">Nova</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
