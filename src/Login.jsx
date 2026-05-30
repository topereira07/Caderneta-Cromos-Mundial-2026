import { useState } from 'react';
import { supabase } from './lib/supabase';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Preenche o username e password');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // Registar novo utilizador
        // Verificar se username já existe
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username.toLowerCase())
          .single();

        if (existingUser) {
          setError('Este username já existe. Escolhe outro.');
          setLoading(false);
          return;
        }

        // Criar novo utilizador
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            username: username.toLowerCase(), 
            password: password // Em produção, usarias hash!
          }])
          .select()
          .single();

        if (insertError) {
          setError('Erro ao criar conta. Tenta novamente.');
          console.error(insertError);
          setLoading(false);
          return;
        }

        // Criar entrada vazia de stickers para o novo utilizador
        await supabase
          .from('sticker_data')
          .insert([{ user_id: newUser.id, stickers: {} }]);

        onLogin(newUser);
      } else {
        // Login
        const { data: user, error: loginError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.toLowerCase())
          .eq('password', password)
          .single();

        if (loginError || !user) {
          setError('Username ou password incorretos');
          setLoading(false);
          return;
        }

        onLogin(user);
      }
    } catch (err) {
      setError('Erro de ligação. Tenta novamente.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏆 Caderneta FIFA 2026</h1>
        <h2>{isRegistering ? 'Criar Conta' : 'Entrar'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="O teu username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="A tua password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'A processar...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="toggle-mode">
          {isRegistering ? (
            <p>Já tens conta? <button onClick={() => setIsRegistering(false)}>Entra aqui</button></p>
          ) : (
            <p>Não tens conta? <button onClick={() => setIsRegistering(true)}>Regista-te</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
