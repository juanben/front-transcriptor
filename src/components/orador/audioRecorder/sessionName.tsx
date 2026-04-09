import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './sessionName.css';

const NuevaSesion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { isEdit?: boolean; sessionName?: string; sessionId?: string } | null;
    const { id } = useParams<{ id: string }>();
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    if (state?.isEdit && state.sessionName) {
      setSessionName(state.sessionName);
    }
  }, [state]);

  const title = state?.isEdit ? 'Editar Sesión' : 'Nueva Sesión';

  return (
    <div className="new-session-screen">
      <h1 className="new-session-title">{title}</h1>

      <div className="new-session-form">
        <div className="input-group">
          <label htmlFor="materia">Nombre sesión</label>
          <input 
            type="text" 
            id="materia" 
            placeholder="Grabación" 
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button 
            className="btn-guardar" 
            onClick={() => {
              const code = 'C7B-9P'; // Hardcoded for now
              navigate(`/sala/${id}/sesion/${code}/audio`, { state: { sessionName } });
            }}
          >
            Guardar
          </button>
          <button 
            className="btn-cancelar" 
            onClick={() => navigate(`/sala/${id}`)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaSesion;