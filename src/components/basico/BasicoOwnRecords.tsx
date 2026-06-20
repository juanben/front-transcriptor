import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Session } from '../../services/session/sessionService';

interface BasicoOwnRecordsProps {
  myRecordings: Session[];
  isLoading: boolean;
  errorMsg: string | null;
  onBack: () => void;
  speakText: (text: string) => void;
}

const BasicoOwnRecords: React.FC<BasicoOwnRecordsProps> = ({
  myRecordings,
  isLoading,
  errorMsg,
  onBack,
  speakText
}) => {
  const navigate = useNavigate();

  return (
    <div className="accessible-subview" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      <div className="subview-header" style={{ alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
        <h3 className="subview-title" style={{ width: '100%', textAlign: 'center' }}>Mis Grabaciones Guardadas</h3>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', minHeight: 0 }}>
        {isLoading ? (
          <div className="subview-message">Cargando grabaciones...</div>
        ) : errorMsg ? (
          <div className="subview-message error">{errorMsg}</div>
        ) : myRecordings.length > 0 ? (
          <div className="accessible-list-grid" style={{ maxHeight: '100%', flex: 1 }}>
            {myRecordings.map(session => (
              <button
                key={session.session_id}
                className="btn-item-giant recording-item"
                onClick={() => {
                  speakText(`Abriendo detalle de ${session.name}`);
                  navigate(`/basico/sala/${session.room_id}/sesion/${session.session_id}`, { state: { isEspectador: true } });
                }}
                onFocus={() => speakText(`Grabación ${session.name}, grabada el ${session.created_at.split('T')[0]}`)}
              >
                <div className="recording-details">
                  <span className="recording-name">{session.name}</span>
                  <span className="recording-date">Fecha: {session.created_at.split('T')[0]}</span>
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
