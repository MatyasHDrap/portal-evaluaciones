'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/lib/i18n';

interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  color: string;
  notes: string;
}

interface EvalEvent {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: string;
  percentage: number;
}

interface EventModalData {
  id?: string;
  title: string;
  event_date: string;
  color: string;
  notes: string;
}

interface EvalEditData {
  componentId: string;
  type: string;
  due_date: string;
  subject: string;
  evalName: string;
}

const COLOR_OPTIONS = [
  '#7c6cf0', '#22d3c8', '#ff8fab', '#ffd166',
  '#06d6a0', '#ef6461', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#dda0dd', '#ff6b6b', '#48dbfb',
];

const MONTH_NAMES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarProps {
  locale: Locale;
  evalEvents: EvalEvent[];
  userRole?: string;
  onEvalUpdated?: () => void;
}

export default function Calendar({ locale, evalEvents, userRole, onEvalUpdated }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [modalData, setModalData] = useState<EventModalData>({
    title: '', event_date: '', color: '#7c6cf0', notes: '',
  });
  const [evalEditData, setEvalEditData] = useState<EvalEditData>({
    componentId: '', type: '', due_date: '', subject: '', evalName: '',
  });
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ eval: EvalEvent[]; custom: CalendarEvent[] } | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = userRole === 'admin';
  const monthNames = locale === 'es' ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  const dayNames = locale === 'es' ? DAY_NAMES_ES : DAY_NAMES_EN;

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar?month=${currentMonth + 1}&year=${currentYear}`);
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const getDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = getDateStr(day);
    const evalEvts = evalEvents.filter(e => e.date === dateStr);
    const customEvts = events.filter(e => e.event_date === dateStr);
    return { eval: evalEvts, custom: customEvts };
  };

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const handleDayClick = (day: number) => {
    const dateStr = getDateStr(day);
    const dayEvents = getEventsForDay(day);
    setSelectedDate(dateStr);
    setSelectedDayEvents(dayEvents);
  };

  const refreshSelectedDay = () => {
    if (selectedDate) {
      const day = parseInt(selectedDate.split('-')[2]);
      setTimeout(() => handleDayClick(day), 200);
    }
  };

  // Custom events CRUD
  const openAddModal = (date: string) => {
    setModalData({ title: '', event_date: date, color: '#7c6cf0', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setModalData({
      id: event.id,
      title: event.title,
      event_date: event.event_date,
      color: event.color,
      notes: event.notes,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!modalData.title || !modalData.event_date) return;
    setSaving(true);
    try {
      if (modalData.id) {
        await fetch(`/api/calendar/${modalData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modalData),
        });
      } else {
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modalData),
        });
      }
      setShowModal(false);
      await fetchEvents();
      refreshSelectedDay();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustom = async (eventId: string) => {
    await fetch(`/api/calendar/${eventId}`, { method: 'DELETE' });
    await fetchEvents();
    refreshSelectedDay();
  };

  // Evaluation events edit (admin only)
  const openEvalEdit = (evt: EvalEvent) => {
    setEvalEditData({
      componentId: evt.id,
      type: evt.type,
      due_date: evt.date,
      subject: evt.subject,
      evalName: evt.title,
    });
    setShowEvalModal(true);
  };

  const handleEvalSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/components/${evalEditData.componentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: evalEditData.type,
          due_date: evalEditData.due_date || null,
        }),
      });
      setShowEvalModal(false);
      if (onEvalUpdated) onEvalUpdated();
      refreshSelectedDay();
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-card card">
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth}>◀</button>
          <div className="cal-title-group">
            <h2 className="cal-title">{monthNames[currentMonth]} {currentYear}</h2>
            <button className="cal-today-btn" onClick={goToday}>
              {locale === 'es' ? 'Hoy' : 'Today'}
            </button>
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>▶</button>
        </div>

        <div className="cal-grid cal-day-names">
          {dayNames.map(d => (
            <div key={d} className="cal-day-name">{d}</div>
          ))}
        </div>

        <div className="cal-grid cal-days">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={idx} className="cal-cell cal-cell-empty" />;
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.eval.length > 0 || dayEvents.custom.length > 0;

            const allLabels: { label: string; color: string }[] = [];
            dayEvents.eval.forEach(e => {
              allLabels.push({ label: e.type, color: '#ff8fab' });
            });
            dayEvents.custom.forEach(e => {
              allLabels.push({ label: e.title, color: e.color });
            });

            return (
              <div
                key={idx}
                className={`cal-cell ${isToday(day) ? 'cal-today' : ''} ${hasEvents ? 'cal-has-events' : ''} ${selectedDate === getDateStr(day) ? 'cal-selected' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal-day-num">{day}</span>
                {allLabels.length > 0 && (
                  <div className="cal-labels">
                    {allLabels.slice(0, 2).map((item, i) => (
                      <span key={i} className="cal-label" style={{ background: item.color + '22', color: item.color, borderColor: item.color + '44' }}>
                        {item.label.length > 10 ? item.label.slice(0, 9) + '…' : item.label}
                      </span>
                    ))}
                    {allLabels.length > 2 && (
                      <span className="cal-label-more">+{allLabels.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDayEvents && (
        <div className="cal-day-panel card animate-slide-up">
          <div className="cal-day-panel-header">
            <h3 className="cal-day-panel-title">{formatDateDisplay(selectedDate)}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openAddModal(selectedDate)}>
              + {locale === 'es' ? 'Agregar evento' : 'Add event'}
            </button>
          </div>

          {selectedDayEvents.eval.length === 0 && selectedDayEvents.custom.length === 0 && (
            <p className="cal-no-events">
              {locale === 'es' ? 'Sin eventos este día' : 'No events this day'}
            </p>
          )}

          {/* Evaluation events */}
          {selectedDayEvents.eval.map((evt, i) => (
            <div key={`eval-${i}`} className="cal-event-item" style={{ borderLeftColor: '#ff8fab' }}>
              <div className="cal-event-header">
                <div>
                  <div className="cal-event-badge" style={{ background: 'rgba(255, 143, 171, 0.12)', color: '#ff8fab' }}>
                    📋 {locale === 'es' ? 'Evaluación' : 'Evaluation'}
                  </div>
                  <div className="cal-event-title">{evt.subject}</div>
                  <div className="cal-event-detail">{evt.title} — {evt.type} ({evt.percentage}%)</div>
                </div>
                {isAdmin && (
                  <div className="cal-event-actions">
                    <button className="cal-event-btn" onClick={() => openEvalEdit(evt)} title={locale === 'es' ? 'Editar evaluación' : 'Edit evaluation'}>
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Custom events */}
          {selectedDayEvents.custom.map(evt => (
            <div key={evt.id} className="cal-event-item" style={{ borderLeftColor: evt.color }}>
              <div className="cal-event-header">
                <div className="cal-event-title" style={{ color: evt.color }}>{evt.title}</div>
                <div className="cal-event-actions">
                  <button className="cal-event-btn" onClick={() => openEditModal(evt)}>✏️</button>
                  <button className="cal-event-btn" onClick={() => handleDeleteCustom(evt.id)}>🗑️</button>
                </div>
              </div>
              {evt.notes && <div className="cal-event-notes">{evt.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Custom event modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h2 className="modal-title">
              {modalData.id
                ? (locale === 'es' ? 'Editar Evento' : 'Edit Event')
                : (locale === 'es' ? 'Nuevo Evento' : 'New Event')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{locale === 'es' ? 'Título' : 'Title'}</label>
                <input
                  className="form-input"
                  value={modalData.title}
                  onChange={e => setModalData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={locale === 'es' ? 'Nombre del evento' : 'Event name'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{locale === 'es' ? 'Fecha' : 'Date'}</label>
                <input
                  className="form-input"
                  type="date"
                  value={modalData.event_date}
                  onChange={e => setModalData(prev => ({ ...prev, event_date: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="cal-color-picker">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      className={`cal-color-opt ${modalData.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setModalData(prev => ({ ...prev, color: c }))}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{locale === 'es' ? 'Notas' : 'Notes'}</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={modalData.notes}
                  onChange={e => setModalData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={locale === 'es' ? 'Notas adicionales...' : 'Additional notes...'}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !modalData.title}>
                {saving ? '...' : (locale === 'es' ? 'Guardar' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation edit modal (admin only) */}
      {showEvalModal && (
        <div className="modal-overlay" onClick={() => setShowEvalModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h2 className="modal-title">
              {locale === 'es' ? 'Editar Evaluación' : 'Edit Evaluation'}
            </h2>
            
            <div className="cal-event-badge" style={{ background: 'rgba(255, 143, 171, 0.12)', color: '#ff8fab', marginBottom: 16 }}>
              📋 {evalEditData.subject} — {evalEditData.evalName}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{locale === 'es' ? 'Tipo de evaluación' : 'Evaluation type'}</label>
                <input
                  className="form-input"
                  value={evalEditData.type}
                  onChange={e => setEvalEditData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Certamen, Test, Trabajo..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">{locale === 'es' ? 'Fecha' : 'Date'}</label>
                <input
                  className="form-input"
                  type="date"
                  value={evalEditData.due_date}
                  onChange={e => setEvalEditData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEvalModal(false)}>
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button className="btn btn-primary" onClick={handleEvalSave} disabled={saving}>
                {saving ? '...' : (locale === 'es' ? 'Guardar' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
