'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations, type Locale } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('es');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'es' || saved === 'en')) setLocale(saved);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const switchLocale = (l: Locale) => {
    setLocale(l);
    localStorage.setItem('locale', l);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t.login_error_required);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.login_error_invalid);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="lang-switch">
          <button className={`lang-btn ${locale === 'es' ? 'active' : ''}`} onClick={() => switchLocale('es')}>ES</button>
          <button className={`lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => switchLocale('en')}>EN</button>
        </div>
      </div>

      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <div className="auth-logo">📚</div>
            <h1 className="auth-title">{t.login_title}</h1>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">{t.login_username}</label>
              <input
                id="login-username"
                className="form-input"
                type="text"
                placeholder={t.login_username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">{t.login_password}</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? '...' : t.login_button}
            </button>
          </form>

          <div className="auth-footer">
            {t.login_no_account}{' '}
            <Link href="/register">{t.login_register_link}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
