import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AvanzadoDashboard.css';
import RoomCard, { type Session } from '../common/RoomCard';
import AvanzadoTopBar from '../common/AvanzadoTopBar/AvanzadoTopBar';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';
import type { Room } from '../../types/rooms';

const mapJoinedRoomToSession = (room: Room): Session => {
  const membershipStatus = room.membership_status ?? (room.is_waitlisted ? 'waitlist' : 'member');

  return {
    id: room._id,
    title: room.name,
    date: room.created_at.split('T')[0],
    status: membershipStatus === 'waitlist' ? 'En lista de espera' : 'Unido',
    membership_status: membershipStatus,
    room_code: room.room_code
  };
};

const AvanzadoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<Session | null>(null);

  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

  const [activeTab, setActiveTab] = useState<'my-rooms' | 'joined-rooms'>('my-rooms');
  const [joinedSessions, setJoinedSessions] = useState<Session[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const user = await userService.getUserMe(token);
        setOwnerEmail(user.email);

        const [userData, playerRoomsData] = await Promise.all([
          roomService.getUserRooms(user.email),
          roomService.getPlayerRooms(user.email)
        ]);

        const mappedSessions: Session[] = userData.rooms.map(room => ({
          id: room._id,
          title: room.name,
          date: room.created_at.split('T')[0], // Format: YYYY-MM-DD
          room_code: room.room_code
        }));

        const mappedJoinedSessions: Session[] = playerRoomsData.rooms.map(mapJoinedRoomToSession);

        setSessions(mappedSessions);
        setJoinedSessions(mappedJoinedSessions);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMsg(error.message || 'Error al cargar las colecciones.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  const handleEdit = (session: Session) => {
    navigate('/new-room', { state: { isEdit: true, sessionName: session.title, sessionId: session.id } });
  };

  const confirmDelete = async (id: string) => {
    try {
      await roomService.deleteRoom(id, ownerEmail);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Error al eliminar la sala');
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    setShowDeleteModal(id);
  };

  const handleLeave = (id: string) => {
    const session = joinedSessions.find(joinedSession => joinedSession.id === id);
    if (session) {
      setShowLeaveModal(session);
    }
  };

  const confirmLeave = async () => {
    if (!showLeaveModal) return;

    try {
      if (showLeaveModal.membership_status === 'waitlist') {
        await roomService.leaveWaitlist(showLeaveModal.id, ownerEmail);
      } else {
        await roomService.leaveRoom(showLeaveModal.id, ownerEmail);
      }

      setJoinedSessions(joinedSessions.filter(session => session.id !== showLeaveModal.id));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Error al salir de la sala');
    } finally {
      setShowLeaveModal(null);
    }
  };

  const handleJoinRoom = () => {
    setJoinError(null);
    setJoinCode('');
    setShowJoinModal(true);
  };

  const submitJoinRoom = async () => {
    const code = joinCode.trim();
    if (code) {
      if (joinedSessions.some(session => session.room_code === code)) {
        alert('Ya te has unido o estás en lista de espera para esta sala.');
        return;
      }
      if (sessions.some(session => session.room_code === code)) {
        alert('No puedes unirte a tu propia sala.');
        return;
      }

      try {
        await roomService.joinWaitlist(code, ownerEmail);
        const playerRoomsData = await roomService.getPlayerRooms(ownerEmail);
        setJoinedSessions(playerRoomsData.rooms.map(mapJoinedRoomToSession));
        setShowJoinModal(false);
        setJoinCode('');
        setActiveTab('joined-rooms');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al unirse a la sala');
      }
    }
  };

  const toggleSort = () => {
    setSortBy(prev => prev === 'recent' ? 'alphabetical' : 'recent');
  };

  const currentSessionsList = activeTab === 'my-rooms' ? sessions : joinedSessions;

  const filteredSessions = currentSessionsList
    .filter(session => {
      if (isSearching && searchQuery) {
        return session.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else {
        // recent (por fecha descendente)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  return (
    <div className="dashboard-screen">
      <AvanzadoTopBar />

      <div className="info-banner">
        <p>Aquí puedes crear colecciones para ordenar tus grabaciones o unirte a otras</p>
      </div>

      <main className="dashboard-content">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'my-rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-rooms')}
          >
            Mi biblioteca
          </button>
          <button
            className={`tab-btn ${activeTab === 'joined-rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('joined-rooms')}
          >
            Compartidas conmigo
          </button>
        </div>

        <div className="section-header">
          {!isSearching ? (
            <>
              {/* <h2>{activeTab === 'my-rooms' ? 'Mis Colecciones' : 'Colecciones de amigos'}</h2> */}
              <span className="avanzado-subtitle-text">
                {activeTab === 'my-rooms' ? 'Mi biblioteca' : 'Compartidas'}
              </span>
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
                placeholder="Buscar colección por nombre..."
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

        <div className="sort-section" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn-sort" onClick={toggleSort}>
            Ordenar por: {sortBy === 'recent' ? 'Más recientes' : 'Alfabético'}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="14" y2="12"></line>
              <line x1="4" y1="18" x2="8" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sessions-list">
          {isLoading && activeTab === 'my-rooms' ? (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              Cargando Colecciones...
            </p>
          ) : errorMsg && activeTab === 'my-rooms' ? (
            <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '2rem' }}>
              {errorMsg}
            </p>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <RoomCard
                key={session.id}
                session={session}
                isFirst={index === -1}
                openMenuId={openMenuId}
                onSetOpenMenuId={setOpenMenuId}
                onClick={() => activeTab === 'my-rooms'
                  ? navigate('/sala/' + session.id)
                  : navigate('/sala-unida/' + session.id)
                }
                onEdit={activeTab === 'my-rooms' ? handleEdit : undefined}
                onDelete={activeTab === 'my-rooms' ? handleDelete : handleLeave}
                isEspectador={activeTab === 'joined-rooms'}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              {activeTab === 'my-rooms'
                ? 'No se encontraron Colecciones.'
                : 'No te has unido a ninguna Colección aún.'}
            </p>
          )}
        </div>
      </main>

      {activeTab === 'my-rooms' ? (
        <button
          className="fab-button"
          onClick={() => navigate('/new-room')}
          title="Crear nueva colección"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      ) : (
        <button
          className="fab-button"
          onClick={handleJoinRoom}
          title="Unirse a una colección"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
        </button>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Eliminar colección</h3>
            <p className="modal-text">¿Estás seguro de que deseas eliminar esta colección? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={() => confirmDelete(showDeleteModal)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Salir de la sala</h3>
            <p className="modal-text">
              {showLeaveModal.membership_status === 'waitlist'
                ? '¿Estás seguro de que deseas salir de la lista de espera de esta sala?'
                : '¿Estás seguro de que deseas salir de esta sala?'}
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLeaveModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmLeave}>Salir</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Unirse a una sala</h3>
            <p className="modal-text">Ingresa el código de acceso proporcionado para unirte a la sala.</p>
            <input
              type="text"
              className={`modal-input ${joinError ? 'error' : ''}`}
              placeholder="Ej. C7B-9P"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value); setJoinError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && submitJoinRoom()}
              autoFocus
            />
            {joinError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0.5rem 0 0 0', textAlign: 'left' }}>{joinError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowJoinModal(false)}>Cancelar</button>
              <button className="btn-modal-submit" onClick={submitJoinRoom}>Unirme</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvanzadoDashboard;
