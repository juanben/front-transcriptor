import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user/userService';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await userService.getUserMe(token);
          setUserName(user.name);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    fetchUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!userName) return null;

  return (
    <div className="user-menu-container" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn-user-profile"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#374151'
        }}
        title="Perfil de usuario"
      >
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        {userName}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          minWidth: '150px',
          overflow: 'hidden'
        }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
