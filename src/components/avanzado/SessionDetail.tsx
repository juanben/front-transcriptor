import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import UserMenu from '../common/UserMenu';
import MessageModal from '../common/MessageModal';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import './SessionDetail.css';

const SessionDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Transcripcion'>('Resumen');

  const isEspectador = location.state?.isEspectador || false;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showModal = (msg: string, title?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalTitle(title || '');
    setModalMessage(msg);
    setModalType(type);
    setModalOpen(true);
  };

  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [isFullTextModalOpen, setIsFullTextModalOpen] = useState(false);
  const [isNoResourcesModalOpen, setIsNoResourcesModalOpen] = useState(false);
  const [resourcesText, setResourcesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Audio Playback Controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!id || !sessionId) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const user = await userService.getUserMe(token);
        const data = await sessionService.getSessionDetails(id, sessionId, user.email);
        setSession(data);
        console.log('Detalles de la sesión obtenidos:', data);
      } catch (err) {
        if (err instanceof Error) {
          setFetchError(err.message || 'Error al cargar los detalles de la sesión.');
        } else {
          setFetchError('Error al cargar los detalles de la sesión.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionData();
  }, [id, sessionId, navigate]);

  const handleOpenModal = () => {
    setIsResourcesModalOpen(true);
    setErrorMsg(null);
    setResourcesText(session?.complementaryResourses?.toString() || session?.complementaryResources?.toString() || '');
  };

  const handleCloseModal = () => {
    setIsResourcesModalOpen(false);
    setErrorMsg(null);
  };

  const handleSubmitResources = async () => {
    if (!id || !sessionId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const user = await userService.getUserMe(token);
      await sessionService.addComplementaryResources(id, sessionId, user.email, resourcesText);

      showModal('Recursos complementarios guardados con éxito.', 'Éxito', 'success');
      handleCloseModal();

      if (session) {
        setSession({ ...session, complementaryResourses: resourcesText, complementaryResources: resourcesText });
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Error al guardar los recursos complementarios.');
      } else {
        setErrorMsg('Error al guardar los recursos complementarios.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const audioUrl = session?.record_path ? `http://localhost:8000/${session.record_path.replace(/^\/+/, '')}` : null;
  console.log('Audio URL:', audioUrl);
  console.log('Session Data:', session);
  const formattedDate = session?.created_at ? new Date(session.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="dashboard-screen session-detail-screen">
      <header className="room-sessions-header">
        <div className="header-top-row">
          <button
            className="btn-back-text"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserMenu />
            <button
              className="btn-home-icon"
              onClick={() => navigate(`/avanzado`)}
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="session-title-section">
          <h2 className="session-title-text">{isLoading ? 'Cargando...' : session?.name || 'Sesión'}</h2>
          <span className="session-date-subtext">{isLoading ? '' : formattedDate}</span>
        </div>
      </header>

      <main className="dashboard-content session-detail-main">
        {fetchError && <p style={{ color: 'red', textAlign: 'center' }}>{fetchError}</p>}
        {isLoading && <p style={{ textAlign: 'center' }}>Cargando datos de la sesión...</p>}

        {!isLoading && !fetchError && session && (
          <>
            <div className="audio-player-container">
              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              {audioUrl ? (
                <>
                  <button
                    className={`btn-play-audio ${isPlaying ? 'playing' : ''}`}
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <div className="audio-progress-wrapper">
                    <input
                      type="range"
                      className="audio-slider"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      style={{
                        background: `linear-gradient(to right, 
                          var(--slider-fill, #111827) 0%, 
                          var(--slider-fill, #111827) ${duration ? (currentTime / duration) * 100 : 0}%, 
                          var(--slider-track, #e5e7eb) ${duration ? (currentTime / duration) * 100 : 0}%, 
                          var(--slider-track, #e5e7eb) 100%)`
                      }}
                      aria-label="Progreso del audio"
                    />
                    <div className="audio-times">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: '#6b7280', margin: 0 }}>No hay audio disponible para esta sesión.</p>
              )}
            </div>

            <div className="divider-dashed"></div>

            <div className="tabs-container">
              <button
                className={`tab-btn ${activeTab === 'Resumen' ? 'active' : ''}`}
                onClick={() => setActiveTab('Resumen')}
              >Resumen</button>
              <button
                className={`tab-btn ${activeTab === 'Transcripcion' ? 'active' : ''}`}
                onClick={() => setActiveTab('Transcripcion')}
              >Transcripcion</button>
            </div>

            <div className="text-content-box">
              <button
                className="btn-fullscreen-mini"
                onClick={() => setIsFullTextModalOpen(true)}
                title="Ver a pantalla completa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              </button>
              <div className="text-scroll-area">
                {activeTab === 'Resumen' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {session.summary ? session.summary : 'No hay resumen disponible.'}
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {session.transcription ? session.transcription : 'No hay transcripción disponible.'}
                  </div>
                )}
              </div>
            </div>

            <div className="session-action-buttons">
              {!isEspectador && (
                <button className="btn-secondary-large" onClick={handleOpenModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  Recursos complementarios
                </button>
              )}

              <button className="btn-secondary-large" onClick={() => {
                const resourceLink = session?.complementaryResourses || session?.complementaryResources;
                if (resourceLink) {
                  const link = Array.isArray(resourceLink) ? resourceLink[0] : resourceLink;
                  if (link.startsWith('http')) {
                    window.open(link, '_blank');
                  } else {
                    showModal('El recurso complementario no es un enlace válido:\n\n' + link, 'Enlace no válido', 'warning');
                  }
                } else {
                  setIsNoResourcesModalOpen(true);
                }
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Abrir Recursos
              </button>
            </div>
          </>
        )}
      </main>

      {isResourcesModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Añadir recursos complementarios</h3>
            <p className="modal-text">Ingresa los recursos complementarios para esta sesión (por ejemplo, enlaces o notas extra).</p>

            <textarea
              value={resourcesText}
              onChange={(e) => setResourcesText(e.target.value)}
              placeholder="Escribe los recursos aquí..."
              style={{ width: '100%', minHeight: '100px', marginTop: '1rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
            />

            {errorMsg && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.875rem' }}>{errorMsg}</p>}

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-modal-cancel" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</button>
              <button className="btn-modal-submit" onClick={handleSubmitResources} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFullTextModalOpen && session && (
        <div className="full-screen-modal-overlay" onClick={() => setIsFullTextModalOpen(false)}>
          <div className="full-screen-modal-box" onClick={e => e.stopPropagation()}>
            <div className="full-screen-modal-header">
              <h3>{activeTab === 'Resumen' ? 'Resumen Completo' : 'Transcripción Completa'}</h3>
              <button
                className="btn-close-modal-x"
                onClick={() => setIsFullTextModalOpen(false)}
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>
            <div className="full-screen-modal-body">
              <div className="full-screen-text-content">
                {activeTab === 'Resumen'
                  ? (session.summary ? session.summary : 'No hay resumen disponible.')
                  : (session.transcription ? session.transcription : 'No hay transcripción disponible.')
                }
              </div>
            </div>
            <div className="full-screen-modal-footer">
              <button
                className="btn-modal-back"
                onClick={() => setIsFullTextModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {isNoResourcesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNoResourcesModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Recursos complementarios</h3>
            <p className="modal-text" style={{ margin: '1rem 0 1.5rem 0' }}>
              No se han añadido recursos complementarios.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-modal-submit" onClick={() => setIsNoResourcesModalOpen(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        isBasicMode={false}
      />
    </div>
  );
};

export default SessionDetail;
