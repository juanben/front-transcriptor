import React, { useEffect, useState } from 'react';
import './SessionCard.css';

export interface RecordingSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  isVisible: boolean;
  isProcessing?: boolean;
  isSharable?: boolean;
}

interface SessionCardProps {
  session: RecordingSession;
  onClickPlay?: () => void;
  onClick?: () => void;
  onComplementaryResource?: () => void;
  onToggleVisibility?: (id: string, newVisibility: boolean) => void | Promise<void>;
  onToggleShare?: (id: string, newShareable: boolean) => void | Promise<void>;
  onDelete?: (id: string) => void;
  isEspectador?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onClickPlay,
  onClick,
  onComplementaryResource,
  onToggleVisibility,
  onToggleShare,
  onDelete,
  isEspectador = false
}) => {
  const [isVisible, setIsVisible] = useState(session.isVisible);
  const [isSharable, setIsSharable] = useState(session.isSharable ?? false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);

  useEffect(() => {
    setIsVisible(session.isVisible);
  }, [session.isVisible]);

  useEffect(() => {
    setIsSharable(session.isSharable ?? false);
  }, [session.isSharable]);

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEspectador || isUpdatingVisibility) return;
    const newVisibility = !isVisible;
    try {
      setIsUpdatingVisibility(true);
      if (onToggleVisibility) {
        await onToggleVisibility(session.id, newVisibility);
      }
      setIsVisible(newVisibility);
    } catch {
      // The parent owns error reporting and keeps the previous value.
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleToggleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEspectador || isUpdatingShare) return;
    const newSharable = !isSharable;
    try {
      setIsUpdatingShare(true);
      if (onToggleShare) {
        await onToggleShare(session.id, newSharable);
      }
      setIsSharable(newSharable);
    } catch {
      // The parent owns error reporting and keeps the previous value.
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="recording-card" 
      onClick={handleCardClick} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role="button"
    >
      <div className="recording-icon-play" onClick={(e) => {
        e.stopPropagation();
        if (onClickPlay) onClickPlay();
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
      
      <div className="recording-info">
        <h3 className="recording-title">{session.title || 'Grabación sin título'}</h3>
        <p className="recording-meta">Fecha: {session.date} • Duración: {session.duration}</p>
      </div>

      <div className="recording-actions">
        <button 
          className="btn-resource" 
          onClick={(e) => {
            e.stopPropagation();
            if (onComplementaryResource) onComplementaryResource();
          }}
        >
          Recurso complementario
        </button>

        <div className="action-buttons-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
          {!isEspectador && (
            <>
              <button 
                className={`btn-visibility ${isSharable ? 'visible' : 'hidden'}`} 
                onClick={handleToggleShare}
                title={isSharable ? "No permitir compartir" : "Permitir compartir"}
                disabled={isUpdatingShare}
              >
                {isSharable ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Compartible</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>No compartible</span>
                  </>
                )}
              </button>

              <button 
                className={`btn-visibility ${isVisible ? 'visible' : 'hidden'}`} 
                onClick={handleToggleVisibility}
                title={isVisible ? "Hacer no visible" : "Hacer visible"}
                disabled={isUpdatingVisibility}
              >
                {isVisible ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                    <span>No visible</span>
                  </>
                )}
              </button>
            </>
          )}

          {onDelete && (
            <button 
              className="btn-visibility hidden" 
              style={{ color: '#ef4444' }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              title="Eliminar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
