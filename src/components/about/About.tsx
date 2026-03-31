import React from 'react';
import './About.css'
const About: React.FC = () => {
  return (
    <div className="screen">
      <div className="logo">EDU</div>
      
      <h1>Bienvenido a EDU</h1>
        <p> EDU es una plataforma para transcribir contenidos de manera
            accesible tanto para estudiantes como para profesores o
            cualquier persona que guste usar este servicio.</p>
        <p>EDU tiene algo para ti. Únete a nuestra 
            comunidad de aprendices y comienza tu viaje 
            educativo hoy mismo..</p>
        {/* Cambiamos a block para que el margen funcione y le damos énfasis */}
      <span className="span">
        ¡Explora, aprende y crece con EDU!
      </span>
            <a href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
                Regresar</a>
    </div>
     
  );
};

export default About;