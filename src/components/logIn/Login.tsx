import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../../services/login/loginService';
import { userService } from '../../services/user/userService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEasyMode, setIsEasyMode] = useState(true);

  const handleEnter = () => {
    if (isEasyMode) {
      console.log('Redirigiendo a modo básico');
      navigate('/basico');
    } else {
      console.log('Redirigiendo a modo avanzado');
      navigate('/avanzado');
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verificamos si el token guardado sigue siendo válido
          await userService.getUserMe(token);
          // Si no tira error, es válido, pasamos directo a Home
          handleEnter();
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          }
          // Si el token expiró o es inválido, lo removemos
          localStorage.removeItem('token');
          setIsCheckingSession(false);
        }
      } else {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await loginService.login({ email, password });

      if (response.session_token) {
        localStorage.setItem('token', response.session_token);
      }

      // Si el login fue correcto, redirigir a home del modo respectivo
      handleEnter();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Error al iniciar sesión');
      }

    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#6b7280' }}>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <img src="/LogoEscribIA.svg" alt="Logo Aplicación EscribIA" className='logo' />
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="........"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : '→ Iniciar sesión'}
        </button>
      </form>
      <p>¿No tienes cuenta? Regístrate</p>
      <form>
        <button
          onClick={() => navigate('/signup')}
          className="btn-primary" >Regístrate
        </button>
      </form>
      {/* 4. Toggle Switch (Modo Fácil) */}
      <div className="flex items-center space-x-3 mt-4">
        <button
          type="button"
          role="switch"
          aria-checked={isEasyMode}
          onClick={() => setIsEasyMode(!isEasyMode)}
          className={`relative inline-flex h-[26px] w-[50px] items-center rounded-full transition-colors duration-300 focus:outline-none ${isEasyMode ? 'bg-[#5d5fef]' : 'bg-[#cbd5e1] dark:bg-slate-700'
            }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isEasyMode ? 'translate-x-[26px]' : 'translate-x-[4px]'
              }`}
          />
        </button>
        <span className="!text-slate-800 dark:!text-slate-200 font-medium italic text-sm">
          {isEasyMode ? 'Modo Fácil Activo' : 'Modo Avanzado Activo'}
        </span>
      </div>
      <p><a href="about">Acerca de ScribeLab</a></p>
      {errorMessage && (
        <div className="modal-overlay" onClick={() => setErrorMessage(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Error de Inicio de Sesión</h3>
            <p className="modal-text">{errorMessage}</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn-modal-submit"
                style={{ background: '#ef4444', boxShadow: 'none' }}
                onClick={() => setErrorMessage(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
