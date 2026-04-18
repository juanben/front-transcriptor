import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { sessionService } from '../../../services/session/sessionService';
import { userService } from '../../../services/user/userService';
import './saveAudioRecord.css';

const SaveAudioRecord: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { audioURL?: string; recordingTime?: number; sessionName?: string } | null;

  const [comment, setComment] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Nuevos estados para la integración
  const [allowDownload, setAllowDownload] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sessionName = state?.sessionName || 'Grabación';

  // Redirigir si no hay audio
  if (!state?.audioURL) {
    return (
      <div className="new-session-screen">
        <h1 className="new-session-title">No hay grabación activa</h1>
        <button className="btn-cancelar" onClick={() => navigate(`/sala/${id}`)}>Volver a la sala</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSave = async () => {
    if (!state?.audioURL || !id) return;
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      
      const user = await userService.getUserMe(token);
      
      const response = await fetch(state.audioURL);
      const blob = await response.blob();
      
      await sessionService.createSession({
        roomId: id,
        audioFile: blob,
        sessionName: sessionName,
        creatorEmail: user.email,
        allowDownload: allowDownload,
        visible: visible
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error al guardar grabación:', error);
      setErrorMsg(error.message || 'Error al guardar la grabación');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSave = () => {
    if (state.audioURL) {
      URL.revokeObjectURL(state.audioURL);
    }
    navigate(`/sala/${id}`);
  };

  const confirmCancel = () => {
    if (state.audioURL) {
      URL.revokeObjectURL(state.audioURL);
    }
    navigate(`/sala/${id}`);
  };

  return (
    <div className="new-session-screen">
      <h1 className="new-session-title">Guardar Grabación</h1>

      <div className="new-session-form">
        <div className="input-group">
          <label htmlFor="nombre">Nombre de la grabación</label>
          <input 
            type="text" 
            id="nombre" 
            value={sessionName}
            disabled
          />
        </div>

        <div className="input-group-row">
          <div className="input-group">
            <label htmlFor="fecha">Fecha</label>
            <input 
              type="text" 
              id="fecha" 
              value={currentDate}
              disabled
            />
          </div>

          <div className="input-group">
            <label htmlFor="duracion">Duración</label>
            <input 
              type="text" 
              id="duracion" 
              value={formatTime(state.recordingTime || 0)}
              disabled
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="comentario">Comentarios (Opcional)</label>
          <textarea 
            id="comentario" 
            placeholder="Añade un comentario sobre la grabación..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="input-group-row" style={{ marginTop: '1rem', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4b5563', fontWeight: '500' }}>
            <input 
              type="checkbox" 
              checked={allowDownload} 
              onChange={(e) => setAllowDownload(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            Permitir Descarga
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4b5563', fontWeight: '500' }}>
            <input 
              type="checkbox" 
              checked={visible} 
              onChange={(e) => setVisible(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            Visible
          </label>
        </div>

        {errorMsg && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button 
            className="btn-guardar" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            className="btn-cancelar" 
            onClick={() => setShowCancelModal(true)}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Cancelar grabación</h3>
            <p className="modal-text">¿Estás seguro de que deseas cancelar? Se borrará la grabación actual de forma permanente.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowCancelModal(false)}>Volver</button>
              <button className="btn-modal-submit" style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmCancel}>Descartar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">¡Grabación guardada!</h3>
            <p className="modal-text">La grabación se ha guardado correctamente y está disponible en la sala.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-modal-submit" onClick={completeSave}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveAudioRecord;
