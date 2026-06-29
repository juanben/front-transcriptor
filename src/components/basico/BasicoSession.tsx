import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import './BasicoMenu.css';
import './BasicoOwnRecords.css';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';

const BasicoSession: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = useBasicoLogout();
  const { id: roomIdFromParams } = useParams<{ id: string }>();
  const roomId = roomIdFromParams?.trim();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);



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
        setUserEmail(user.email);
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

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      speakText("Eliminando grabación...");
      await sessionService.deleteSession(
        roomId || sessionToDelete.room_id,
        sessionToDelete.session_id,
        userEmail || sessionToDelete.creator_email
      );

      setSessions(prev => prev.filter(s => s.session_id !== sessionToDelete.session_id));
      speakText("Grabación eliminada correctamente.");
    } catch (error) {
      console.error('Error al eliminar la grabación:', error);
      speakText("Error al eliminar la grabación.");
    } finally {
      setSessionToDelete(null);
    }
  };

  return (
    <div className="basico-menu-screen">
      <BasicoTopMenu
        title="Grabaciones"
        subtitle={roomName}
        onBackClick={() => {
          speakText('Regresando a Biblioteca');
          navigate('/basico/salas');
        }}
        backTitle="Volver a mi biblioteca"
        backSpeakText="Volver"
        onLogoutClick={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>

          <div className="subview-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
            <h3 className="subview-title" style={{ width: '100%', textAlign: 'center' }}>Grabaciones de la Coleccion</h3>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando grabaciones...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : sessions.length > 0 ? (
              <div className="accessible-list-grid basico-own-records-list" style={{ maxHeight: '100%', flex: 1 }}>
                {sessions.map(session => (
                  <div key={session.session_id} className="recording-item-row">
                    <button
                      className="btn-item-giant recording-item"
                      onClick={() => {
                        speakText(`Abriendo detalle de ${session.name}`);
                        navigate(`/basico/sala/${roomId}/sesion/${session.session_id}`, { state: { isEspectador: true } });
                      }}
                      onFocus={() => {
                        const dateStr = session.created_at ? (session.created_at.includes('T') ? session.created_at.split('T')[0] : session.created_at.split(' ')[0]) : 'Fecha no disponible';
                        speakText(`Grabación ${session.name}, grabada el ${dateStr}`);
                      }}
                    >
                      <div className="recording-details">
                        <span className="recording-name">{session.name}</span>
                        <span className="recording-date">
                          Fecha: {session.created_at ? (session.created_at.includes('T') ? session.created_at.split('T')[0] : session.created_at.split(' ')[0]) : 'Fecha no disponible'}
                        </span>
                      </div>
                      <div className={`recording-action-icon ${
                        (session.status?.toLowerCase() === 'completed' || session.status?.toLowerCase() === 'completado')
                          ? 'status-completed'
                          : (session.status?.toLowerCase() === 'failed' || session.status?.toLowerCase() === 'error' || session.status?.toLowerCase() === 'fallado')
                          ? 'status-failed'
                          : 'status-processing'
                      }`}>
                        {(session.status?.toLowerCase() === 'completed' || session.status?.toLowerCase() === 'completado') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                          </svg>
                        ) : (session.status?.toLowerCase() === 'failed' || session.status?.toLowerCase() === 'error' || session.status?.toLowerCase() === 'fallado') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-icon">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                          </svg>
                        )}
                        <span className="recording-status">
                          Estado: {
                            (session.status?.toLowerCase() === 'completed' || session.status?.toLowerCase() === 'completado')
                              ? 'Completado'
                              : (session.status?.toLowerCase() === 'failed' || session.status?.toLowerCase() === 'error' || session.status?.toLowerCase() === 'fallado')
                              ? 'Error'
                              : 'Procesando'
                          }
                        </span>
                      </div>
                    </button>

                    <button
                      className="btn-delete-giant"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(session);
                        speakText(`¿Desea eliminar la grabación ${session.name}?`);
                      }}
                      onFocus={() => speakText(`Botón Borrar grabación ${session.name}`)}
                      aria-label={`Borrar grabación ${session.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
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
                speakText('Regresando a mi biblioteca');
                navigate('/basico/salas');
              }}
              onFocus={() => speakText('Resgresar a mi biblioteca')}
            >
              ← Volver
            </button>
          </div>
        </div>
      </main>

      {sessionToDelete && (
        <div className="basico-modal-overlay" onClick={() => setSessionToDelete(null)}>
          <div className="basico-modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>¿Eliminar grabación?</h3>
            <p style={{ fontSize: '1.3rem', marginBottom: '2.5rem' }}>
              ¿Estás seguro de que deseas eliminar la grabación "{sessionToDelete.name}"? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <button
                className="btn-modal-confirm"
                onClick={handleConfirmDelete}
                onFocus={() => speakText("Sí, eliminar")}
                style={{
                  padding: '1.5rem 2rem',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Sí, eliminar
              </button>
              <button
                className="btn-modal-cancel"
                onClick={() => setSessionToDelete(null)}
                onFocus={() => speakText("No, cancelar")}
                style={{
                  padding: '1.5rem 2rem',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicoSession;