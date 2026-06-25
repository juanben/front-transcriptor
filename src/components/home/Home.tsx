import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isEasyMode, setIsEasyMode] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEnter = () => {
    if (isEasyMode) {
      console.log('Redirigiendo a modo básico');
      navigate('/basico');
    } else {
      console.log('Redirigiendo a modo avanzado');
      navigate('/avanzado');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between items-center px-6 py-10 bg-white dark:bg-[#16171d] text-center max-w-md mx-auto select-none transition-colors duration-300">
      
      {/* 1. Avatar/Logo Central */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full mt-4">
        <div className="w-36 h-36 rounded-full flex items-center justify-center bg-gradient-to-b from-[#6b7be8] to-[#8d4da8] shadow-lg border-[6px] border-slate-100/70 dark:border-slate-800/70">
          <span className="!text-white text-4xl font-extrabold tracking-wide">
            EDU
          </span>
        </div>

        {/* 2. Bloque de Texto Informativo (Centrado) */}
        <div className="space-y-4 w-full px-2">
          <h2 className="!text-[#1e293b] dark:!text-[#f3f4f6] text-2xl font-bold tracking-tight">
            ¡Bienvenido a ScribeLab!
          </h2>
          <p className="!text-[#475569] dark:!text-[#9ca3af] text-[15px] leading-relaxed font-normal">
            Democratizamos la transcripción de audio y la creación de resúmenes automáticos. 
            Inicia sesión para explorar la plataforma. Comenzarás directamente en el 
            Modo Fácil, ideal para una experiencia rápida, limpia y sin complicaciones.
          </p>
          <p className="!text-[#64748b] dark:!text-[#9ca3af]/60 text-[12px] italic leading-snug">
            Nota: El Modo Avanzado ofrece funciones adicionales, pero el Modo Fácil es perfecto para quienes buscan simplicidad y eficiencia.
          </p>
        </div>
      </div>

      {/* 3. Botón de Acción Principal y Toggle Switch */}
      <div className="w-full flex flex-col items-center gap-6 mt-8">
        <button
          onClick={handleEnter}
          className="w-full max-w-[320px] py-4 px-8 bg-[#5d5fef] hover:bg-[#4a4cd6] active:scale-[0.97] !text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg md:text-xl tracking-wide min-h-[64px] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#5d5fef]/50"
        >
          Ingresar
        </button>

        {/* 4. Toggle Switch (Modo Fácil) */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            role="switch"
            aria-checked={isEasyMode}
            onClick={() => setIsEasyMode(!isEasyMode)}
            className={`relative inline-flex h-[26px] w-[50px] items-center rounded-full transition-colors duration-300 focus:outline-none ${
              isEasyMode ? 'bg-[#5d5fef]' : 'bg-[#cbd5e1] dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                isEasyMode ? 'translate-x-[26px]' : 'translate-x-[4px]'
              }`}
            />
          </button>
          <span className="!text-slate-800 dark:!text-slate-200 font-medium italic text-sm">
            {isEasyMode ? 'Modo Fácil Activo' : 'Modo Avanzado Activo'}
          </span>
        </div>
      </div>

      {/* 5. Botón de Cierre de Sesión */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center justify-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors duration-200 mt-12 py-2 text-[15px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 mr-2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Cerrar Sesión
      </button>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Home;
