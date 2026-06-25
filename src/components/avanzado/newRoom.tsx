import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { roomService } from '../../services/room/roomService';
import { userService } from '../../services/user/userService';
import './newRoom.css';

const NuevaSesion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { isEdit?: boolean; sessionName?: string; sessionId?: string } | null;

  const [sessionName, setSessionName] = useState(state?.isEdit ? state?.sessionName || '' : '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await userService.getUserMe(token);
          setOwnerEmail(user.email);
        } catch {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const title = state?.isEdit ? 'Editar Colección' : 'Nueva Colección';

  const handleGuardar = async () => {
    if (!sessionName.trim()) {
      setErrorMessage('Por favor, ingresa el nombre de la colección.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (state?.isEdit && state.sessionId) {
        await roomService.updateRoomName(state.sessionId, {
          owner_email: ownerEmail,
          new_name: sessionName.trim()
        });
        navigate('/avanzado');
      } else {
        // Crear nueva colección
        await roomService.createRoom({
          name: sessionName.trim(),
          owner_email: ownerEmail,
          is_public: false,
          allow_download: true
        });
        navigate('/avanzado');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar la sala');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-session-screen">
      <h1 className="new-session-title">{title}</h1>

      <div className="new-session-form">
        <div className="input-group">
          <label htmlFor="materia">Nombre Colección</label>
          <input
            type="text"
            id="materia"
            placeholder="Ej. Colección de Matemáticas"
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
            onClick={() => navigate('/avanzado')}
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
