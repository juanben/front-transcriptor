import { useNavigate } from 'react-router-dom';
import { speakText } from '../utils/speak';

/**
 * Custom hook to handle common logout logic for basic mode screens.
 */
export const useBasicoLogout = () => {
  const navigate = useNavigate();

  const handleLogout = (beforeLogout?: () => void) => {
    if (typeof beforeLogout === 'function') {
      beforeLogout();
    }
    speakText('Cerrando sesión');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return handleLogout;
};
