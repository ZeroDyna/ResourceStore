import React from 'react';
import './FormStyles.css'; // Puedes crear un css si quieres estilizarlo

function Back({ setVista }) {
  return (
    <div className="correo-detectado-container">
      <h2>Correo Detectado</h2>
      <p>¡Se detectó tu correo correctamente!</p>
      <button onClick={() => setVista('Login')}>Volver a Iniciar Sesión</button>
    </div>
  );
}

export default Back;
