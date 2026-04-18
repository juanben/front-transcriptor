import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../common/UserMenu';
import './OradorDashboard.css';
import './RoomSessions.css';
import './Waitlist.css';
import { roomService } from '../../services/room/roomService';
import { userService } from '../../services/user/userService';

interface WaitingUser {
  id: string;
  name: string;
  email: string;
}

const Waitlist: React.FC = () => {
  const navigate = useNavigate();
  const { id: roomId } = useParams<{ id: string }>();
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    const fetchWaitlist = async () => {
      if (!roomId) {
        setError('No se encontró el ID de la sala.');
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
        setOwnerEmail(user.email);
        
        const data = await roomService.getWaitlist(roomId, user.email);
        
        // Mapear los datos de respuesta a la estructura de WaitingUser
        // Asumimos que data puede ser un arreglo de strings (emails) o de objetos
        const waitlistData = data.waitlist || data; // Handle both cases just in case
        const mappedUsers: WaitingUser[] = Array.isArray(waitlistData) 
          ? waitlistData.map((item: unknown, index: number) => {
              if (typeof item === 'string') {
                return { id: String(index), name: item.split('@')[0], email: item };
              }
              const obj = item as Record<string, unknown>;
              return { 
                id: (obj.id as string) || (obj._id as string) || String(index), 
                name: (obj.name as string) || (obj.email as string)?.split('@')[0] || 'Usuario', 
                email: (obj.email as string) || '' 
              };
            }).filter(u => u.email)
          : [];
          
        setWaitingUsers(mappedUsers);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Error al cargar la lista de espera.');
        } else {
          setError('Error al cargar la lista de espera.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchWaitlist();
  }, [roomId, navigate]);

  const handleAdmitAll = async () => {
    if (!roomId || !ownerEmail) return;
    try {
      await roomService.acceptAllWaitlist(roomId, ownerEmail);
      setWaitingUsers([]);
      alert('Todos los usuarios han sido admitidos.');
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || 'Error al admitir a todos los usuarios.');
      } else {
        alert('Error al admitir a todos los usuarios.');
      }
    }
  };

  const handleAdmitUser = async (userId: string, userEmail: string) => {
    if (!roomId || !ownerEmail) return;
    try {
      await roomService.acceptWaitlistUser(roomId, ownerEmail, userEmail);
      setWaitingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || 'Error al admitir al usuario.');
      } else {
        alert('Error al admitir al usuario.');
      }
    }
  };

  return (
    <div className="dashboard-screen waitlist-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button 
            className="btn-back-text" 
            onClick={() => navigate(-1)} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserMenu />
            <button 
              className="btn-home-icon" 
              onClick={() => navigate('/home')} 
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="room-title-row" style={{ marginTop: '1rem' }}>
          <h2 className="room-title-text">Lista de Espera</h2>
          {waitingUsers.length > 0 && !isLoading && !error && (
            <button className="btn-admit-all" onClick={handleAdmitAll}>
              Admitir a todos
            </button>
          )}
        </div>
      </header>

      <main className="dashboard-content waitlist-content">
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {isLoading && <p style={{ textAlign: 'center' }}>Cargando lista de espera...</p>}
        
        {!isLoading && !error && (
          <div className="waitlist-container">
            {waitingUsers.length > 0 ? (
              waitingUsers.map(user => (
                <div key={user.id} className="waitlist-card">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                  <button className="btn-admit" onClick={() => handleAdmitUser(user.id, user.email)}>
                    Admitir
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-waitlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>No hay personas en la lista de espera actualmente.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Waitlist;
