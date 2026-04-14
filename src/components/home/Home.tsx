import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="screen home-screen">
      <div className="home-logo">EDU</div>
      
      <div className="role-buttons">
        <button 
          className="btn-outline" 
          onClick={() => navigate('/orador')}
        >
          Soy Orador
        </button>
        <button 
          className="btn-outline" 
          onClick={() => navigate('/espectador')}
        >
          Soy Espectador
        </button>
      </div>

      <button 
        className="btn-back-text" 
        onClick={handleLogout}
        style={{ marginTop: '2rem', color: '#ef4444' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Home;
