import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminRecargas from './AdminRecargas';
// Puedes importar aquí otros componentes de admin si los tienes

const Administrador: React.FC = () => {
  const [opcion, setOpcion] = useState<'recargas' | 'categorias' | 'productos' | 'dashboard'>('dashboard');
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#222', color: '#fff', padding: 20 }}>
        <h2>Panel Admin</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li
            style={{ cursor: 'pointer', margin: '1em 0', fontWeight: opcion === 'dashboard' ? 'bold' : undefined }}
            onClick={() => setOpcion('dashboard')}
          >
            Dashboard
          </li>
          <li
            style={{ cursor: 'pointer', margin: '1em 0', fontWeight: opcion === 'categorias' ? 'bold' : undefined }}
            onClick={() => setOpcion('categorias')}
          >
            Gestionar Categorías
          </li>
          <li
            style={{ cursor: 'pointer', margin: '1em 0', fontWeight: opcion === 'productos' ? 'bold' : undefined }}
            onClick={() => setOpcion('productos')}
          >
            Gestionar Productos
          </li>
          <li
            style={{ cursor: 'pointer', margin: '1em 0', fontWeight: opcion === 'recargas' ? 'bold' : undefined }}
            onClick={() => setOpcion('recargas')}
          >
            Gestionar Recargas
          </li>
          <li
            style={{ cursor: 'pointer', margin: '1em 0', color: "#f55" }}
            onClick={() => navigate("/")}
          >
            Salir
          </li>
        </ul>
      </aside>
      <main style={{ flex: 1, background: '#f7f7f7', padding: 30 }}>
        {opcion === 'dashboard' && (
          <div>
            <h1>Bienvenido, Administrador</h1>
            <p>Selecciona una opción en el menú para comenzar a gestionar.</p>
          </div>
        )}
        {opcion === 'recargas' && <AdminRecargas />}
        {opcion === 'categorias' && (
          <div>
            <h2>Gestión de Categorías</h2>
            <p>Componente de categorías aquí.</p>
          </div>
        )}
        {opcion === 'productos' && (
          <div>
            <h2>Gestión de Productos</h2>
            <p>Componente de productos aquí.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Administrador;