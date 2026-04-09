import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../orador/OradorDashboard.css';
import RoomCard, { type Session } from '../common/RoomCard';

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

const EspectadorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllRooms, setShowAllRooms] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', title: 'Reunion...', date: formatDateForFilter(new Date()) },
    { id: '3', title: 'Entrevista de Trabajo', date: formatDateForFilter(new Date(new Date().setDate(new Date().getDate() + 1))) },
  ]);

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
    setShowAllRooms(false);
  };

  const handleJoinRoom = () => {
    setShowJoinModal(true);
  };

  const submitJoinRoom = () => {
    const code = joinCode.trim();
    if (code) {
      setSessions([...sessions, { id: code, title: `Sala unida (${code})`, date: formatDateForFilter(new Date()) }]);
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  const weekDays = getWeekDays(selectedDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  const dateRangeStr = `${getMonthNameShort(weekStart)} ${weekStart.getDate()} - ${getMonthNameShort(weekEnd)} ${weekEnd.getDate()}`;
  const selectedDateStr = getFullDateString(selectedDate);

  const filteredSessions = sessions.filter(session => {
    if (isSearching && searchQuery) {
      return session.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (showAllRooms) {
      return true;
    }
    return session.date === formatDateForFilter(selectedDate);
  });

  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <h1 className="welcome-text">Espectador</h1>
        <button 
          className="btn-home-icon" 
          onClick={() => navigate('/home')} 
          title="Volver a Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
      </header>

      <div className="info-banner">
        <p>Aquí puedes ver las salas a las que te has unido</p>
      </div>
      
      <main className="dashboard-content">
        <div className="section-header">
          {!isSearching ? (
            <>
              <h2>Mis Salas</h2>
              <button className="btn-search" onClick={() => setIsSearching(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </>
          ) : (
            <div className="search-bar-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar sesión por nombre..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button className="btn-close-search" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
        
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
                  fontSize: '1.5rem', // Attempt to make the native picker larger on some platforms
                  zIndex: 10
                }}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker();
                  } catch (err) {
                    // Fallback
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
              const isSelected = !showAllRooms && formatDateForFilter(day) === formatDateForFilter(selectedDate);
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

        <div className="selected-date-header">
          <h3 style={{ textTransform: 'capitalize', margin: 0 }}>
            {showAllRooms ? 'Todas las salas' : selectedDateStr}
          </h3>
        </div>

        <div className="sort-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => setShowAllRooms(true)}
            style={{ 
              background: showAllRooms ? '#e0e7ff' : '#f3f4f6', 
              border: showAllRooms ? '1px solid #818cf8' : '1px solid #d1d5db', 
              color: showAllRooms ? '#4f46e5' : '#374151', 
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              padding: '0.4rem 1.2rem', borderRadius: '20px',
              transition: 'all 0.2s'
            }}
          >
            Todos
          </button>
          <button className="btn-sort">
            Ordenar por 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="14" y2="12"></line>
              <line x1="4" y1="18" x2="8" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sessions-list">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <RoomCard
                key={session.id}
                session={session}
                isFirst={index === 0}
                onClick={() => navigate('/espectador/sala/' + session.id)}
                isEspectador={true}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              {isSearching && searchQuery 
                ? "No se encontraron salas con ese nombre."
                : "No estás en ninguna sala este día."}
            </p>
          )}
        </div>
      </main>

      <button 
        className="fab-button" 
        onClick={handleJoinRoom}
        title="Unirse a una sala"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
      </button>

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Unirse a una sala</h3>
            <p className="modal-text">Ingresa el código de acceso proporcionado por el orador para acceder a sus grabaciones.</p>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Ej. C7B-9P" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitJoinRoom()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowJoinModal(false)}>Cancelar</button>
              <button className="btn-modal-submit" onClick={submitJoinRoom}>Unirme</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspectadorDashboard;
