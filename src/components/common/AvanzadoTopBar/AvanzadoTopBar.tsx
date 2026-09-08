import React from 'react';
import UserMenu from '../UserMenu';
import './AvanzadoTopBar.css';

interface AvanzadoTopBarProps {
  title?: string;
}

const AvanzadoTopBar: React.FC<AvanzadoTopBarProps> = ({ title = 'EscribIA' }) => {


  return (
    <header className="room-sessions-header">
      <div className="header-top-row avanzado-header-row">
        <div className="avanzado-title-container">
          <span className="avanzado-title-text">
            {title}
          </span>
          <span className="avanzado-subtitle-text">
            Mi Biblioteca
          </span>
        </div>
        <div className="avanzado-right-menu">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AvanzadoTopBar;
