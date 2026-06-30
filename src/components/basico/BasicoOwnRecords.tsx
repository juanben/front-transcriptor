import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Session, sessionService } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';
import './BasicoMenu.css';
import './BasicoOwnRecords.css';

const BasicoOwnRecords: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = useBasicoLogout();

  const [myRecordings, setMyRecordings] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [defaultRoomId, setDefaultRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [defaultRoomCode, setDefaultRoomCode] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 1. Obtener info del usuario
        const user = await userService.getUserMe(token);
        setUserName(user.name);
        setUserEmail(user.email);
        speakText('Cargando tus grabaciones.');

        // 2. Obtener la sala por defecto del usuario
        let defaultRoomData;
        try {
          defaultRoomData = await roomService.getDefaultRoom(user.email);
        } catch (error) {
          console.log('Creando sala por defecto ya que no existe...', error);
          defaultRoomData = await roomService.createDefaultRoom(user.email);
        }

        const roomId = defaultRoomData?.room?._id || defaultRoomData?._id;
        const code = defaultRoomData?.room?.room_code || defaultRoomData?.room_code || '';
        if (!roomId) {
          setMyRecordings([]);
          speakText('No se encontró una sala por defecto.');
          return;
        }
        setDefaultRoomId(roomId);
        setDefaultRoomCode(code);

        // 3. Traer sesiones de la sala por defecto
        const res = await sessionService.getSessionsByRoomId(roomId, user.email);
        const allSessions = res.sessions || [];

        // 4. Filtrar las creadas por este usuario
        const userSessions = allSessions.filter(s => s.creator_email === user.email);

        // Ordenar por fecha reciente
        userSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setMyRecordings(userSessions);
        speakText(`Cargadas ${userSessions.length} grabaciones.`);
      } catch (error) {
        console.error('Error al cargar grabaciones:', error);
        setErrorMsg('Error al obtener tus grabaciones.');
        speakText('Error al cargar tus grabaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      speakText("Eliminando grabación...");
      await sessionService.deleteSession(
        sessionToDelete.room_id || defaultRoomId,
        sessionToDelete.session_id,
        userEmail || sessionToDelete.creator_email
      );

      setMyRecordings(prev => prev.filter(s => s.session_id !== sessionToDelete.session_id));
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
        title="Mis Grabaciones"
        subtitle={`Usuario: ${userName}`}
        onBackClick={() => {
          speakText('Regresando al menú principal');
          navigate('/basico');
        }}
        backTitle="Volver al Menú"
        backSpeakText="Volver al menú principal"
        onLogoutClick={handleLogout}
      />

      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview basico-own-records-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
          <div className="subview-header basico-own-records-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 className="subview-title basico-own-records-title" style={{ width: '100%', textAlign: 'center', margin: 0 }}>Mis Grabaciones Guardadas</h3>
            {defaultRoomCode && (
              <span className="room-code-badge" style={{ display: 'inline-block', fontSize: '1.2rem', fontWeight: 'bold', color: '#4f46e5', background: '#f3f4f6', padding: '0.4rem 1rem', borderRadius: '12px', letterSpacing: '1px' }}>
                Código Sala: {defaultRoomCode}
              </span>
            )}
          </div>

          <div className="basico-own-records-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando grabaciones...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : myRecordings.length > 0 ? (
              <div className="accessible-list-grid basico-own-records-list" style={{ maxHeight: '100%', flex: 1 }}>
                {myRecordings.map(session => (
                  <div key={session.session_id} className="recording-item-row">
                    <button
                      className="btn-item-giant recording-item"
                      onClick={() => {
                        speakText(`Abriendo detalle de ${session.name}`);
                        navigate(`/basico/sala/${session.room_id || defaultRoomId}/sesion/${session.session_id}`, { state: { isEspectador: true } });
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
                No tienes grabaciones propias en el sistema.
              </div>
            )}
          </div>

          {/* Botones inferiores en paralelo */}
          <div className="subview-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%', gap: '2rem' }}>
            <button
              className="btn-back-giant"
              onClick={() => {
                speakText('Volviendo al menú principal');
                navigate('/basico');
              }}
              onFocus={() => speakText('Botón Volver')}
            >
              ← Volver
            </button>

            <button
              className="btn-waitlist-giant"
              onClick={() => {
                speakText('Abriendo lista de espera');
                navigate('/basico/ownRecords/waitlist', { state: { roomId: defaultRoomId } });
              }}
              onFocus={() => speakText('Botón Lista de espera')}
            >
              Lista de espera
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

export default BasicoOwnRecords;
