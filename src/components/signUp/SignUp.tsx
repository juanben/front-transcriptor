import React from 'react';

const SignUp: React.FC = () => {
  return (
    <div className="screen">
      <div className="logo">EDU</div>
      <h1>Sign Up</h1>
      <form>
          <div className="input-group">
          <label >Nombre de Usuario</label>
          <input id="username" placeholder="nombre" />
        </div>
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" id="email" placeholder="correo@ejemplo.com" />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" placeholder="........" />
        </div>
        <div className="input-group">
          <label htmlFor="confirm-password">Confirmar Contraseña</label>
          <input type="password" id="confirm-password" placeholder="........" />
        </div>
        <button type="submit" className="btn-primary">→ Registrarse</button>
      </form>
      <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
    </div>
  );
};

export default SignUp;

