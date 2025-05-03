import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import fondo from './fondo.jpeg'; // Importación directa de la imagen
import './FormStyles.css';

function LoginForm() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      alert('Correo o contraseña incorrectos.');
    } else {
      console.log('Login exitoso:', data);
      navigate('/bienvenida'); // Navegar directamente
    }
  };

  return (
    <div
      className="login-background"
      style={{
        backgroundImage: `url(${fondo})`,
      }}
    >
      <div className="login-container">
        <h2>Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Usuario"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="forgot-password">¿Olvidaste tu contraseña?</p>
        <button onClick={handleLogin}>Iniciar sesión</button>
      </div>
    </div>
  );
}

export default LoginForm;