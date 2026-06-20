import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Session } from '../../services/session/sessionService';
import './BasicoOwnRecords.css';

interface BasicoOwnRecordsProps {
  myRecordings: Session[];
  isLoading: boolean;
  errorMsg: string | null;
  defaultRoomId: string;
  onBack: () => void;
  speakText: (text: string) => void;
}

const BasicoOwnRecords: React.FC<BasicoOwnRecordsProps> = ({
  myRecordings,
  isLoading,
  errorMsg,
  defaultRoomId,
  onBack,
  speakText
}) => {
  const navigate = useNavigate();

  return (
    <div className="accessible-subview basico-own-records-container">
      <div className="subview-header basico-own-records-header">
        <h3 className="subview-title basico-own-records-title">Mis Grabaciones Guardadas</h3>
      </div>

      <div className="basico-own-records-body">
        {isLoading ? (
          <div className="subview-message">Cargando grabaciones...</div>
        ) : errorMsg ? (
          <div className="subview-message error">{errorMsg}</div>
        ) : myRecordings.length > 0 ? (
          <div className="accessible-list-grid basico-own-records-list">
            {myRecordings.map(session => (
              <button
                key={session.session_id}
                className="btn-item-giant recording-item"
                onClick={() => {
                  speakText(`Abriendo detalle de ${session.name}`);
                  navigate(`/basico/sala/${session.room_id || defaultRoomId}/sesion/${session.session_id}`, { state: { isEspectador: true } });
                }}
                onFocus={() => {
                  const dateStr = session.created_at ? (session.created_at.includes('T') ? session.created_at.split('T')[0] : session.created_at.split(' ')[0]) : 'Fecha no disponible';
                  speakText(`Grabación ${session.name}, grabada el ${dateStr}`);
                }}
              >
                <div className="recording-details">
                  <span className="recording-name">{session.name}</span>
                  <span className="recording-date">
                    Fecha: {session.created_at ? (session.created_at.includes('T') ? session.created_at.split('T')[0] : session.created_at.split(' ')[0]) : 'Fecha no disponible'}
                  </span>
                  <span className="recording-status">Estado: {session.status === 'completed' ? 'Completado' : 'Procesando'}</span>
                </div>
                <div className="recording-action-icon">
                  {session.status === 'processing' || session.status === 'procesando' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-icon">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="subview-message">
            No tienes grabaciones propias en el sistema.
          </div>
        )}
      </div>

      {/* Botón Volver al Menú abajo y centrado */}
      <div className="subview-footer">
        <button
          className="btn-back-giant"
          onClick={() => {
            speakText('Volviendo al menú principal');
            onBack();
          }}
          onFocus={() => speakText('Botón regresar')}
        >
          ← Regresar
        </button>
      </div>
    </div>
  );
};

export default BasicoOwnRecords;
