import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import './BasicoMenu.css';

const EspectadorRoomSessions: React.FC = () => {
  const navigate = useNavigate();
  const { id: roomIdFromParams } = useParams<{ id: string }>();
  const roomId = roomIdFromParams?.trim();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Síntesis de voz para accesibilidad
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) {
        setErrorMsg('No se encontró el ID de la sala.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const user = await userService.getUserMe(token);
        speakText('Cargando grabaciones de la sala.');

        const data = await sessionService.getSessionsByRoomId(roomId, user.email);
        // Filtrar sesiones visibles
        const visibleSessions = data.sessions.filter(s => s.visible);
        
        // Ordenar por fecha reciente
        visibleSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setSessions(visibleSessions);
        setRoomName(data.room_name || 'Sala');
        speakText(`Cargadas ${visibleSessions.length} grabaciones.`);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al cargar las sesiones.');
        speakText('Error al cargar las grabaciones.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomData();
  }, [navigate, roomId]);

  const handleLogout = () => {
    speakText('Cerrando sesión');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="basico-menu-screen">
      {/* Barra de menú superior extra ancha */}
      <header className="basico-header">
        <button 
          className="btn-header-large btn-header-home" 
          onClick={() => {
            speakText('Volviendo a salas');
            navigate('/basico/salas');
          }}
          onFocus={() => speakText('Botón volver atrás')}
          title="Volver a Salas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Atrás</span>
        </button>

        <div className="basico-header-title">
          <h2>Grabaciones</h2>
          <span className="user-indicator">Sala: {roomName}</span>
        </div>

        <button 
          className="btn-header-large btn-header-logout" 
          onClick={handleLogout}
          onFocus={() => speakText('Botón cerrar sesión')}
          title="Cerrar Sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Salir</span>
        </button>
      </header>

      {/* Contenedor Principal */}
      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
          
          <div className="subview-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
            <h3 className="subview-title" style={{ width: '100%', textAlign: 'center' }}>Grabaciones de la Sala</h3>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando grabaciones...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : sessions.length > 0 ? (
              <div className="accessible-list-grid" style={{ maxHeight: '100%', flex: 1 }}>
                {sessions.map(session => (
                  <button 
                    key={session.session_id} 
                    className="btn-item-giant recording-item" 
                    onClick={() => {
                      speakText(`Abriendo detalle de ${session.name}`);
                      navigate(`/basico/sala/${roomId}/sesion/${session.session_id}`, { state: { isEspectador: true } });
                    }}
                    onFocus={() => speakText(`Grabación ${session.name}, grabada el ${session.created_at.split('T')[0]}`)}
                  >
                    <div className="recording-details">
                      <span className="recording-name">{session.name}</span>
                      <span className="recording-date">Fecha: {session.created_at.split('T')[0]}</span>
                      <span className="recording-status">Estado: {session.status === 'completed' ? 'Completado' : 'Procesando'}</span>
                    </div>
                    <div className="recording-action-icon">
                      {session.status === 'processing' || session.status === 'procesando' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-icon">
                           <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="subview-message">
                Esta sala no tiene grabaciones disponibles.
              </div>
            )}
          </div>

          {/* Botón Volver a Salas abajo y centrado */}
          <div className="subview-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
            <button 
              className="btn-back-giant" 
              onClick={() => {
                speakText('Volviendo a salas');
                navigate('/basico/salas');
              }}
              onFocus={() => speakText('Botón volver atrás')}
            >
              ← Volver a Salas
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EspectadorRoomSessions;
