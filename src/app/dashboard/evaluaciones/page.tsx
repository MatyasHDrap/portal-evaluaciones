'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { translations, type Locale } from '@/lib/i18n';
import type { Subject, EvaluationComponent } from '@/lib/types';
import type { UserPayload } from '@/lib/auth';

export default function EvaluacionesPage() {
  const [locale, setLocale] = useState<Locale>('es');
  const [user, setUser] = useState<UserPayload | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editedComponents, setEditedComponents] = useState<Record<string, Partial<EvaluationComponent>>>({});
  const [editedEvals, setEditedEvals] = useState<Record<string, { name: string; percentage: number }>>({});
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'es' || saved === 'en')) setLocale(saved);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, subjectsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/subjects'),
      ]);
      const userData = await userRes.json();
      const subjectsData = await subjectsRes.json();
      if (userData.user) setUser(userData.user);
      if (subjectsData.subjects) {
        setSubjects(subjectsData.subjects);
        const openMap: Record<string, boolean> = {};
        subjectsData.subjects.forEach((s: Subject) => { openMap[s.id] = true; });
        setOpenSubjects(openMap);
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

  const handleDelete = async (id: string) => {
    if (!confirm(t.eval_confirm_delete)) return;
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const startEditing = (subjectId: string) => {
    setEditingSubject(subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject?.evaluations) {
      const compEdits: Record<string, Partial<EvaluationComponent>> = {};
      const evalEdits: Record<string, { name: string; percentage: number }> = {};
      for (const ev of subject.evaluations) {
        evalEdits[ev.id] = { name: ev.name, percentage: ev.percentage };
        if (ev.components) {
          for (const comp of ev.components) {
            compEdits[comp.id] = {
              type: comp.type,
              percentage: comp.percentage,
              due_date: comp.due_date || '',
            };
          }
        }
      }
      setEditedComponents(compEdits);
      setEditedEvals(evalEdits);
    }
  };

  const cancelEditing = () => {
    setEditingSubject(null);
    setEditedComponents({});
    setEditedEvals({});
  };

  const updateEvalField = (evalId: string, field: string, value: string | number) => {
    setEditedEvals(prev => ({
      ...prev,
      [evalId]: { ...prev[evalId], [field]: value },
    }));
  };

  const updateComponentField = (compId: string, field: string, value: string | number) => {
    setEditedComponents(prev => ({
      ...prev,
      [compId]: { ...prev[compId], [field]: value },
    }));
  };

  const saveEdits = async () => {
    setSaving(true);
    try {
      const compPromises = Object.entries(editedComponents).map(([compId, changes]) =>
        fetch(`/api/components/${compId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        })
      );
      const evalPromises = Object.entries(editedEvals).map(([evalId, changes]) =>
        fetch(`/api/evaluations/${evalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        })
      );
      await Promise.all([...compPromises, ...evalPromises]);
      setEditingSubject(null);
      setEditedComponents({});
      setEditedEvals({});
      setSaveMessage(locale === 'es' ? '✅ Cambios guardados' : '✅ Changes saved');
      setTimeout(() => setSaveMessage(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="eval-container">
      <div className="eval-header">
        <div>
          <h1 className="eval-title">{t.eval_title}</h1>
          <p className="eval-subtitle">{t.eval_subtitle}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + {t.eval_add_subject}
          </button>
        )}
      </div>

      <div className="stagger-children">
        {subjects.map(subject => {
          const isEditing = editingSubject === subject.id;

          return (
            <div key={subject.id} className="card subject-card">
              <div className="subject-header" onClick={() => !isEditing && toggleSubject(subject.id)}>
                <div className="subject-name">
                  <div className="subject-icon">📘</div>
                  {subject.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isAdmin && !isEditing && (
                    <div className="admin-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setOpenSubjects(prev => ({ ...prev, [subject.id]: true }));
                          startEditing(subject.id);
                        }}
                      >
                        ✏️ {t.eval_edit}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(subject.id)}
                      >
                        {t.eval_delete}
                      </button>
                    </div>
                  )}
                  {isEditing && (
                    <div className="admin-actions" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-primary btn-sm" onClick={saveEdits} disabled={saving}>
                        {saving ? '...' : `💾 ${t.eval_save}`}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEditing}>
                        {t.eval_cancel}
                      </button>
                    </div>
                  )}
                  {!isEditing && (
                    <span className={`subject-chevron ${openSubjects[subject.id] ? 'open' : ''}`}>▼</span>
                  )}
                </div>
              </div>

              {(openSubjects[subject.id] || isEditing) && subject.evaluations && (
                <div className="subject-body">
                  {subject.evaluations.map(ev => (
                    <div key={ev.id} className="eval-block">
                      <div className="eval-block-header">
                        {isEditing ? (
                          <>
                            <input
                              className="form-input form-input-sm"
                              style={{ width: 180, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }}
                              value={editedEvals[ev.id]?.name ?? ev.name}
                              onChange={e => updateEvalField(ev.id, 'name', e.target.value)}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input
                                className="form-input form-input-sm"
                                type="number"
                                style={{ width: 60, textAlign: 'center' }}
                                value={editedEvals[ev.id]?.percentage ?? ev.percentage}
                                onChange={e => updateEvalField(ev.id, 'percentage', parseInt(e.target.value) || 0)}
                                min={0}
                                max={100}
                              />
                              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem' }}>%</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="eval-block-name">{ev.name}</span>
                            <span className="eval-block-percentage">{ev.percentage}%</span>
                          </>
                        )}
                      </div>
                      <div className="eval-components">
                        {ev.components?.map(comp => (
                          <div key={comp.id} className="eval-component">
                            {isEditing ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                  <input
                                    className="form-input form-input-sm"
                                    style={{ width: 160 }}
                                    value={editedComponents[comp.id]?.type ?? comp.type}
                                    onChange={e => updateComponentField(comp.id, 'type', e.target.value)}
                                    placeholder="Tipo"
                                  />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input
                                      className="form-input form-input-sm"
                                      type="number"
                                      style={{ width: 60, textAlign: 'center' }}
                                      value={editedComponents[comp.id]?.percentage ?? comp.percentage}
                                      onChange={e => updateComponentField(comp.id, 'percentage', parseInt(e.target.value) || 0)}
                                      min={0}
                                      max={100}
                                    />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>%</span>
                                  </div>
                                </div>
                                <input
                                  className="form-input form-input-sm"
                                  type="date"
                                  style={{ width: 160 }}
                                  value={editedComponents[comp.id]?.due_date ?? comp.due_date ?? ''}
                                  onChange={e => updateComponentField(comp.id, 'due_date', e.target.value)}
                                />
                              </>
                            ) : (
                              <>
                                <div className="eval-component-info">
                                  <span className="eval-component-type">{comp.type}</span>
                                  <span className="eval-component-pct">({comp.percentage}%)</span>
                                </div>
                                <div className="eval-component-date">
                                  {comp.due_date ? (
                                    <span className="date-badge">📅 {formatDate(comp.due_date)}</span>
                                  ) : (
                                    <span className="date-badge no-date">⏳ {t.eval_no_date}</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddSubjectModal
          locale={locale}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}

      {saveMessage && (
        <div className="save-toast">{saveMessage}</div>
      )}
    </div>
  );
}

function AddSubjectModal({
  locale,
  onClose,
  onAdded,
}: {
  locale: Locale;
  onClose: () => void;
  onAdded: () => void;
}) {
  const t = translations[locale];
  const [name, setName] = useState('');
  const [evaluations, setEvaluations] = useState([
    { name: 'Evaluación 1', percentage: 25, components: [{ type: '', percentage: 100, due_date: '' }] },
    { name: 'Evaluación 2', percentage: 35, components: [{ type: '', percentage: 100, due_date: '' }] },
    { name: 'Evaluación 3', percentage: 40, components: [{ type: '', percentage: 100, due_date: '' }] },
  ]);
  const [saving, setSaving] = useState(false);

  const updateEval = (idx: number, field: string, value: string | number) => {
    setEvaluations(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const updateComponent = (eIdx: number, cIdx: number, field: string, value: string | number) => {
    setEvaluations(prev => {
      const copy = [...prev];
      const comps = [...copy[eIdx].components];
      comps[cIdx] = { ...comps[cIdx], [field]: value };
      copy[eIdx] = { ...copy[eIdx], components: comps };
      return copy;
    });
  };

  const addComponent = (eIdx: number) => {
    setEvaluations(prev => {
      const copy = [...prev];
      copy[eIdx] = {
        ...copy[eIdx],
        components: [...copy[eIdx].components, { type: '', percentage: 0, due_date: '' }],
      };
      return copy;
    });
  };

  const removeComponent = (eIdx: number, cIdx: number) => {
    setEvaluations(prev => {
      const copy = [...prev];
      copy[eIdx] = {
        ...copy[eIdx],
        components: copy[eIdx].components.filter((_, i) => i !== cIdx),
      };
      return copy;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          evaluations: evaluations.map((ev, i) => ({
            name: ev.name,
            percentage: ev.percentage,
            display_order: i + 1,
            components: ev.components
              .filter(c => c.type)
              .map((c, j) => ({
                type: c.type,
                percentage: c.percentage,
                due_date: c.due_date || null,
                display_order: j + 1,
              })),
          })),
        }),
      });

      if (res.ok) onAdded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{t.eval_add_subject}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Nombre de la asignatura</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Certámenes de Programación"
              required
            />
          </div>

          {evaluations.map((ev, eIdx) => (
            <div key={eIdx} className="eval-block" style={{ marginBottom: 16 }}>
              <div className="eval-block-header">
                <input
                  className="form-input form-input-sm"
                  style={{ width: 160, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600 }}
                  value={ev.name}
                  onChange={e => updateEval(eIdx, 'name', e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    className="form-input form-input-sm"
                    type="number"
                    style={{ width: 60, textAlign: 'center' }}
                    value={ev.percentage}
                    onChange={e => updateEval(eIdx, 'percentage', parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>

              <div style={{ padding: '12px 16px' }}>
                {ev.components.map((comp, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                      className="form-input form-input-sm"
                      placeholder="Tipo (Certamen, Test...)"
                      value={comp.type}
                      onChange={e => updateComponent(eIdx, cIdx, 'type', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      className="form-input form-input-sm"
                      type="number"
                      placeholder="%"
                      value={comp.percentage}
                      onChange={e => updateComponent(eIdx, cIdx, 'percentage', parseInt(e.target.value) || 0)}
                      style={{ width: 60 }}
                      min={0}
                      max={100}
                    />
                    <input
                      className="form-input form-input-sm"
                      type="date"
                      value={comp.due_date}
                      onChange={e => updateComponent(eIdx, cIdx, 'due_date', e.target.value)}
                      style={{ width: 150 }}
                    />
                    {ev.components.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => removeComponent(eIdx, cIdx)}
                        style={{ fontSize: '0.8rem', width: 32, height: 32 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => addComponent(eIdx)}
                  style={{ marginTop: 4 }}
                >
                  + Componente
                </button>
              </div>
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.eval_cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '...' : t.eval_save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
