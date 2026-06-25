import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import './BasicoMenu.css';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';

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
  const [viewState, setViewState] = useState<'menu' | 'select-room'>('menu');
  const [rooms] = useState<RoomItem[]>([]);
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
  const handleLogout = useBasicoLogout();


  const goHome = () => {
    speakText('Volviendo a la pantalla principal');
    navigate('/basico');
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
      navigate(`/basico/grabar/${defaultRoomId}`, { state: { roomName: defaultRoomName, roomCode: defaultRoomCode, autoStart: true } });
    } catch (error) {
      console.error('Error al iniciar grabación en sala por defecto:', error);
      setErrorMsg('Error al preparar la sala de grabación.');
      setIsLoading(false);
    }
  };

  const selectRoomForRecording = (room: RoomItem) => {
    speakText(`Sala seleccionada: ${room.name}. Abriendo grabador.`);
    navigate(`/basico/grabar/${room.id}`, { state: { roomName: room.name, roomCode: room.code, autoStart: true } });
  };



  return (
    <div className="basico-menu-screen">
      <BasicoTopMenu
        title="Modo Básico"
        subtitle={`Bienvenido: ${userName}`}
        onBackClick={goHome}
        backText="Inicio"
        backTitle="Volver a Inicio"
        backSpeakText="Botón volver a inicio"
        onLogoutClick={handleLogout}
      />

      {/* Contenedor Principal */}
      <main
        className="basico-menu-content"
        style={viewState !== 'menu' ? { overflow: 'hidden', width: '100%', height: '100%' } : undefined}
      >
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
                speakText('Abriendo biblioteca');
                navigate('/basico/salas');
              }}
              onFocus={() => speakText('Mi Biblioteca')}
            >
              <div className="btn-giant-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="btn-giant-text">Mi Biblioteca</span>
            </button>

            {/* BOTÓN 3: MIS GRABACIONES */}
            <button
              className="btn-giant btn-history"
              onClick={() => {
                speakText('Abriendo mis grabaciones.');
                navigate('/basico/ownRecords');
              }}
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

            <button
              className="btn-giant btn-history"
              onClick={() => {
                speakText('Cambiando a modo avanzado.');
                navigate('/avanzado');
              }}
              onFocus={() => speakText('Cambiando a modo avanzado.')}
            >
              <div className="btn-giant-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </div>
              <span className="btn-giant-text">Modo Avanzado</span>
            </button>
          </div>

        )}


      </main>
    </div>
  );
};

export default BasicoMenu;
