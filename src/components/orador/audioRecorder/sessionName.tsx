import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './sessionName.css';
import { sessionService } from '../../../services/session/sessionService';
import { userService } from '../../../services/user/userService';

const NuevaSesion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { isEdit?: boolean; sessionName?: string; sessionId?: string; roomCode?: string } | null;
    const { id } = useParams<{ id: string }>();
  const [sessionName, setSessionName] = useState('');
  const [roomCode, setRoomCode] = useState(state?.roomCode || '');

  useEffect(() => {
    if (state?.isEdit && state.sessionName) {
      setSessionName(state.sessionName);
    }
  }, [state]);

  useEffect(() => {
    if (roomCode || !id) {
      return;
    }

    const fetchRoomCode = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const user = await userService.getUserMe(token);
        const data = await sessionService.getSessionsByRoomId(id, user.email);
        setRoomCode(data.sessions[0]?.room_code || '');
      } catch (error) {
        console.error('No se pudo obtener el código de la sala:', error);
      }
    };

    fetchRoomCode();
  }, [id, navigate, roomCode]);

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
              const code = roomCode || id || '';
              navigate(`/sala/${id}/sesion/${code}/audio`, { state: { sessionName } });
            }}
            disabled={!roomCode && !id}
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
