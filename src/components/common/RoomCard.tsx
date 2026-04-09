import React from 'react';
import './RoomCard.css';

export interface Session {
  id: string;
  title: string;
  date: string;
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
  return (
    <div className="session-card" onClick={onClick}>
      <div className="session-icon"></div>
      <div className="session-info">
        <h3>{session.title || 'Sin título'}</h3>
        <p className="session-date-text">Creada: {session.date}</p>
      </div>
      <div className="session-actions" style={{ position: 'relative' }}>
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