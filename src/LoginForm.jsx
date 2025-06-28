import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import fondo from './fondo.jpeg';
import './FormStyles.css';

function LoginForm() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Buscar primero en admin
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', correo)
      .maybeSingle();

    if (adminError) {
      console.log('Error buscando en admin:', adminError.message);
    }

    if (admin) {
      const passwordOk = password === admin.contrasenia;
      if (passwordOk) {
        // Asegúrate que el campo sea el PK real de admin: id_admin o id
        localStorage.setItem('admin_id', admin.id_admin.toString());
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('user_email', admin.email);
        localStorage.setItem('user_id', admin.id_admin);
        localStorage.setItem('user_nombre', admin.nombre_usuario);
        navigate('/IAdministrador');
        return;
      }
    }

    // Buscar en usuario
    const { data: user, error: userError } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', correo)
      .maybeSingle();

    if (userError) {
      console.log('Error buscando en usuario:', userError.message);
    }

    if (user) {
      const passwordOk = password === user.contrasenia;
      if (passwordOk) {
        localStorage.setItem('user_role', 'user');
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_id', user.id_user);
        localStorage.setItem('user_nombre', user.nombre_usuario);
        localStorage.setItem('user_saldo', user.saldo);
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