import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="screen">
      <div className="logo">EDU</div>
      <h1>Login</h1>
      <form>
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" id="email" placeholder="correo@ejemplo.com" />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" placeholder="........" />
        </div>
        <button type="submit" className="btn-primary">→ Iniciar sesión</button>
      </form>
      <p>¿No tienes cuenta? <a href="signup">Regístrate</a> | <a href="about">Acerca de</a></p>
    </div>
  );
};

export default Login;
