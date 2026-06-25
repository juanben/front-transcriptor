import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BasicoMenu.css';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';

interface SessionItem {
  id: string;
  title: string;
  date: string;
  room_code: string;
  status?: string;
  isOwn?: boolean;
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
        speakText('Cargando tu biblioteca');

        // Obtener la sala por defecto para saber cuál excluir
        let defaultRoomId = '';
        try {
          const defaultRoomData = await roomService.getDefaultRoom(user.email);
          defaultRoomId = defaultRoomData?.room?._id || defaultRoomData?._id || '';
        } catch (err) {
          console.log('No default room found for this user yet.');
        }

        const [ownRoomsData, joinedRoomsData] = await Promise.all([
          roomService.getUserRooms(user.email),
          roomService.getPlayerRooms(user.email).catch(() => ({ rooms: [] }))
        ]);

        const filteredOwnRooms = ownRoomsData.rooms.filter(room => room._id !== defaultRoomId);

        const mappedOwnRooms: SessionItem[] = filteredOwnRooms.map(room => ({
          id: room._id,
          title: room.name,
          date: room.created_at.split('T')[0],
          room_code: room.room_code || '',
          isOwn: true
        }));

        const mappedJoinedRooms: SessionItem[] = joinedRoomsData.rooms.map(room => {
          const membershipStatus = room.membership_status ?? (room.is_waitlisted ? 'waitlist' : 'member');
          return {
            id: room._id,
            title: room.name,
            date: room.created_at.split('T')[0],
            room_code: room.room_code || '',
            status: membershipStatus === 'waitlist' ? 'En lista de espera' : 'Unido',
            isOwn: false
          };
        });

        const combined = [...mappedOwnRooms, ...mappedJoinedRooms];
        setSessions(combined);
        speakText(`Cargadas ${combined.length} Colecciones.`);
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
      <BasicoTopMenu
        title="Mi Biblioteca"
        subtitle={`Biblioteca de ${userName}`}
        onBackClick={() => {
          speakText('Volviendo al menú principal');
          navigate('/basico');
        }}
        backText="Inicio"
        backTitle="Volver al menu principal"
        backSpeakText="Botón volver al menu principal"
        onLogoutClick={handleLogout}
      />

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
                    className="btn-item-giant room-item-card"
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
                  >
                    <div className="room-info">
                      <span className="room-name">{session.title}</span>
                      <span className="room-code">Código: {session.room_code} {session.status ? `(${session.status})` : ''}</span>
                    </div>
                    <div className="room-icon-container">
                      {session.isOwn ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="room-type-icon own-room" title="Colección propia">
                          <circle cx="7.5" cy="15.5" r="5.5" />
                          <path d="m21 2-9.6 9.6" />
                          <path d="m15.5 7.5 3 3L22 7l-3-3" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="room-type-icon joined-room" title="Colección compartida">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="subview-message">
                  No haz agregado nínguna colección.
                </div>
              )}
            </div>
          </div>

          {/* Botones inferiores: Volver y Unirse a Sala */}
          <div className="subview-footer">
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
