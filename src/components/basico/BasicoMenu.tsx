import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import { sessionService, type Session } from '../../services/session/sessionService';
import BasicoOwnRecords from './BasicoOwnRecords';
import './BasicoMenu.css';

interface RoomItem {
  id: string;
  name: string;
  code: string;
}

const BasicoMenu: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Estados para vistas secundarias
  const [viewState, setViewState] = useState<'menu' | 'select-room' | 'my-recordings'>('menu');
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [myRecordings, setMyRecordings] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar información del usuario
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const user = await userService.getUserMe(token);
        setUserName(user.name);
        setUserEmail(user.email);
      } catch (error) {
        console.error('Error al cargar info del usuario:', error);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Función para leer texto en voz alta (accesibilidad)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Detener cualquier lectura previa
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleLogout = () => {
    speakText('Cerrando sesión');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goHome = () => {
    speakText('Volviendo a la pantalla principal');
    navigate('/home');
  };

  // Crear o recuperar la sala por defecto y navegar al grabador
  const handleStartRecordingClick = async () => {
    speakText('Iniciando grabación en sala por defecto.');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let roomData;
      try {
        roomData = await roomService.createDefaultRoom(userEmail);
      } catch (error) {
        console.log('La sala por defecto ya podría existir, intentando recuperar...', error);
        roomData = await roomService.getDefaultRoom(userEmail);
      }

      // Extraer el ID dependiendo de la estructura de respuesta (ej: roomData.room._id o roomData._id)
      const defaultRoomId = roomData?.room?._id || roomData?._id;
      const defaultRoomName = roomData?.room?.name || roomData?.name || 'Sala General';
      const defaultRoomCode = roomData?.room?.room_code || roomData?.room_code || '';

      if (!defaultRoomId) {
        throw new Error('No se pudo obtener el ID de la sala por defecto.');
      }

      speakText(`Abriendo grabador en ${defaultRoomName}.`);
      navigate(`/basico/grabar/${defaultRoomId}`, { state: { roomName: defaultRoomName, roomCode: defaultRoomCode } });
    } catch (error) {
      console.error('Error al iniciar grabación en sala por defecto:', error);
      setErrorMsg('Error al preparar la sala de grabación.');
      setIsLoading(false);
    }
  };

  const selectRoomForRecording = (room: RoomItem) => {
    speakText(`Sala seleccionada: ${room.name}. Abriendo grabador.`);
    navigate(`/basico/grabar/${room.id}`, { state: { roomName: room.name, roomCode: room.code } });
  };

  // Cargar grabaciones propias del usuario solo en la sala por defecto
  const handleMyRecordingsClick = async () => {
    speakText('Abriendo mis grabaciones.');
    setIsLoading(true);
    setErrorMsg(null);
    setViewState('my-recordings');

    try {
      // 1. Obtener la sala por defecto
      let defaultRoomData;
      try {
        defaultRoomData = await roomService.getDefaultRoom(userEmail);
      } catch (error) {
        defaultRoomData = await roomService.createDefaultRoom(userEmail);
      }

      const defaultRoomId = defaultRoomData?.room?._id || defaultRoomData?._id;

      if (!defaultRoomId) {
        setMyRecordings([]);
        return;
      }

      // 2. Traer sesiones de la sala por defecto
      const res = await sessionService.getSessionsByRoomId(defaultRoomId, userEmail);
      const allSessions = res.sessions || [];

      // 3. Filtrar las creadas por este usuario
      const userSessions = allSessions.filter(s => s.creator_email === userEmail);
      
      // Ordenar por fecha reciente
      userSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMyRecordings(userSessions);
    } catch (error) {
      console.error('Error al cargar grabaciones:', error);
      setErrorMsg('Error al obtener tus grabaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="basico-menu-screen">
      {/* Barra de menú superior extra ancha */}
      <header className="basico-header">
        <button 
          className="btn-header-large btn-header-home" 
          onClick={goHome}
          onFocus={() => speakText('Botón volver a inicio')}
          title="Volver a Inicio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Inicio</span>
        </button>

        <div className="basico-header-title">
          <h2>Modo Básico</h2>
          <span className="user-indicator">Bienvenido: {userName}</span>
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
      <main className="basico-menu-content">
        {viewState === 'menu' && (
          <div className="giant-buttons-grid">
            {/* BOTÓN 1: INICIAR GRABACIÓN */}
            <button 
              className="btn-giant btn-recording" 
              onClick={handleStartRecordingClick}
              onFocus={() => speakText('Iniciar Grabación')}
            >
              <div className="btn-giant-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              <span className="btn-giant-text">Iniciar Grabación</span>
            </button>

            {/* BOTÓN 2: VER SALAS */}
            <button 
              className="btn-giant btn-rooms" 
              onClick={() => {
                speakText('Abriendo lista de salas');
                navigate('/basico/salas');
              }}
              onFocus={() => speakText('Ver salas')}
            >
              <div className="btn-giant-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="btn-giant-text">Ver salas</span>
            </button>

            {/* BOTÓN 3: MIS GRABACIONES */}
            <button 
              className="btn-giant btn-history" 
              onClick={handleMyRecordingsClick}
              onFocus={() => speakText('Mis Grabaciones')}
            >
              <div className="btn-giant-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="10" cy="13" r="2" />
                  <path d="M12 13v5" />
                  <path d="M10 18h4" />
                </svg>
              </div>
              <span className="btn-giant-text">Mis Grabaciones</span>
            </button>
          </div>
        )}

        {/* SUB-VISTA: SELECCIONAR SALA */}
        {viewState === 'select-room' && (
          <div className="accessible-subview">
            <div className="subview-header">
              <button 
                className="btn-back-giant" 
                onClick={() => {
                  speakText('Volviendo al menú principal');
                  setViewState('menu');
                }}
                onFocus={() => speakText('Botón volver atrás')}
              >
                ← Volver al Menú
              </button>
              <h3 className="subview-title">¿En qué sala quieres grabar?</h3>
            </div>

            {isLoading ? (
              <div className="subview-message">Cargando salas...</div>
            ) : errorMsg ? (
              <div className="subview-message error">{errorMsg}</div>
            ) : rooms.length > 0 ? (
              <div className="accessible-list-grid">
                {rooms.map(room => (
                  <button 
                    key={room.id} 
                    className="btn-item-giant" 
                    onClick={() => selectRoomForRecording(room)}
                    onFocus={() => speakText(`Sala ${room.name}`)}
                  >
                    <span className="room-name">{room.name}</span>
                    <span className="room-code">Código: {room.code}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="subview-message">
                <p>No estás unido a ninguna sala activa.</p>
                <button 
                  className="btn-item-giant join-first" 
                  onClick={() => navigate('/basico/salas')}
                  onFocus={() => speakText('Unirse a una sala ahora')}
                  style={{ marginTop: '2rem' }}
                >
                  Unirse a una sala ahora
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUB-VISTA: MIS GRABACIONES */}
        {viewState === 'my-recordings' && (
          <BasicoOwnRecords
            myRecordings={myRecordings}
            isLoading={isLoading}
            errorMsg={errorMsg}
            onBack={() => {
              speakText('Volviendo al menú principal');
              setViewState('menu');
            }}
            speakText={speakText}
          />
        )}
      </main>
    </div>
  );
};

export default BasicoMenu;
