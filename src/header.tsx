// Header.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import './Header.css'; // (opcional, si quieres estilos separados)

const Header = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<{ nombre_usuario: string; saldo: number } | null>(null);

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

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <header className="top-bar">
      <h1>
        <Link to="/Bienvenida" style={{ textDecoration: 'none', color: 'inherit' }}>
          Resources Store
        </Link>
      </h1>
      <div className="top-info">
        <button onClick={() => alert('Ir a página de recarga')} className="btn-recargar">
          🔄 Recargar
        </button>
        <span>Mi saldo: ${usuario?.saldo?.toFixed(2) || '0.00'}</span>
        <span>{usuario?.nombre_usuario || 'Invitado'}</span>
        {usuario ? (
          <button onClick={handleLogout}>Cerrar sesión</button>
        ) : (
          <button onClick={() => navigate('/')}>Iniciar sesión</button>
        )}
      </div>
    </header>
  );
};

export default Header;
