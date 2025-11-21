import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import Home from './pages/Home';
import Game from './pages/Game';
import LeaderboardPage from './pages/LeaderboardPage';
import Login from './pages/Login';
import './App.css';

// Definisi state autentikasi
type UserState = {
  user: User | null;
  loading: boolean;
};

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({
    user: null,
    loading: true,
  });

  // Cek status autentikasi saat aplikasi dimuat
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserState({ user: session?.user || null, loading: false });
    };

    getSession();

    // Subscribe perubahan session secara realtime
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserState({ user: session?.user || null, loading: false });
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Jika sedang memuat, tampilkan spinner
  if (userState.loading) {
    return (
      <div className="loading-screen">
        <h1>Memuat Teka-Teki Silang...</h1>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>🧩 Teka-Teki Silang</h1>
          {userState.user ? (
            <span className="user-info">
              Selamat datang, <strong>{userState.user.email}</strong>
              <button onClick={() => supabase.auth.signOut()}>
                Logout
              </button>
            </span>
          ) : (
            <button onClick={() => window.location.href = '/login'}>
              Login
            </button>
          )}
        </header>

        <main className="app-main">
          <Routes>
            {/* Halaman utama - daftar level */}
            <Route path="/" element={<Home />} />

            {/* Halaman login */}
            <Route path="/login" element={<Login />} />

            {/* Halaman game - butuh login */}
            <Route
              path="/game/:levelId"
              element={
                userState.user ? <Game /> : <Navigate to="/login" />
              }
            />

            {/* Halaman leaderboard - bisa diakses tanpa login, tapi hanya tampil jika ada data */}
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Redirect jika route tidak dikenali */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="app-footer">
          {/* <p>© 2025 Teka-Teki Silang • Dibangun dengan React + Vite + Supabase</p> */}
        </footer>
      </div>
    </Router>
  );
};

export default App;