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
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!userName) return null;

  return (
    <div className="user-menu-container relative inline-block" ref={menuRef}>
      <button 
        className="btn-user-profile flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full cursor-pointer font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        title="Perfil de usuario"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span>{userName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 min-w-[170px] overflow-hidden">
          {/* Cambiar a Modo Básico */}
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate('/basico');
            }}
            className="flex items-center gap-2 w-full px-4 py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-none cursor-pointer text-left text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Modo Básico
          </button>

          {/* Separador */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Cerrar Sesión */}
          <button 
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-2 w-full px-4 py-3 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border-none cursor-pointer text-left text-sm font-medium transition-colors"
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
