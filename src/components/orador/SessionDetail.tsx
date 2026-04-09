import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SessionDetail.css';

const SessionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Transcripcion'>('Resumen');

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
          <button 
            className="btn-home-icon" 
            onClick={() => navigate(`/home/${sessionId}`)} 
            title="Ir a Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
        </div>

        <div className="session-title-section">
          <h2 className="session-title-text">Clase de Introducción</h2>
          <span className="session-date-subtext">07 Abr 2026</span>
        </div>
      </header>

      <main className="dashboard-content session-detail-main">
        <div className="audio-player-container">
          <button className="btn-play-audio">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <div className="audio-progress-wrapper">
            <div className="audio-times">
              <span>12:45</span>
              <span>45:00</span>
            </div>
            <div className="audio-progress-bar">
              <div className="audio-progress-fill" style={{ width: '30%' }}></div>
              <div className="audio-progress-thumb" style={{ left: '30%' }}></div>
            </div>
          </div>
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
            <div>
              <h3>Conceptos Básicos</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            </div>
          ) : (
            <div>
              <p><strong>[00:00] Orador:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <p><strong>[02:15] Orador:</strong> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
              <p><strong>[05:30] Estudiante:</strong> Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat?</p>
              <p><strong>[06:00] Orador:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              <p><strong>[12:45] Orador:</strong> Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          )}
        </div>

        <div className="session-action-buttons">
          <button className="btn-secondary-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            Recursos complementarios
          </button>
          
          <button className="btn-secondary-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Exportar / Compartir
          </button>
        </div>
      </main>
    </div>
  );
};

export default SessionDetail;