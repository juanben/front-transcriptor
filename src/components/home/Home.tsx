import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

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
    </div>
  );
};

export default Home;