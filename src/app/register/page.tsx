'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations, type Locale } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('es');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!email || !name || !username || !password || !confirmPassword) {
      setError(t.register_error_required);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.register_error_password_match);
      return;
    }

    if (password.length < 6) {
      setError(t.register_error_password_length);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('correo') || data.error?.includes('email')) {
          setError(t.register_error_email_exists);
        } else if (data.error?.includes('usuario') || data.error?.includes('username')) {
          setError(t.register_error_username_exists);
        } else {
          setError(data.error || 'Error al registrarse');
        }
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
            <h1 className="auth-title">{t.register_title}</h1>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">{t.register_email}</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-name">{t.register_name}</label>
              <input
                id="register-name"
                className="form-input"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-username">{t.register_username}</label>
              <input
                id="register-username"
                className="form-input"
                type="text"
                placeholder="juanperez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">{t.register_password}</label>
              <input
                id="register-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">{t.register_confirm_password}</label>
              <input
                id="register-confirm"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? '...' : t.register_button}
            </button>
          </form>

          <div className="auth-footer">
            {t.register_has_account}{' '}
            <Link href="/login">{t.register_login_link}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
