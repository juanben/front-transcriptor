import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NuevaSesion.css';

const NuevaSesion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { isEdit?: boolean; sessionName?: string; sessionId?: string } | null;

  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    if (state?.isEdit && state.sessionName) {
      setSessionName(state.sessionName);
    }
  }, [state]);

  const title = state?.isEdit ? 'Editar Sesión' : 'Nueva Sesion';

  return (
    <div className="new-session-screen">
      <h1 className="new-session-title">{title}</h1>

      <div className="new-session-form">
        <div className="input-group">
          <label htmlFor="materia">Nombre Materia</label>
          <input 
            type="text" 
            id="materia" 
            placeholder="Materia" 
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button 
            className="btn-guardar" 
            onClick={() => navigate('/orador')}
          >
            Guardar
          </button>
          <button 
            className="btn-cancelar" 
            onClick={() => navigate('/orador')}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaSesion;