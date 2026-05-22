import React from 'react';
import './RoomCard.css';

export interface Session {
  id: string;
  title: string;
  date: string;
  status?: string;
  membership_status?: string;
  room_code?: string;
}

interface RoomCardProps {
  session: Session;
  isFirst: boolean;
  openMenuId?: string | null;
  onSetOpenMenuId?: (id: string | null) => void;
  onClick: () => void;
  onEdit?: (session: Session) => void;
  onDelete?: (id: string) => void;
  isEspectador?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  session, 
  isFirst, 
  openMenuId = null, 
  onSetOpenMenuId, 
  onClick, 
  onEdit, 
  onDelete,
  isEspectador = false
}) => {
  const isWaitlisted = session.membership_status === 'waitlist';

  return (
    <div 
      className={`session-card ${isWaitlisted ? 'waitlisted' : ''}`} 
      onClick={() => {
        if (!isWaitlisted) {
          onClick();
        }
      }}
    >
      <div className="session-icon"></div>
      <div className="session-info">
        <h3>{session.title || 'Sin título'}</h3>
        <p className="session-date-text">
          Creada: {session.date}
          {session.status && <span className="session-status"> | {session.status}</span>}
        </p>
        {session.room_code && (
          <p className="session-code-text" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
            Código: <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', letterSpacing: '1px' }}>{session.room_code}</span>
          </p>
        )}
      </div>
      <div className="session-actions" style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
        {onDelete && (
          <button 
            className="btn-action-icon"
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
            title={isEspectador ? "Salir de la sala" : "Eliminar sala"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
        {!isEspectador && onSetOpenMenuId && (
          <button 
            className="btn-dots" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onSetOpenMenuId(openMenuId === session.id ? null : session.id); 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        )}
        {!isEspectador && openMenuId === session.id && onEdit && onDelete && (
          <div className="dropdown-menu">
            <button onClick={(e) => { e.stopPropagation(); onEdit(session); }}>Editar</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="delete-option">Eliminar</button>
          </div>
        )}
        {isFirst && !isEspectador && (
          <button className="btn-bell" onClick={(e) => e.stopPropagation()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;