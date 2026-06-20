import React from 'react';
import { speakText } from '../../../utils/speak';
import { useNavigate } from 'react-router-dom';



interface BasicoTopMenuProps {
  title: string;
  subtitle?: string;
  onBackClick: () => void;
  backText?: string;
  backTitle?: string;
  backSpeakText?: string;
  backIcon?: 'home' | 'arrow-left';
  onLogoutClick: () => void;
  logoutSpeakText?: string;
}

export const BasicoTopMenu: React.FC<BasicoTopMenuProps> = ({

  title,
  subtitle,
  onBackClick,
  backText = 'Inicio',
  backTitle = 'Volver al Menú',
  backSpeakText = 'Menu Principal',
  backIcon = 'home',
  onLogoutClick,
  logoutSpeakText = 'Botón cerrar sesión',
}) => {
  const navigate = useNavigate(); // 👈 2. Inicializas el hook dentro del componente
  return (
    <header className="basico-header">
      <button
        className="btn-header-large btn-header-home"
        onClick={() => {
          speakText('Menu Principal')
          navigate("/basico")

        }}
        onFocus={() => speakText(backSpeakText)}
        title={backTitle}
      >
        {backIcon === 'home' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        )}
        <span>{backText}</span>
      </button>

      <div className="basico-header-title">
        <h2>{title}</h2>
        {subtitle && <span className="user-indicator">{subtitle}</span>}
      </div>

      <button
        className="btn-header-large btn-header-logout"
        onClick={onLogoutClick}
        onFocus={() => speakText(logoutSpeakText)}
        title="Cerrar Sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Salir</span>
      </button>
    </header>
  );
};

export default BasicoTopMenu;
