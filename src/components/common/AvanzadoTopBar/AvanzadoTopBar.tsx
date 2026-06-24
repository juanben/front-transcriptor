import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../UserMenu';

interface AvanzadoTopBarProps {
  title?: string;
}

const AvanzadoTopBar: React.FC<AvanzadoTopBarProps> = ({ title = 'Bienvenido perfil avanzado' }) => {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 shadow-sm z-10">
      <div className="flex gap-2 items-center">
        <button
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl cursor-pointer border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[70px] sm:min-w-[90px] shadow-sm hover:outline-none focus:outline-3 focus:outline-indigo-500"
          onClick={() => navigate('/home')}
          title="Volver a Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] sm:text-xs font-semibold">Inicio</span>
        </button>
      </div>

      <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 m-0 leading-tight text-center truncate px-2 max-w-[45%] sm:max-w-[55%] md:max-w-[65%]">
        {title}
      </h2>

      <div className="flex gap-2 items-center">
        <UserMenu />
      </div>
    </header>
  );
};

export default AvanzadoTopBar;
