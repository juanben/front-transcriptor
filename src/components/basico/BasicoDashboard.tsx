import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BasicoMenu.css';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';

interface SessionItem {
  id: string;
  title: string;
  date: string;
  room_code: string;
  status?: string;
}

const BasicoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = useBasicoLogout();
  const [userName, setUserName] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');


  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const user = await userService.getUserMe(token);
        setUserName(user.name || user.email);
        speakText('Cargando tus Biblioteca');

        // Obtener la sala por defecto para saber cuál excluir
        let defaultRoomId = '';
        try {
          const defaultRoomData = await roomService.getDefaultRoom(user.email);
          defaultRoomId = defaultRoomData?.room?._id || defaultRoomData?._id || '';
        } catch (err) {
          console.log('No default room found for this user yet.');
        }

        const data = await roomService.getUserRooms(user.email);

        const filteredRooms = data.rooms.filter(room => room._id !== defaultRoomId);

        const mappedSessions: SessionItem[] = filteredRooms.map(room => ({
          id: room._id,
          title: room.name,
          date: room.created_at.split('T')[0],
          room_code: room.room_code || ''
        }));

        setSessions(mappedSessions);
        speakText(`Cargadas ${mappedSessions.length} Colecciones.`);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMsg(error.message || 'Error al cargar Colecciones.');
          speakText('Error al cargar las Colecciones');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);



  const toggleSort = () => {
    const nextSort = sortBy === 'recent' ? 'alphabetical' : 'recent';
    setSortBy(nextSort);
    speakText(`Ordenando por ${nextSort === 'recent' ? 'más recientes' : 'orden alfabético'}`);
  };



  const filteredSessions = sessions
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  return (
    <div className="basico-menu-screen">
      {/* Barra de menú superior extra ancha */}
      <header className="basico-header">
        <button
          className="btn-header-large btn-header-home"
          onClick={() => {
            speakText('Volviendo al menú principal');
            navigate('/basico');
          }}
          onFocus={() => speakText('Botón volver al menu principal')}
          title="Volver al menu principal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Inicio</span>
        </button>

        <div className="basico-header-title">
          <h2>Mi Biblioteca</h2>
          <span className="user-indicator">Biblioteca de {userName}</span>
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

      <main className="basico-menu-content" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <div className="accessible-subview" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>

          {/* Fila de búsqueda y ordenación accesible */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', width: '100%', marginBottom: '0.5rem' }}>
            <h3 className="subview-title" style={{ margin: 0, fontSize: '1.6rem' }}>Colecciones</h3>
            <button
              className="btn-back-giant"
              onClick={toggleSort}
              onFocus={() => speakText(`Botón ordenar colecciones. Actual: ${sortBy === 'recent' ? 'más recientes' : 'orden alfabético'}`)}
              style={{ padding: '0.8rem 1.6rem', fontSize: '1.1rem', borderRadius: '12px', minWidth: 'auto', backgroundColor: '#e5e7eb', color: '#111827' }}
            >
              Ordenar: {sortBy === 'recent' ? 'Recientes' : 'A-Z'}
            </button>
          </div>

          {/* Listado de salas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div className="accessible-list-grid" style={{ maxHeight: '100%', flex: 1 }}>
              {isLoading ? (
                <div className="subview-message">Cargando Colecciones...</div>
              ) : errorMsg ? (
                <div className="subview-message error">{errorMsg}</div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map(session => (
                  <button
                    key={session.id}
                    className="btn-item-giant"
                    onClick={() => {
                      if (session.status === 'En lista de espera') {
                        speakText('Coleccion en lista de espera. El moderador debe aceptarte.');
                        alert('Esta coleccion está en lista de espera. El moderador de la coleccion debe aceptarte.');
                      } else {
                        speakText(`Abriendo coleccion ${session.title}`);
                        navigate('/basico/sala/' + session.id);
                      }
                    }}
                    onFocus={() => speakText(`Coleccion ${session.title}. Código ${session.room_code} ${session.status ? `, Estado: ${session.status}` : ''}`)}
                    style={{ width: '100%' }}
                  >
                    <span className="room-name">{session.title}</span>
                    <span className="room-code">Código: {session.room_code} {session.status ? `(${session.status})` : ''}</span>
                  </button>
                ))
              ) : (
                <div className="subview-message">
                  No estás unido a ninguna sala activa.
                </div>
              )}
            </div>
          </div>

          {/* Botones inferiores: Regresar y Unirse a Sala */}
          <div className="subview-footer">
            <button
              className="btn-back-giant"
              onClick={() => {
                speakText('Volviendo al menú principal');
                navigate('/basico');
              }}
              onFocus={() => speakText('Botón regresar')}
            >
              ← Regresar
            </button>

            <button
              className="btn-join-giant"
              onClick={() => {
                speakText('Abriendo pantalla para agregar coleccion');
                navigate('/basico/unirse');
              }}
              onFocus={() => speakText('Botón para agregar coleccion')}
            >
              + Agregar Colección
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BasicoDashboard;
