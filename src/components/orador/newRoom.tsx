import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { roomService } from '../../services/room/roomService';
import { userService } from '../../services/user/userService';
import './newRoom.css';

const NuevaSesion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { isEdit?: boolean; sessionName?: string; sessionId?: string } | null;

  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  useEffect(() => {
    if (state?.isEdit && state.sessionName) {
      setSessionName(state.sessionName);
    }

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await userService.getUserMe(token);
          setOwnerEmail(user.email);
        } catch (error) {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    fetchUser();
  }, [state, navigate]);

  const title = state?.isEdit ? 'Editar Sala' : 'Nueva Sala';

  const handleGuardar = async () => {
    if (!sessionName.trim()) {
      setErrorMessage('Por favor, ingresa el nombre de la sala.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (state?.isEdit && state.sessionId) {
        // En el futuro, aquí iría la lógica para editar la sala:
        // await roomService.updateRoom(state.sessionId, { ... })
        navigate('/orador');
      } else {
        // Crear nueva sala
        await roomService.createRoom({
          name: sessionName.trim(),
          owner_email: ownerEmail,
          is_public: false,
          allow_download: true
        });
        navigate('/orador');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al guardar la sala');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-session-screen">
      <h1 className="new-session-title">{title}</h1>

      <div className="new-session-form">
        <div className="input-group">
          <label htmlFor="materia">Nombre Sala</label>
          <input 
            type="text" 
            id="materia" 
            placeholder="Ej. Sala de Matemáticas" 
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        {errorMessage && (
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}

        <div className="form-actions">
          <button 
            className="btn-guardar" 
            onClick={handleGuardar}
            disabled={isLoading || !ownerEmail}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            className="btn-cancelar" 
            onClick={() => navigate('/orador')}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaSesion;
