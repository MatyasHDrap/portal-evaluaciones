'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { translations, type Locale } from '@/lib/i18n';
import type { UserPayload } from '@/lib/auth';
import type { Subject } from '@/lib/types';
import Calendar from '@/components/Calendar';

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('es');
  const [user, setUser] = useState<UserPayload | null>(null);
  const [evalEvents, setEvalEvents] = useState<{ id: string; title: string; subject: string; date: string; type: string; percentage: number }[]>([]);
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'es' || saved === 'en')) setLocale(saved);
  }, []);

  const loadEvalEvents = useCallback(() => {
    fetch('/api/subjects')
      .then(r => r.json())
      .then(d => {
        if (d.subjects) {
          const events: typeof evalEvents = [];
          d.subjects.forEach((subject: Subject) => {
            subject.evaluations?.forEach(ev => {
              ev.components?.forEach(comp => {
                if (comp.due_date) {
                  events.push({
                    id: comp.id,
                    title: ev.name,
                    subject: subject.name,
                    date: comp.due_date,
                    type: comp.type,
                    percentage: ev.percentage,
                  });
                }
              });
            });
          });
          setEvalEvents(events);
        }
      });
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); });

    loadEvalEvents();
  }, [loadEvalEvents]);

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">
          {t.dashboard_welcome} <span>{user.name}</span>
        </h1>
        <div className={`dashboard-role ${user.role === 'admin' ? 'role-admin' : 'role-student'}`}>
          {user.role === 'admin' ? '👑' : '🎓'}{' '}
          {user.role === 'admin' ? t.dashboard_role_admin : t.dashboard_role_student}
        </div>
      </div>

      <div className="dashboard-cards stagger-children">
        <Link href="/dashboard/evaluaciones" style={{ textDecoration: 'none' }}>
          <div className="card card-interactive dash-card">
            <div className="dash-card-icon">📋</div>
            <h2 className="dash-card-title">{t.dashboard_card_evaluaciones}</h2>
            <p className="dash-card-desc">{t.dashboard_card_evaluaciones_desc}</p>
          </div>
        </Link>

        <Link href="/dashboard/mis-notas" style={{ textDecoration: 'none' }}>
          <div className="card card-interactive dash-card">
            <div className="dash-card-icon">📊</div>
            <h2 className="dash-card-title">{t.dashboard_card_notas}</h2>
            <p className="dash-card-desc">{t.dashboard_card_notas_desc}</p>
          </div>
        </Link>

        {user.role === 'admin' && (
          <Link href="/dashboard/evaluaciones" style={{ textDecoration: 'none' }}>
            <div className="card card-interactive dash-card">
              <div className="dash-card-icon">⚙️</div>
              <h2 className="dash-card-title">{t.dashboard_card_admin}</h2>
              <p className="dash-card-desc">{t.dashboard_card_admin_desc}</p>
            </div>
          </Link>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
          📅 {locale === 'es' ? 'Calendario de Evaluaciones' : 'Evaluations Calendar'}
        </h2>
        <Calendar locale={locale} evalEvents={evalEvents} userRole={user.role} onEvalUpdated={loadEvalEvents} />
      </div>
    </div>
  );
}
