import React, { useEffect } from 'react';
import { speakText } from '../../utils/speak';
import './LogoutConfirmModal.css';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBasicMode?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isBasicMode = false
}) => {
  useEffect(() => {
    if (isOpen && isBasicMode) {
      speakText('¿Está seguro de que desea cerrar sesión?');
    }
  }, [isOpen, isBasicMode]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isBasicMode) speakText('Acción cancelada. Volviendo.');
      onClose();
    }
  };

  return (
    <div className="logout-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={`logout-modal-box ${isBasicMode ? 'basic-layout' : ''}`}>
        <div className="logout-modal-header">
          <svg className="logout-modal-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <h3 className="logout-modal-title">Cerrar Sesión</h3>
        </div>
        
        <p className="logout-modal-text">¿Está seguro que desea cerrar sesión?</p>
        
        <div className="logout-modal-actions">
          <button 
            type="button"
            className="btn-logout-modal-cancel" 
            onClick={() => {
              if (isBasicMode) speakText('Botón Cancelar presionado. Volviendo.');
              onClose();
            }}
            onFocus={() => {
              if (isBasicMode) speakText('Botón Cancelar y volver');
            }}
          >
            Cancelar
          </button>
          <button 
            type="button"
            className="btn-logout-modal-confirm" 
            onClick={() => {
              if (isBasicMode) speakText('Botón Confirmar presionado. Cerrando sesión.');
              onConfirm();
            }}
            onFocus={() => {
              if (isBasicMode) speakText('Botón Confirmar y cerrar sesión');
            }}
            autoFocus
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
