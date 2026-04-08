import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OradorDashboard.css';
import RoomCard, { type Session } from '../common/RoomCard';

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

const OradorDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Estado para manejar la fecha seleccionada del calendario
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Sesiones de prueba, incluyendo algunas para el día de "hoy" (cuando se abra)
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', title: 'Reunion...', date: formatDateForFilter(new Date()) },
    { id: '2', title: '', date: formatDateForFilter(new Date()) },
    { id: '3', title: 'Entrevista de Trabajo', date: formatDateForFilter(new Date(new Date().setDate(new Date().getDate() + 1))) },
    { id: '4', title: '', date: formatDateForFilter(new Date(new Date().setDate(new Date().getDate() - 1))) },
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

  const handleEdit = (session: Session) => {
    navigate('/nueva-sesion', { state: { isEdit: true, sessionName: session.title, sessionId: session.id } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      setSessions(sessions.filter(s => s.id !== id));
      setOpenMenuId(null);
    }
  };

  const weekDays = getWeekDays(selectedDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  const dateRangeStr = `${getMonthNameShort(weekStart)} ${weekStart.getDate()} - ${getMonthNameShort(weekEnd)} ${weekEnd.getDate()}`;
  const selectedDateStr = getFullDateString(selectedDate);

  // Filtramos las sesiones basadas en el día seleccionado o la búsqueda
  const filteredSessions = sessions.filter(session => {
    if (isSearching && searchQuery) {
      return session.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return session.date === formatDateForFilter(selectedDate);
  });

  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <h1 className="welcome-text">Bienvenido</h1>
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
        <p>Aqui puedes crear salas para ordenar tus grabaciones</p>
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
            <span className="cal-range">{dateRangeStr}</span>
            <button className="btn-cal-nav" onClick={handleNextWeek}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="calendar-days">
            {weekDays.map((day, index) => {
              const isSelected = formatDateForFilter(day) === formatDateForFilter(selectedDate);
              return (
                <div 
                  key={index} 
                  className={`cal-day ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span>{getDayNameShort(day)}</span>
                  <span>{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="selected-date-header">
          <h3 style={{ textTransform: 'capitalize' }}>{selectedDateStr}</h3>
        </div>

        <div className="sort-section">
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
                openMenuId={openMenuId}
                onSetOpenMenuId={setOpenMenuId}
                onClick={() => navigate('/sala/' + session.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              {isSearching && searchQuery 
                ? "No se encontraron salas con ese nombre."
                : "No tienes salas para este día."}
            </p>
          )}
        </div>
      </main>

      <button 
        className="fab-button" 
        onClick={() => navigate('/nueva-sesion')}
        title="Crear nueva sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
};

export default OradorDashboard;
