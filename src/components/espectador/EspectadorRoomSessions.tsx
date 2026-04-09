import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionCard, { type RecordingSession } from '../common/SessionCard';
import '../orador/OradorDashboard.css';
import '../orador/RoomSessions.css';

const mockSessions: RecordingSession[] = [
  { id: '1', title: 'Clase de Introducción', date: '2026-04-07', duration: '45:00', isVisible: true, isSharable: true },
  { id: '4', title: 'Reunión Semanal', date: '2026-04-05', duration: '1:15:00', isVisible: true, isSharable: true },
];

const EspectadorRoomSessions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<RecordingSession[]>(mockSessions);
  const [searchQuery, setSearchQuery] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState<string | null>(null);
  const [resourceLink, setResourceLink] = useState('');

  // En la vista de espectador solo se muestran las sesiones que están visibles
  const filteredSessions = sessions.filter(session => 
    session.isVisible && session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = () => {
    if (showDeleteModal) {
      setSessions(sessions.filter(s => s.id !== showDeleteModal));
      setShowDeleteModal(null);
    }
  };

  const openResourceModal = (sessionId: string) => {
    setShowResourceModal(sessionId);
    setResourceLink('https://drive.google.com/ejemplo'); // Mock pre-populated link for spectator
  };

  return (
    <div className="dashboard-screen room-sessions-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button 
            className="btn-back-text" 
            onClick={() => navigate('/espectador')} 
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
          <h2 className="room-title-text">Sala {id}</h2>
        </div>
      </header>

      <main className="dashboard-content room-content-main">
        <div className="search-bar-container" style={{ margin: '1rem 0' }}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar grabaciones por nombre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.4)', backgroundColor: '#fff', fontSize: '1rem' }}
          />
        </div>

        <div className="sessions-list" style={{ marginTop: '1rem' }}>
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onClickPlay={() => navigate(`/sala/${id}/sesion/${session.id}`)}
                onComplementaryResource={() => openResourceModal(session.id)}
                onDelete={(sessionId) => setShowDeleteModal(sessionId)}
                isEspectador={true}
              />
            ))
          ) : (
            <p className="empty-state-text">
              {searchQuery ? "No se encontraron grabaciones con ese nombre." : "No hay grabaciones disponibles en esta sala."}
            </p>
          )}
        </div>
      </main>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Ocultar grabación</h3>
            <p className="modal-text">¿Estás seguro de que deseas ocultar esta grabación de tu vista? No podrás volver a verla a menos que te unas a la sala de nuevo.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(null)}>Cancelar</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmDelete}>Ocultar</button>
            </div>
          </div>
        </div>
      )}

      {showResourceModal && (
        <div className="modal-overlay" onClick={() => setShowResourceModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Recurso Complementario</h3>
            <p className="modal-text">Material adjunto para esta grabación proporcionado por el orador.</p>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Enlace no disponible" 
              value={resourceLink}
              readOnly
              style={{ textTransform: 'none', backgroundColor: '#f3f4f6', cursor: 'text' }}
            />
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowResourceModal(null)}>Cerrar</button>
              <button className="btn-modal-submit" onClick={() => { if(resourceLink) window.open(resourceLink, '_blank') }}>Abrir Enlace</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspectadorRoomSessions;
