'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from '@/lib/i18n';
import type { Subject, StudentGrade } from '@/lib/types';

interface GradeMap {
  [componentId: string]: string;
}

export default function MisNotasPage() {
  const [locale, setLocale] = useState<Locale>('es');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<GradeMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'es' || saved === 'en')) setLocale(saved);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [subjectsRes, gradesRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/grades'),
      ]);

      const subjectsData = await subjectsRes.json();
      const gradesData = await gradesRes.json();

      if (subjectsData.subjects) {
        setSubjects(subjectsData.subjects);
        const openMap: Record<string, boolean> = {};
        subjectsData.subjects.forEach((s: Subject) => { openMap[s.id] = true; });
        setOpenSubjects(openMap);
      }

      if (gradesData.grades) {
        const map: GradeMap = {};
        gradesData.grades.forEach((g: StudentGrade) => {
          if (g.grade !== null) map[g.component_id] = g.grade.toString();
        });
        setGrades(map);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSubject = (id: string) => {
    setOpenSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGradeChange = (componentId: string, value: string) => {
    // Allow empty, or numbers between 1.0 and 7.0
    if (value === '' || value === '.') {
      setGrades(prev => ({ ...prev, [componentId]: value }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 7.9) {
      setGrades(prev => ({ ...prev, [componentId]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const gradeEntries = Object.entries(grades).map(([component_id, grade]) => ({
        component_id,
        grade: grade === '' ? null : parseFloat(grade),
      }));

      await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: gradeEntries }),
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Calculate evaluation average (weighted by components)
  const calcEvalAvg = (components: { id: string; percentage: number }[]): number | null => {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const comp of components) {
      const gradeStr = grades[comp.id];
      if (gradeStr && gradeStr !== '') {
        const grade = parseFloat(gradeStr);
        if (!isNaN(grade) && grade >= 1.0 && grade <= 7.0) {
          weightedSum += grade * comp.percentage;
          totalWeight += comp.percentage;
        }
      }
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  };

  // Calculate subject final average (weighted by evaluations)
  const calcSubjectAvg = (subject: Subject): number | null => {
    if (!subject.evaluations) return null;
    let totalWeight = 0;
    let weightedSum = 0;

    for (const ev of subject.evaluations) {
      if (!ev.components) continue;
      const evAvg = calcEvalAvg(ev.components);
      if (evAvg !== null) {
        weightedSum += evAvg * ev.percentage;
        totalWeight += ev.percentage;
      }
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  };

  const getGradeClass = (grade: number | null): string => {
    if (grade === null) return '';
    if (grade >= 4.0) return 'good';
    if (grade >= 3.0) return 'warning';
    return 'danger';
  };

  const formatGrade = (grade: number | null): string => {
    if (grade === null) return '-';
    return grade.toFixed(1);
  };

  // Calculate global average
  const calcGlobalAvg = (): number | null => {
    let count = 0;
    let sum = 0;
    for (const subject of subjects) {
      const avg = calcSubjectAvg(subject);
      if (avg !== null) {
        sum += avg;
        count++;
      }
    }
    if (count === 0) return null;
    return sum / count;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p>
      </div>
    );
  }

  const globalAvg = calcGlobalAvg();

  return (
    <div className="grades-container">
      <div className="grades-header">
        <div>
          <h1 className="grades-title">{t.grades_title}</h1>
          <p className="grades-subtitle">{t.grades_subtitle}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : `💾 ${t.grades_save}`}
        </button>
      </div>

      <div className="stagger-children">
        {subjects.map(subject => {
          const subjectAvg = calcSubjectAvg(subject);

          return (
            <div key={subject.id} className="card subject-card">
              <div className="subject-header" onClick={() => toggleSubject(subject.id)}>
                <div className="subject-name">
                  <div className="subject-icon">📝</div>
                  <div>
                    {subject.name}
                    {subjectAvg !== null && (
                      <span
                        style={{
                          marginLeft: 12,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                        className={`grade-value ${getGradeClass(subjectAvg)}`}
                      >
                        {formatGrade(subjectAvg)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`subject-chevron ${openSubjects[subject.id] ? 'open' : ''}`}>
                  ▼
                </span>
              </div>

              {openSubjects[subject.id] && subject.evaluations && (
                <div className="subject-body">
                  {subject.evaluations.map(ev => {
                    const evalAvg = ev.components ? calcEvalAvg(ev.components) : null;

                    return (
                      <div key={ev.id} className="eval-block">
                        <div className="eval-block-header">
                          <span className="eval-block-name">{ev.name}</span>
                          <span className="eval-block-percentage">{ev.percentage}%</span>
                        </div>
                        <div className="eval-components">
                          {ev.components?.map(comp => (
                            <div key={comp.id} className="eval-component">
                              <div className="eval-component-info">
                                <span className="eval-component-type">{comp.type}</span>
                                <span className="eval-component-pct">({comp.percentage}%)</span>
                              </div>
                              <input
                                type="number"
                                className={`grade-input ${grades[comp.id] ? 'has-grade' : ''}`}
                                placeholder={t.grades_input_placeholder}
                                value={grades[comp.id] || ''}
                                onChange={e => handleGradeChange(comp.id, e.target.value)}
                                min="1.0"
                                max="7.0"
                                step="0.1"
                              />
                            </div>
                          ))}
                        </div>
                        {evalAvg !== null && (
                          <div className="grade-average">
                            <span>{t.grades_eval_avg}</span>
                            <span className={`grade-value ${getGradeClass(evalAvg)}`}>
                              {formatGrade(evalAvg)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Weighted calculation breakdown */}
                  {subjectAvg !== null && (
                    <div className="weighted-breakdown">
                      <div className="weighted-title">
                        📊 {locale === 'es' ? 'Cálculo del Promedio Ponderado' : 'Weighted Average Calculation'}
                      </div>
                      <div className="weighted-rows">
                        {subject.evaluations.map(ev => {
                          const evalAvg = ev.components ? calcEvalAvg(ev.components) : null;
                          if (evalAvg === null) return null;
                          const contribution = evalAvg * (ev.percentage / 100);
                          return (
                            <div key={ev.id} className="weighted-row">
                              <span className="weighted-row-name">{ev.name} ({ev.percentage}%)</span>
                              <span className="weighted-row-calc">
                                {formatGrade(evalAvg)} × {(ev.percentage / 100).toFixed(2)} = <strong>{contribution.toFixed(2)}</strong>
                              </span>
                            </div>
                          );
                        })}
                        <div className="weighted-row weighted-row-total">
                          <span className="weighted-row-name">
                            {locale === 'es' ? 'Promedio Final' : 'Final Average'}
                          </span>
                          <span className={`grade-value ${getGradeClass(subjectAvg)}`} style={{ fontSize: '1.2rem' }}>
                            {formatGrade(subjectAvg)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {globalAvg !== null && (
        <div className="card final-average-card animate-scale-in">
          <span className="final-average-label">{t.grades_final_avg}</span>
          <span className={`final-average-value grade-value ${getGradeClass(globalAvg)}`}>
            {formatGrade(globalAvg)}
          </span>
        </div>
      )}

      {showToast && (
        <div className="save-toast">
          ✅ {t.grades_saved}
        </div>
      )}
    </div>
  );
}
