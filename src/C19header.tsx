// C19-Header - Componente de cabecera principal de la tienda Resources Store.
// Este componente muestra el nombre de la tienda, el saldo del usuario,
// y opciones para recargar, ver perfil o cerrar sesión.

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PerfilUsuario from './PerfilUsuario'; // Componente modal para mostrar perfil del usuario
import { supabase } from './supabaseClient'; // Cliente Supabase (si se requiere para futuras funcionalidades)
import './Header.css'; // Estilos del encabezado

// Props del componente Header (C19-Header)
interface HeaderProps {
  onRecargarClick: () => void; // F01-onRecargarClick: Función externa que se ejecuta al hacer clic en el botón de recarga
}

const Header: React.FC<HeaderProps> = ({ onRecargarClick: onRecargarClick }) => {
  const navigate = useNavigate();

  // Estado que almacena los datos del usuario: nombre y saldo
  const [usuario, setUsuario] = useState<{ nombre_usuario: string; saldo: number } | null>(null);

  // Estado para controlar la visibilidad del componente PerfilUsuario
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  // F02-useEffectCargaUsuario: Se ejecuta al montar el componente para cargar los datos del usuario desde el almacenamiento local
  useEffect(() => {
    const nombre_usuario =
      localStorage.getItem('user_nombre') || sessionStorage.getItem('user_nombre');
    const saldo = localStorage.getItem('user_saldo');

    if (nombre_usuario) {
      setUsuario({
        nombre_usuario,
        saldo: parseFloat(saldo ?? '0') || 0,
      });
    }
  }, []);

  // F03-handleLogout: Cierra la sesión del usuario, limpia el almacenamiento y redirige a la página de inicio
  const F03handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <>
      <header className="top-bar">
        {/* C19-Header: Título con enlace a la página de bienvenida */}
        <h1>
          <Link to="/Bienvenida" style={{ textDecoration: 'none', color: 'inherit' }}>
            Resources Store
          </Link>
        </h1>

        {/* Información del usuario y botones de acción */}
        <div className="top-info">
          {/* Botón de recarga - ejecuta función F01-onRecargarClick */}
          <button onClick={onRecargarClick} className="btn-recargar">
            🔄 Recargar
          </button>

          {/* Muestra el saldo del usuario formateado a dos decimales */}
          <span>Mi saldo: ${usuario?.saldo.toFixed(2) || '0.00'}</span>

          {/* Nombre de usuario que al hacer clic muestra el componente de perfil */}
          <span
            onClick={() => setMostrarPerfil(true)} // F04-handleMostrarPerfil
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {usuario?.nombre_usuario || 'Invitado'}
          </span>

          {/* Botón para cerrar sesión o iniciar sesión según si hay usuario */}
          {usuario ? (
            <button onClick={F03handleLogout}>Cerrar sesión</button> // F03-handleLogout
          ) : (
            <button onClick={() => navigate('/')}>Iniciar sesión</button> // F05-handleIniciarSesion
          )}
        </div>
      </header>

      {/* Modal de perfil de usuario si está autenticado */}
      {usuario && (
        <PerfilUsuario
          visible={mostrarPerfil}
          onClose={() => setMostrarPerfil(false)} // F06-handleCerrarPerfil
          nombre_usuario={usuario.nombre_usuario}
        />
      )}
    </>
  );
};

export default Header;