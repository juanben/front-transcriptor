import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionCard, { type RecordingSession } from '../common/SessionCard';
import UserMenu from '../common/UserMenu';
import './AvanzadoDashboard.css';
import './RoomSessions.css';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';

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

const getComplementaryResource = (session?: Session) => {
  const resource = session?.complementaryResourses ?? session?.complementaryResources;
  if (Array.isArray(resource)) {
    return resource.filter(Boolean).join('\n');
  }
  return resource?.toString() || '';
};

const JoinedRoomSessions: React.FC = () => {
  const navigate = useNavigate();
  const { id: roomIdFromParams } = useParams<{ id: string }>();
  const roomId = roomIdFromParams?.trim();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllDates, setShowAllDates] = useState(true);

  const [showResourceModal, setShowResourceModal] = useState<string | null>(null);
  const [resourceLink, setResourceLink] = useState('');

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) {
        setError('No se encontró el ID de la sala.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const user = await userService.getUserMe(token);

        const [data, roomsData] = await Promise.all([
          sessionService.getSessionsByRoomId(roomId, user.email),
          roomService.getPlayerRooms(user.email).catch(() => ({ rooms: [] }))
        ]);

        // Solo mostrar sesiones visibles para espectadores
        setSessions(data.sessions.filter(s => s.visible));
        setRoomName(data.room_name);

        const currentRoom = roomsData.rooms.find(r => r._id === roomId || r.id === roomId);
        setRoomCode(currentRoom?.room_code || data.sessions[0]?.room_code || '');

        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Ocurrió un error al cargar las sesiones.');
        } else {
          setError('Ocurrió un error al cargar las sesiones.');
        }
        setRoomCode('Error');
      } finally {
        setLoading(false);
      }
    };
    fetchRoomData();
  }, [navigate, roomId]);

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

  const filteredSessions: RecordingSession[] = sessions
    .filter(session => {
      if (!showAllDates && session.created_at.split('T')[0] !== formatDateForFilter(selectedDate)) {
        return false;
      }
      return session.visible;
    })
    .map((session): RecordingSession => ({
      id: session.session_id,
      title: session.name,
      date: session.created_at.split('T')[0],
      duration: 'N/A',
      isVisible: session.visible,
      isProcessing: ['processing', 'pending', 'transcribing'].includes(session.status),
      isSharable: session.allow_download,
    }));

  const openResourceModal = (sessionId: string) => {
    const selectedSession = sessions.find(session => session.session_id === sessionId);
    setShowResourceModal(sessionId);
    setResourceLink(getComplementaryResource(selectedSession));
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
            onClick={() => navigate('/avanzado')}
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
              onClick={() => navigate('/avanzado')}
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="room-title-row">
          <h2 className="room-title-text">{loading ? 'Cargando...' : roomName}</h2>
        </div>

        <div className="room-code-display">
          Código: {loading ? '...' : roomCode || 'N/A'}
        </div>
      </header>

      <main className="dashboard-content room-content-main">
        {error && <p className="error-text" style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}
        {loading && <p style={{ textAlign: 'center' }}>Cargando sesiones...</p>}

        {!loading && !error && (
          <>
            <div className="calendar-widget" style={{ marginTop: '1rem' }}>
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
                    onClick={() => navigate(`/sala/${roomId}/sesion/${session.id}`, { state: { isEspectador: true } })}
                    onClickPlay={() => navigate(`/sala/${roomId}/sesion/${session.id}`, { state: { isEspectador: true } })}
                    onComplementaryResource={() => openResourceModal(session.id)}
                    isEspectador={true}
                  />
                ))
              ) : (
                <p className="empty-state-text">
                  No hay grabaciones para mostrar en esta fecha.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {showResourceModal && (
        <div className="modal-overlay" onClick={() => setShowResourceModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Recurso Complementario</h3>
            <p className="modal-text">Material adjunto para esta grabación proporcionado por el orador.</p>
            <div
              className="modal-input"
              style={{
                textTransform: 'none',
                backgroundColor: '#f3f4f6',
                cursor: 'default',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                color: resourceLink ? '#4f46e5' : '#9ca3af'
              }}
            >
              {resourceLink ? (
                <a href={resourceLink.startsWith('http') ? resourceLink : `https://${resourceLink}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {resourceLink}
                </a>
              ) : (
                'Enlace no disponible'
              )}
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-modal-submit" onClick={() => setShowResourceModal(null)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinedRoomSessions;