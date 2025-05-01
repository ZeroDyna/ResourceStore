import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
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
    <div className="login-container">
      <h2>¡Bienvenido!</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
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
      <button onClick={handleLogin}>Iniciar Sesión</button>
      <p>¿No tienes cuenta? <span className="link" onClick={() => navigate('/registro')}>Regístrate aquí</span></p>
    </div>
  );
}

export default LoginForm;
