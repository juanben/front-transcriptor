import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import './BasicoMenu.css';
import './BasicoSessionDetail.css';
import { speakText } from '../../utils/speak';
import { useBasicoLogout } from '../../hooks/useBasicoLogout';
import BasicoTopMenu from '../common/BasicoTopBar/BasicoTopMenu';

const BasicoSessionDetail: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = useBasicoLogout();
  const location = useLocation();
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Transcripcion'>('Resumen');

  const isEspectador = location.state?.isEspectador || false;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [resourcesText, setResourcesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);



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
        speakText('Cargando detalles de la grabación.');
        const data = await sessionService.getSessionDetails(id, sessionId, user.email);
        setSession(data);
        speakText(`Grabación cargada: ${data.name || 'Detalle'}`);
        console.log('Detalles de la sesión obtenidos:', data);
      } catch (err) {
        speakText('Error al cargar los detalles de la grabación.');
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

      alert('Recursos complementarios guardados con éxito.');
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



  // Audio Playback Controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      speakText('Audio pausado');
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      speakText('Reproduciendo audio');
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
    speakText('El audio ha terminado.');
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

  const audioUrl = session?.record_path ? `http://localhost:8000/${session.record_path.replace(/^\/+/, '')}` : null;
  console.log('Audio URL:', audioUrl);
  console.log('Session Data:', session);

  return (
    <div className="basico-menu-screen session-detail-container">
      <BasicoTopMenu
        title="Detalle de Sesión"
        subtitle={session?.name || 'Cargando...'}
        onBackClick={() => {
          speakText('Volviendo a la pantalla anterior');
          navigate(-1);
        }}
        backTitle="Volver"
        backSpeakText="Botón volver atrás"
        backIcon="arrow-left"
        onLogoutClick={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="basico-menu-content session-detail-content">
        <div className="accessible-subview session-detail-subview">

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', minHeight: 0 }}>
            {isLoading ? (
              <div className="subview-message">Cargando detalles de la sesión...</div>
            ) : fetchError ? (
              <div className="subview-message error">{fetchError}</div>
            ) : session ? (
              <>
                {/* Reproductor de Audio Accesible */}
                <div className="accessible-player-container">
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
                        className={`btn-play-giant ${isPlaying ? 'playing' : ''}`}
                        onClick={handlePlayPause}
                        onFocus={() => speakText(isPlaying ? 'Botón pausar audio' : 'Botón reproducir audio')}
                        aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
                      >
                        {isPlaying ? (
                          /* Pause icon */
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          /* Play icon */
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      <div className="player-seekbar-group">
                        <input
                          type="range"
                          className="giant-progress-bar"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          onFocus={() => speakText('Barra de progreso del audio')}
                          aria-label="Progreso del audio"
                        />
                        <div className="player-time-row">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="subview-message">No hay audio disponible para esta sesión.</div>
                  )}
                </div>

                {/* Tabs gigantes de detalle */}
                <div className="detail-tabs-row">
                  <button
                    className={`tab-btn-giant ${activeTab === 'Resumen' ? 'active' : ''}`}
                    onClick={() => {
                      speakText('Mostrando resumen');
                      setActiveTab('Resumen');
                    }}
                    onFocus={() => speakText('Pestaña Resumen')}
                  >
                    Resumen
                  </button>
                  <button
                    className={`tab-btn-giant ${activeTab === 'Transcripcion' ? 'active' : ''}`}
                    onClick={() => {
                      speakText('Mostrando transcripción');
                      setActiveTab('Transcripcion');
                    }}
                    onFocus={() => speakText('Pestaña Transcripción')}
                  >
                    Transcripción
                  </button>
                </div>

                {/* Contenido del detalle */}
                <div 
                  className="detail-content-card"
                  tabIndex={0}
                  onFocus={() => speakText(activeTab === 'Resumen' ? 'Contenido del resumen' : 'Contenido de la transcripción')}
                >
                  <div className="detail-text-body">
                    {activeTab === 'Resumen'
                      ? (session.summary || 'No hay resumen disponible.')
                      : (session.transcription || 'No hay transcripción disponible.')
                    }
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="recording-actions-row" style={{ marginTop: '1.5rem', gap: '1rem' }}>
                  {!isEspectador && (
                    <button
                      className="btn-join-giant"
                      style={{ flex: 1, maxWidth: 'none', padding: '1rem 0.5rem', fontSize: '1.15rem' }}
                      onClick={handleOpenModal}
                      onFocus={() => speakText('Botón añadir recursos complementarios')}
                    >
                      Recursos
                    </button>
                  )}

                  <button
                    className="btn-back-giant"
                    style={{ flex: 1, maxWidth: 'none', padding: '1rem 0.5rem', fontSize: '1.15rem' }}
                    onClick={() => {
                      const resourceLink = session?.complementaryResourses || session?.complementaryResources;
                      if (resourceLink) {
                        const link = Array.isArray(resourceLink) ? resourceLink[0] : resourceLink;
                        if (link.startsWith('http')) {
                          window.open(link, '_blank');
                        } else {
                          alert('El recurso complementario no es un enlace válido:\n\n' + link);
                        }
                      } else {
                        alert('No hay recursos complementarios para compartir.');
                      }
                    }}
                    onFocus={() => speakText('Botón abrir recursos complementarios')}
                  >
                    Abrir Recursos
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Botón Volver abajo y centrado */}
          <div className="subview-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', width: '100%' }}>
            <button
              className="btn-back-giant"
              onClick={() => {
                speakText('Volviendo a la pantalla anterior');
                navigate(-1);
              }}
              onFocus={() => speakText('Botón volver atrás')}
            >
              ← Volver
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Recursos */}
      {isResourcesModalOpen && (
        <div className="basico-modal-overlay" onClick={handleCloseModal}>
          <div className="basico-modal-box" onClick={e => e.stopPropagation()}>
            <h3>Recursos complementarios</h3>
            <p>Ingresa enlaces o notas adicionales para esta sesión.</p>

            <textarea
              value={resourcesText}
              onChange={(e) => setResourcesText(e.target.value)}
              placeholder="Escribe los recursos aquí..."
              onFocus={() => speakText('Campo de texto para recursos')}
              style={{
                width: '100%',
                minHeight: '120px',
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                border: '2px solid rgba(148, 163, 184, 0.4)',
                fontSize: '1.15rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />

            {errorMsg && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.95rem' }}>{errorMsg}</p>}

            <div className="subview-footer" style={{ marginTop: '2rem', gap: '1rem' }}>
              <button
                className="btn-back-giant"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                onFocus={() => speakText('Botón cancelar')}
                style={{ flex: 1, padding: '1rem 0.5rem', fontSize: '1.15rem' }}
              >
                Cancelar
              </button>
              <button
                className="btn-join-giant"
                onClick={handleSubmitResources}
                disabled={isSubmitting}
                onFocus={() => speakText('Botón guardar recursos')}
                style={{ flex: 1, padding: '1rem 0.5rem', fontSize: '1.15rem' }}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicoSessionDetail;

