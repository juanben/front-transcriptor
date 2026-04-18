import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../common/UserMenu';
import { sessionService, type Session } from '../../services/session/sessionService';
import { userService } from '../../services/user/userService';
import './SessionDetail.css';

const SessionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Transcripcion'>('Resumen');

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [resourcesText, setResourcesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
            onClick={() => navigate(`/sala/${id}`)} 
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
              onClick={() => navigate(`/home`)} 
              title="Ir a Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
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
            <div className="audio-player-container" style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
              {audioUrl ? (
                <audio controls src={audioUrl} style={{ width: '100%' }}>
                  Tu navegador no soporta el elemento de audio.
                </audio>
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

            <div className="session-action-buttons">
              <button className="btn-secondary-large" onClick={handleOpenModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                Recursos complementarios
              </button>
              
              <button className="btn-secondary-large" onClick={() => {
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
    </div>
  );
};

export default SessionDetail;
