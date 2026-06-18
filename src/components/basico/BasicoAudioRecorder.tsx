import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../../services/user/userService';
import { sessionService } from '../../services/session/sessionService';
import './BasicoAudioRecorder.css';

const BasicoAudioRecorder: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener nombre y código de la sala si se pasaron por el estado de navegación
  const locationState = location.state as { roomName?: string; roomCode?: string };
  const roomName = locationState?.roomName || 'Sala';
  const roomCode = locationState?.roomCode || '';

  const [userEmail, setUserEmail] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Obtener información del usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const user = await userService.getUserMe(token);
        setUserEmail(user.email);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        navigate('/login');
      }
    };
    fetchUser();

    // Limpiar al desmontar
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate]);

  // Auto-iniciar grabación si se pasa el flag autoStart (desde la cuenta regresiva de BasicoSession)
  useEffect(() => {
    if (locationState?.autoStart && userEmail) {
      const t = setTimeout(() => {
        startRecording();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [locationState?.autoStart, userEmail]);

  // Síntesis de voz para accesibilidad
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Formatear segundos en MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioURL('');
    setAudioBlob(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);

        // Apagar micrófono
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      speakText('Grabación iniciada');

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error de micrófono:', err);
      setErrorMsg('No se pudo acceder al micrófono. Por favor, concede los permisos en tu navegador.');
      speakText('Error. No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      speakText('Grabación detenida');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSave = async () => {
    if (!audioBlob || !roomId || !userEmail) return;

    setIsSaving(true);
    setErrorMsg(null);
    speakText('Guardando grabación, por favor espera.');

    try {
      const dateStr = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const autoSessionName = `Grabación Básica - ${dateStr}`;

      await sessionService.createSession({
        roomId: roomId,
        audioFile: audioBlob,
        sessionName: autoSessionName,
        creatorEmail: userEmail,
        allowDownload: true,
        visible: true
      });

      speakText('Grabación guardada con éxito.');
      alert('Grabación guardada correctamente.');

      // Limpiar URL
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }

      // Volver a la pantalla de la sala
      navigate(`/basico`);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      setErrorMsg('No se pudo guardar la grabación en el servidor.');
      speakText('Error al guardar la grabación.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    speakText('¿Descartar grabación?');
    setShowDiscardModal(true);
  };

  const confirmDiscard = () => {
    speakText('Grabación descartada');
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL('');
    setAudioBlob(null);
    setRecordingTime(0);
    setShowDiscardModal(false);
  };

  const cancelDiscard = () => {
    speakText('Volviendo');
    setShowDiscardModal(false);
  };

  const goHome = () => {
    if (isRecording) stopRecording();
    speakText('Volviendo a la pantalla principal');
    navigate('/basico');
  };

  const handleLogout = () => {
    if (isRecording) stopRecording();
    speakText('Cerrando sesión');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCancelBack = () => {
    if (isRecording) {
      stopRecording();
    }
    speakText('Cancelando grabación. Volviendo al menú.');
    navigate(`/basico`);
  };

  return (
    <div className="basico-recorder-screen">
      {/* Barra de menú superior extra ancha (estilo BasicoMenu) */}
      <header className="basico-header">
        <button
          className="btn-header-large btn-header-home"
          onClick={handleCancelBack}
          onFocus={() => speakText('Volver al menú básico')}
          title="Volver al Menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Atrás</span>
        </button>

        <div className="basico-header-title">
          <h2>Grabar</h2>
          <span className="user-indicator">
            {roomName}
          </span>
        </div>

        <button
          className="btn-header-large btn-header-logout"
          onClick={handleLogout}
          onFocus={() => speakText('Botón cerrar sesión')}
          title="Cerrar Sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Salir</span>
        </button>
      </header>
      <div className="basico-recorder-conten">
        <span className="access-code-label">Código de Acceso:</span>
        <span className="access-code-value">{roomCode}</span>
      </div>
      <main className="basico-recorder-content">
 

        {errorMsg && <div className="recorder-error-banner">{errorMsg}</div>}

        {/* FASE 1: NO GRABANDO Y SIN AUDIO GUARDADO */}
        {!isRecording && !audioURL && (
          <div className="recorder-action-container">
            <button
              className="btn-giant-action start-btn"
              onClick={startRecording}
              onFocus={() => speakText('Botón iniciar grabación')}
            >
              <div className="giant-action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              <span className="giant-action-label">Iniciar Grabación</span>
            </button>
          </div>
        )}

        {/* FASE 2: GRABANDO */}
        {isRecording && (
          <div className="recorder-action-container">
            <button
              className="btn-giant-action stop-btn"
              onClick={stopRecording}
              onFocus={() => speakText('Botón detener grabación')}
            >
              <div className="giant-action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </div>
              <span className="giant-action-label">Detener Grabación</span>
            </button>
          </div>
        )}
               {/* Indicador de tiempo gigante */}
        <div className="timer-giant-display">
          {isRecording && <span className="pulsing-record-dot"></span>}
          <span className="time-text">{formatTime(recordingTime)}</span>
        </div>

        {/* FASE 3: AUDIO COMPLETADO (GUARDAR O DESCARTAR) */}
        {!isRecording && audioURL && (
          <div className="recorder-save-discard-container">
            {/* Reproductor de audio grande */}
            <div className="accessible-playback-box">
              <audio src={audioURL} controls className="giant-audio-player" />
            </div>

            <div className="save-discard-buttons-row">
              {/* BOTÓN GUARDAR */}
              <button
                className="btn-giant-action save-btn"
                onClick={handleSave}
                disabled={isSaving}
                onFocus={() => speakText(isSaving ? 'Guardando' : 'Botón guardar grabación en la sala')}
              >
                <div className="giant-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="giant-action-label">
                  {isSaving ? 'Guardando...' : 'Guardar Grabación'}
                </span>
              </button>

              {/* BOTÓN DESCARTAR */}
              <button
                className="btn-giant-action discard-btn"
                onClick={handleDiscard}
                disabled={isSaving}
                onFocus={() => speakText('Botón descartar grabación actual')}
              >
                <div className="giant-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <span className="giant-action-label">Descartar</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Botón Volver al Menú abajo y centrado */}
      <div className="subview-footer">
        <button
          className="btn-back-giant"
          onClick={handleCancelBack}
          onFocus={() => speakText('Botón volver atrás')}
        >
          ← Volver al Menú
        </button>
      </div>

      {/* Modal gigante de confirmación para descartar */}
      {showDiscardModal && (
        <div className="discard-modal-overlay">
          <div className="discard-modal-box">
            <h3>¿Seguro que quieres borrar la grabación?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions-row">
              <button
                className="btn-modal-action confirm-discard-btn"
                onClick={confirmDiscard}
                onFocus={() => speakText('Confirmar borrar grabación')}
              >
                Sí, Borrar
              </button>
              <button
                className="btn-modal-action cancel-discard-btn"
                onClick={cancelDiscard}
                onFocus={() => speakText('No borrar, volver')}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicoAudioRecorder;
