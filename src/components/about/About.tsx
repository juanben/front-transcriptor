import React from 'react';
import './About.css'

const About: React.FC = () => {
  return (
    <div className="screen">
      <div className="logo">EDU</div>
      
      <h1>Bienvenido a EDU</h1>
      <div className="about-content" style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <p style={{ marginTop: '0' }}> 
          EDU es una plataforma para transcribir contenidos de manera accesible tanto para estudiantes como para profesores o cualquier persona que guste usar este servicio.
        </p>
        <p style={{ marginTop: '0' }}>
          EDU tiene algo para ti. Únete a nuestra comunidad de aprendices y comienza tu viaje educativo hoy mismo.
        </p>
        <span className="span">
          ¡Explora, aprende y crece con EDU!
        </span>
        <a href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
          Regresar
        </a>
      </div>
    </div>
  );
};

export default About;