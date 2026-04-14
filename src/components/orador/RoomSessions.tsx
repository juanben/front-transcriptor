import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionCard, { type RecordingSession } from '../common/SessionCard';
import UserMenu from '../common/UserMenu';
import './OradorDashboard.css';
import './RoomSessions.css';

// Funciones auxiliares para el calendario
const getWeekDays = (currentDate: Date) => {
  const date = new Date(currentDate);
  const day = date.getDay(); // 0 es Domingo, 1 es Lunes
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando el día es domingo
  const monday = new Date(date.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    week.push(nextDate);
  }
  return week;
};

const getMonthNameShort = (date: Date) => {
  const str = date.toLocaleDateString('es-ES', { month: 'short' });
  return str.replace('.', '');
};

const getDayNameShort = (date: Date) => {
  const name = date.toLocaleDateString('es-ES', { weekday: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1, 3).replace('.', '');
};

const getFullDateString = (date: Date) => {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateForFilter = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const mockSessions: RecordingSession[] = [
  { id: '1', title: 'Clase de Introducción', date: '2026-04-13', duration: '45:00', isVisible: true, isProcessing: false, isSharable: true },
  { id: '2', title: 'Entrevista de Usuario', date: '2026-04-14', duration: '30:20', isVisible: false, isProcessing: true, isSharable: false },
  { id: '3', title: 'Grabación en curso', date: '2026-04-13', duration: '12:05', isVisible: false, isProcessing: true, isSharable: false },
  { id: '4', title: 'Reunión Semanal', date: '2026-04-12', duration: '1:15:00', isVisible: true, isProcessing: true, isSharable: true },
];

const RoomSessions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<RecordingSession[]>(mockSessions);
  const [activeTab, setActiveTab] = useState<'Todos' | 'Publicado' | 'Invisible' | 'Procesando'>('Todos');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllDates, setShowAllDates] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState<string | null>(null);
  const [resourceLink, setResourceLink] = useState('');

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    setShowAllDates(false);
  };

  const filteredSessions = sessions.filter(session => {
    // Filtro por fecha
    if (!showAllDates && session.date !== formatDateForFilter(selectedDate)) {
      return false;
    }

    // Filtro por pestaña
    switch (activeTab) {
      case 'Publicado': return session.isVisible && !session.isProcessing;
      case 'Invisible': return !session.isVisible && !session.isProcessing;
      case 'Procesando': return session.isProcessing;
      default: return true; // 'Todos'
    }
  });

  const handleToggleVisibility = (sessionId: string, newVisibility: boolean) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isVisible: newVisibility } : s));
  };

  const handleToggleShare = (sessionId: string, newSharable: boolean) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isSharable: newSharable } : s));
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      setSessions(sessions.filter(s => s.id !== showDeleteModal));
      setShowDeleteModal(null);
    }
  };

  const openResourceModal = (sessionId: string) => {
    setShowResourceModal(sessionId);
    setResourceLink(''); 
  };

  const saveResourceLink = () => {
    setShowResourceModal(null);
  };

  const weekDays = getWeekDays(selectedDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  const dateRangeStr = `${getMonthNameShort(weekStart)} ${weekStart.getDate()} - ${getMonthNameShort(weekEnd)} ${weekEnd.getDate()}`;
  const selectedDateStr = getFullDateString(selectedDate);

  return (
    <div className="dashboard-screen room-sessions-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button 
            className="btn-back-text" 
            onClick={() => navigate('/orador')} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserMenu />
            <button 
              className="btn-home-icon" 
              onClick={() => navigate('/home')} 
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="room-title-row">
          <h2 className="room-title-text">Reunion</h2>
          <button className="btn-waitlist" onClick={() => navigate(`/sala/${id || 'default'}/lista-espera`)}>Lista de espera</button>
        </div>

        <div className="room-code-display">
          Código: X7B - 9P
        </div>
      </header>

      <main className="dashboard-content room-content-main">
        <div className="new-recording-section">
          <button 
            className="btn-new-recording"
            onClick={() => navigate(`/sala/${id || 'default'}/nombre-sesion`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            Nueva Grabación
          </button>
        </div>

        <div className="divider-dashed"></div>

        <div className="calendar-widget">
          <div className="calendar-header">
            <button className="btn-cal-nav" onClick={handlePrevWeek}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }} className="cal-range-container">
              <span className="cal-range" style={{ pointerEvents: 'none' }}>{dateRangeStr}</span>
              <input 
                type="month" 
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  width: '100%', height: '100%', 
                  opacity: 0, 
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  zIndex: 10
                }}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker();
                  } catch (err) {
                    if (err instanceof Error) {
                      console.error(err.message);
                    }
                  }
                }}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month] = e.target.value.split('-');
                    handleDateSelect(new Date(parseInt(year), parseInt(month) - 1, 1));
                  }
                }}
              />
            </div>
            <button className="btn-cal-nav" onClick={handleNextWeek}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="calendar-days">
            {weekDays.map((day, index) => {
              const isSelected = !showAllDates && formatDateForFilter(day) === formatDateForFilter(selectedDate);
              return (
                <div 
                  key={index} 
                  className={`cal-day ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  <span>{getDayNameShort(day)}</span>
                  <span>{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sort-section" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={() => setShowAllDates(true)}
            style={{ 
              background: showAllDates ? '#e0e7ff' : '#f3f4f6', 
              border: showAllDates ? '1px solid #818cf8' : '1px solid #d1d5db', 
              color: showAllDates ? '#4f46e5' : '#374151', 
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              padding: '0.4rem 1.2rem', borderRadius: '20px',
              transition: 'all 0.2s'
            }}
          >
            Mostrar todos los días
          </button>
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'Todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('Todos')}
          >Todos</button>
          <button 
            className={`tab-btn ${activeTab === 'Publicado' ? 'active' : ''}`}
            onClick={() => setActiveTab('Publicado')}
          >Publicado</button>
          <button 
            className={`tab-btn ${activeTab === 'Invisible' ? 'active' : ''}`}
            onClick={() => setActiveTab('Invisible')}
          >Invisible</button>
          <button 
            className={`tab-btn ${activeTab === 'Procesando' ? 'active' : ''}`}
            onClick={() => setActiveTab('Procesando')}
          >Procesando</button>
        </div>

        <div className="selected-date-header">
          <h3 style={{ textTransform: 'capitalize', margin: '0 0 1rem 0', fontSize: '1rem', color: '#4b5563' }}>
            {showAllDates ? 'Todas las fechas' : selectedDateStr}
          </h3>
        </div>

        <div className="sessions-list">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onClickPlay={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onComplementaryResource={() => openResourceModal(session.id)}
                onToggleVisibility={handleToggleVisibility}
                onToggleShare={handleToggleShare}
                onDelete={(sessionId) => setShowDeleteModal(sessionId)}
              />
            ))
          ) : (
            <p className="empty-state-text">
              No hay grabaciones para mostrar en esta categoría/fecha.
            </p>
          )}
        </div>
      </main>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Eliminar grabación</h3>
            <p className="modal-text">¿Estás seguro de que deseas eliminar esta grabación de la sala? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showResourceModal && (
        <div className="modal-overlay" onClick={() => setShowResourceModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Recurso Complementario</h3>
            <p className="modal-text">Añade o edita el enlace al recurso complementario (ej. Google Drive, OneDrive) para esta grabación.</p>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="https://..." 
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveResourceLink()}
              style={{ textTransform: 'none' }}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowResourceModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" onClick={saveResourceLink}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSessions;
