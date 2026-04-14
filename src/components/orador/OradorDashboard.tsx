import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OradorDashboard.css';
import RoomCard, { type Session } from '../common/RoomCard';
import UserMenu from '../common/UserMenu';
import { userService } from '../../services/user/userService';
import { roomService } from '../../services/room/roomService';

const OradorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  // Nuevo estado para ordenamiento
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

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
          date: room.created_at.split('T')[0] // Format: YYYY-MM-DD
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

  const handleEdit = (session: Session) => {
    navigate('/nueva-sesion', { state: { isEdit: true, sessionName: session.title, sessionId: session.id } });
  };

  const confirmDelete = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    setShowDeleteModal(null);
  };

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    setShowDeleteModal(id);
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
        // recent (por fecha descendente)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <h1 className="welcome-text">Bienvenido orador</h1>
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
        <p>Aqui puedes crear salas para ordenar tus grabaciones</p>
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
                openMenuId={openMenuId}
                onSetOpenMenuId={setOpenMenuId}
                onClick={() => navigate('/sala/' + session.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
        onClick={() => navigate('/new-room')}
        title="Crear nueva sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Eliminar sesión</h3>
            <p className="modal-text">¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={() => confirmDelete(showDeleteModal)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OradorDashboard;
