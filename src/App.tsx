import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import IAdministrador from './IAdministrador';
import Inicio from './Inicio';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Back from './Back';
import Bienvenida from './Bienvenida';
import Favoritos from './Favoritos';
import Carrito from './Carrito';
import Descargas from './Descargas';
import DetallesProducto from './DetalleProducto';
import AdminPromociones from './AdminPromociones'; // Renombrado correctamente
import AdminProductos from './AdminProductos';
import AdminCategorias from './AdminCategorias';

import './App.css';

function App() {
  const [usuario, setUsuario] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUsuario(data.session);
      }
      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const RutaProtegida = ({ element }: { element: JSX.Element }) => {
    return usuario ? element : <Navigate to="/login" />;
  };

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registro" element={<RegisterForm />} />
          <Route path="/correodetectado" element={<Back />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/IAdministrador" element={<IAdministrador />} />
          <Route path="/admin/ofertas" element={<AdminPromociones />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          {/* Rutas protegidas */}
          <Route path="/favoritos" element={<RutaProtegida element={<Favoritos />} />} />
          <Route path="/carrito" element={<RutaProtegida element={<Carrito />} />} />
          <Route path="/descargas" element={<RutaProtegida element={<Descargas />} />} />
          <Route path="/producto/:id" element={<DetallesProducto />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;