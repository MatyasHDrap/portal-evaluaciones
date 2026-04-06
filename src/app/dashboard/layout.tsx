'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { translations, type Locale } from '@/lib/i18n';
import type { UserPayload } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('es');
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'es' || saved === 'en')) setLocale(saved);
    
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p>
      </div>
    );
  }

  if (!user) return null;

  const navLinks = [
    { href: '/dashboard', label: t.nav_dashboard, icon: '🏠' },
    { href: '/dashboard/evaluaciones', label: t.nav_evaluaciones, icon: '📋' },
    { href: '/dashboard/mis-notas', label: t.nav_mis_notas, icon: '📊' },
  ];

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon">📚</div>
          <span className="navbar-brand-text">EvalPortal</span>
        </Link>

        <button className="nav-mobile-toggle" onClick={() => setMobileNav(!mobileNav)}>
          {mobileNav ? '✕' : '☰'}
        </button>

        <ul className={`navbar-links ${mobileNav ? 'mobile-shown' : 'mobile-hidden'}`}>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setMobileNav(false)}
              >
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="lang-switch">
            <button className={`lang-btn ${locale === 'es' ? 'active' : ''}`} onClick={() => switchLocale('es')}>ES</button>
            <button className={`lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => switchLocale('en')}>EN</button>
          </div>

          <div className="user-badge">
            <div className="user-badge-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.username}</span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            {t.nav_logout}
          </button>
        </div>
      </nav>

      {children}
    </div>
  );
}
