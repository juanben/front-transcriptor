import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './saveAudioRecord.css';

const SaveAudioRecord: React.FC = () => {
  const navigate = useNavigate();
  const { id, code } = useParams<{ id: string; code: string }>();
  const location = useLocation();
  const state = location.state as { audioURL?: string; recordingTime?: number; sessionName?: string } | null;

  const [comment, setComment] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handleSave = () => {
    // Aquí iría la lógica para enviar al backend (audioURL y comentario)
    console.log('Guardando audio en backend...', {
      audioURL: state.audioURL,
      duration: state.recordingTime,
      comment,
      sessionName: sessionName,
      roomCode: code,
      date: currentDate
    });
    setShowSuccessModal(true);
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

        <div className="form-actions">
          <button 
            className="btn-guardar" 
            onClick={handleSave}
          >
            Guardar
          </button>
          <button 
            className="btn-cancelar" 
            onClick={() => setShowCancelModal(true)}
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
