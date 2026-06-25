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
        if (!roomId) {
          setMyRecordings([]);
          speakText('No se encontró una sala por defecto.');
          return;
        }
        setDefaultRoomId(roomId);

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
          <div className="subview-header basico-own-records-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
            <h3 className="subview-title basico-own-records-title" style={{ width: '100%', textAlign: 'center' }}>Mis Grabaciones Guardadas</h3>
          </div>

          <div className="basico-own-records-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando grabaciones...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : myRecordings.length > 0 ? (
              <div className="accessible-list-grid basico-own-records-list" style={{ maxHeight: '100%', flex: 1 }}>
                {myRecordings.map(session => (
                  <button
                    key={session.session_id}
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
                    <div className="recording-action-icon">
                      {session.status === 'processing' || session.status === 'procesando' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-icon">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                        </svg>
                      )}
                      <span className="recording-status">Estado: {session.status === 'completed' ? 'Completado' : 'Procesando'}</span>
                    </div>
                  </button>
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
    </div>
  );
};

export default BasicoOwnRecords;
