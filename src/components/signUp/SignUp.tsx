import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user/userService';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await userService.signUp({ name, email, password });
      
      // Si el registro fue correcto, redirigimos a login para que inicie sesión
      navigate('/login');
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="logo">EDU</div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input 
            id="username" 
            placeholder="nombre" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div className="input-group">
          <label htmlFor="confirm-password">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="confirm-password" 
            placeholder="........" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Registrando...' : '→ Registrarse'}
        </button>
      </form>
      <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>

      {errorMessage && (
        <div className="modal-overlay" onClick={() => setErrorMessage(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Error de Registro</h3>
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

export default SignUp;
