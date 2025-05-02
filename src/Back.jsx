import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; 

function Back() {
  const navigate = useNavigate();

  return (
    <div className="correo-detectado-container">
      <h2>Correo Detectado</h2>
      <p>¡Se detectó tu correo correctamente!</p>
      <button onClick={() => navigate('/login')}>Volver a Iniciar Sesión</button>
    </div>
  );
}

export default Back;
