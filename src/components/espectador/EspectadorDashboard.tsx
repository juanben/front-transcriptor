import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../orador/OradorDashboard.css';
import RoomCard, { type Session } from '../common/RoomCard';
import UserMenu from '../common/UserMenu';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';

const EspectadorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [sessions, setSessions] = useState<Session[]>([]);
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
        const data = await roomService.getUserRooms(user.email);
        
        const mappedSessions: Session[] = data.rooms.map(room => ({
          id: room._id,
          title: room.name,
          date: room.created_at.split('T')[0]
        }));
        
        setSessions(mappedSessions);
      } catch (error) {
          if (error instanceof Error) 
            {
              setErrorMsg(error.message || 'Error al cargar las salas.');
            }
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  const handleJoinRoom = () => {
    setShowJoinModal(true);
  };

  const submitJoinRoom = () => {
    const code = joinCode.trim();
    if (code) {
      setSessions([...sessions, { id: code, title: `Sala unida (${code})`, date: new Date().toISOString().split('T')[0] }]);
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  const toggleSort = () => {
    setSortBy(prev => prev === 'recent' ? 'alphabetical' : 'recent');
  };

  const filteredSessions = sessions
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
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <h1 className="welcome-text">Bienvenido espectador</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <UserMenu />
          <button 
            className="btn-home-icon" 
            onClick={() => navigate('/home')} 
            title="Volver a Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="info-banner">
        <p>Aquí puedes ver las salas a las que te has unido</p>
      </div>
      
      <main className="dashboard-content">
        <div className="section-header">
          {!isSearching ? (
            <>
              <h2>Mis Salas</h2>
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
                placeholder="Buscar sesión por nombre..." 
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
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              Cargando salas...
            </p>
          ) : errorMsg ? (
            <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '2rem' }}>
              {errorMsg}
            </p>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <RoomCard
                key={session.id}
                session={session}
                isFirst={index === 0}
                onClick={() => navigate('/espectador/sala/' + session.id)}
                isEspectador={true}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
              No se encontraron salas.
            </p>
          )}
        </div>
      </main>

      <button 
        className="fab-button" 
        onClick={handleJoinRoom}
        title="Unirse a una sala"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
      </button>

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Unirse a una sala</h3>
            <p className="modal-text">Ingresa el código de acceso proporcionado por el orador para acceder a sus grabaciones.</p>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Ej. C7B-9P" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitJoinRoom()}
              autoFocus
            />
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

export default EspectadorDashboard;
