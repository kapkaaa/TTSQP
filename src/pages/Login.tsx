import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'email' | 'magic'>('email'); // Pilih metode login
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (method === 'email') {
      // Login dengan email dan password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        navigate('/');
      }
    } else {
      // Login dengan magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin, // Arahkan kembali ke halaman setelah OTP
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Link login dikirim ke email kamu. Cek inbox atau spam.',
        });
      }
    }
  };

  const handleSignup = async () => {
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Akun berhasil dibuat! Silakan cek email kamu untuk verifikasi.',
      });
    }
  };

  return (
    <div className="login-container">
      <h2>Login ke Teka-Teki Silang</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {method === 'email' && (
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>
            <input
              type="radio"
              name="method"
              checked={method === 'email'}
              onChange={() => setMethod('email')}
            />{' '}
            Login dengan Password
          </label>
          <label>
            <input
              type="radio"
              name="method"
              checked={method === 'magic'}
              onChange={() => setMethod('magic')}
            />{' '}
            Login dengan Magic Link
          </label>
        </div>

        <button type="submit">Login</button>
        {method === 'email' && (
          <button type="button" onClick={handleSignup}>
            Daftar
          </button>
        )}
      </form>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
};

export default Login;