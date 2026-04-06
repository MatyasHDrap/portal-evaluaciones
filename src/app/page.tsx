'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { translations, type Locale } from '@/lib/i18n';

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>('es');
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

  return (
    <div className="landing-hero">
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="lang-switch">
          <button className={`lang-btn ${locale === 'es' ? 'active' : ''}`} onClick={() => switchLocale('es')}>ES</button>
          <button className={`lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => switchLocale('en')}>EN</button>
        </div>
      </div>

      <div className="landing-content">
        <div className="landing-badge">📚 2026</div>
        <h1 className="landing-title">{t.landing_title}</h1>
        <p className="landing-subtitle">{t.landing_subtitle}</p>

        <div className="landing-buttons">
          <Link href="/login" className="btn btn-primary btn-lg">{t.landing_login}</Link>
          <Link href="/register" className="btn btn-secondary btn-lg">{t.landing_register}</Link>
        </div>

        <div className="landing-features">
          <div className="card-glass feature-card">
            <div className="feature-icon purple">📋</div>
            <h3 className="feature-title">{t.landing_feature1_title}</h3>
            <p className="feature-desc">{t.landing_feature1_desc}</p>
          </div>
          <div className="card-glass feature-card">
            <div className="feature-icon teal">📊</div>
            <h3 className="feature-title">{t.landing_feature2_title}</h3>
            <p className="feature-desc">{t.landing_feature2_desc}</p>
          </div>
          <div className="card-glass feature-card">
            <div className="feature-icon pink">⚙️</div>
            <h3 className="feature-title">{t.landing_feature3_title}</h3>
            <p className="feature-desc">{t.landing_feature3_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
