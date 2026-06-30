import React, { useEffect } from 'react';
import { speakText } from '../../utils/speak';
import './MessageModal.css';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isBasicMode?: boolean;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  isBasicMode = false
}) => {
  useEffect(() => {
    if (isOpen) {
      const readText = `${title ? title + '. ' : ''}${message}`;
      speakText(readText);
    }
  }, [isOpen, message, title]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="message-modal-icon success" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg className="message-modal-icon error" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg className="message-modal-icon warning" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="message-modal-icon info" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'info':
      default:
        return 'Información';
    }
  };

  return (
    <div className="message-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`message-modal-box ${isBasicMode ? 'basic-layout' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="message-modal-header">
          {getIcon()}
          <h3 className="message-modal-title">{getTitle()}</h3>
        </div>
        
        <div className="message-modal-body">
          {message.split('\n').map((line, index) => (
            <p key={index} className="message-modal-text">{line}</p>
          ))}
        </div>
        
        <div className="message-modal-actions">
          <button 
            type="button"
            className="btn-message-modal-close" 
            onClick={onClose}
            onFocus={() => {
              if (isBasicMode) speakText('Botón Aceptar y cerrar');
            }}
            autoFocus
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
