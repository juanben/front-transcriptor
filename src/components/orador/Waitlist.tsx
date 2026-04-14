import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../common/UserMenu';
import './OradorDashboard.css';
import './RoomSessions.css';
import './Waitlist.css';

interface WaitingUser {
  id: string;
  name: string;
  email: string;
}

const mockWaitlist: WaitingUser[] = [
  { id: '1', name: 'Ana García', email: 'ana.garcia@ejemplo.com' },
  { id: '2', name: 'Carlos López', email: 'carlos.l@ejemplo.com' },
  { id: '3', name: 'María Fernández', email: 'maria.f@ejemplo.com' },
];

const Waitlist: React.FC = () => {
  const navigate = useNavigate();
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>(mockWaitlist);

  const handleAdmitAll = () => {
    // Lógica para admitir a todos
    setWaitingUsers([]);
  };

  const handleAdmitUser = (userId: string) => {
    // Lógica para admitir a un usuario individual
    setWaitingUsers(prev => prev.filter(user => user.id !== userId));
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
          {waitingUsers.length > 0 && (
            <button className="btn-admit-all" onClick={handleAdmitAll}>
              Admitir a todos
            </button>
          )}
        </div>
      </header>

      <main className="dashboard-content waitlist-content">
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
                <button className="btn-admit" onClick={() => handleAdmitUser(user.id)}>
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
      </main>
    </div>
  );
};

export default Waitlist;