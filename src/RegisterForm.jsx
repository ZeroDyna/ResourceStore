import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './FormStyles.css';

function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password,
      options: {
        data: {
          nombre: nombre,
        },
      },
    });

    if (error) {
      console.error('Error al registrar:', error.message);
      alert('Hubo un error: ' + error.message);
    } else {
      console.log('Registro exitoso:', data);
      navigate('/correo-detectado'); // Redirigir
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro</h2>
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
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
        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
}

export default RegisterForm;
