import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import fondo from './fondo.jpeg';
import './FormStyles.css';
import Iadministrador from './IAdministrador';
// Si usas contraseñas hasheadas, instala bcryptjs y descomenta esto:
// import bcrypt from 'bcryptjs';

function LoginForm() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Buscar en administradores
    const { data: admin, error: adminError } = await supabase
      .from('administradores')
      .select('*')
      .eq('email', correo)
      .single();

    if (admin) {
      // Si tienes hashes: const passwordOk = await bcrypt.compare(password, admin.contraseña_hash);
      const passwordOk = password === admin.contraseña_hash;
      if (passwordOk) {
        // Guarda sesión si lo deseas
        sessionStorage.setItem('user_role', 'admin');
        sessionStorage.setItem('user_email', admin.email);
        // Redirige al dashboard admin
        navigate('/IAdministrador');
        return;
      }
    }

    // Buscar en users
    const { data: user, error: userError } = await supabase
      .from('users') // Cambia por el nombre real de tu tabla de usuarios si es diferente
      .select('*')
      .eq('email', correo)
      .single();

    if (user) {
      // Si tienes hashes: const passwordOk = await bcrypt.compare(password, user.contraseña_hash);
      const passwordOk = password === user.contraseña_hash;
      if (passwordOk) {
        sessionStorage.setItem('user_role', 'user');
        sessionStorage.setItem('user_email', user.email);
        navigate('/bienvenida');
        return;
      }
    }

    alert('Correo o contraseña incorrectos.');
  };

  return (
    <div
      className="login-background"
      style={{ backgroundImage: `url(${fondo})` }}
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
