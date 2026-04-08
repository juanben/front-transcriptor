import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionCard, { type RecordingSession } from '../common/SessionCard';
import './OradorDashboard.css';
import './RoomSessions.css';

const mockSessions: RecordingSession[] = [
  { id: '1', title: 'Clase de Introducción', date: '2026-04-07', duration: '45:00', isVisible: true, isProcessing: false},
  { id: '2', title: 'Entrevista de Usuario', date: '2026-04-06', duration: '30:20', isVisible: false, isProcessing: true },
  { id: '3', title: 'Grabación en curso', date: '2026-04-08', duration: '12:05', isVisible: false, isProcessing: true },
  { id: '4', title: 'Reunión Semanal', date: '2026-04-05', duration: '1:15:00', isVisible: true, isProcessing: true },
];

const RoomSessions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<RecordingSession[]>(mockSessions);
  const [activeTab, setActiveTab] = useState<'Todos' | 'Publicado' | 'Invisible' | 'Procesando'>('Todos');

  const filteredSessions = sessions.filter(session => {
    switch (activeTab) {
      case 'Publicado': return session.isVisible && !session.isProcessing;
      case 'Invisible': return !session.isVisible && !session.isProcessing;
      case 'Procesando': return session.isProcessing;
      default: return true; // 'Todos'
    }
  });

  const handleToggleVisibility = (id: string, newVisibility: boolean) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isVisible: newVisibility } : s));
  };

  return (
    <div className="dashboard-screen room-sessions-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button 
            className="btn-back-text" 
            onClick={() => navigate('/orador')} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
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

        <div className="room-title-row">
          <h2 className="room-title-text">Reunion</h2>
          <button className="btn-waitlist" onClick={() => navigate(`/sala/${id || 'default'}/lista-espera`)}>Lista de espera</button>
        </div>

        <div className="room-code-display">
          Código: X7B - 9P
        </div>
      </header>

      <main className="dashboard-content room-content-main">
        <div className="new-recording-section">
          <button 
            className="btn-new-recording"
            onClick={() => navigate('/testRec')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            Nueva Grabación
          </button>
        </div>

        <div className="divider-dashed"></div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'Todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('Todos')}
          >Todos</button>
          <button 
            className={`tab-btn ${activeTab === 'Publicado' ? 'active' : ''}`}
            onClick={() => setActiveTab('Publicado')}
          >Publicado</button>
          <button 
            className={`tab-btn ${activeTab === 'Invisible' ? 'active' : ''}`}
            onClick={() => setActiveTab('Invisible')}
          >Invisible</button>
          <button 
            className={`tab-btn ${activeTab === 'Procesando' ? 'active' : ''}`}
            onClick={() => setActiveTab('Procesando')}
          >Procesando</button>
        </div>

        <div className="sessions-list">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onClickPlay={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onComplementaryResource={() => console.log('Recurso complementario para', session.title)}
                onToggleVisibility={handleToggleVisibility}
              />
            ))
          ) : (
            <p className="empty-state-text">
              No hay grabaciones en esta categoría.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomSessions;