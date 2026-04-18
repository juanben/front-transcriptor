import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userService } from '../../services/user/userService';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        await userService.getUserMe(token);
        setIsAuthorized(true);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        // Token inválido o error en la petición
        localStorage.removeItem('token');
        setIsAuthorized(false);
      }
    };

    verifyToken();
  }, [location.pathname]); // Re-verificar si cambia de ruta

  if (isAuthorized === null) {
    // Estado de carga inicial mientras se verifica
    return (
      <div className="screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#6b7280' }}>Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
