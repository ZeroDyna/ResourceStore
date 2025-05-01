import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import {container } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import Inicio from './Inicio';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Back from './Back';
import Bienvenida from './Bienvenida';
import Favoritos from './Favoritos';
import Carrito from './Carrito';
import Descargas from './Descargas';

import './App.css';

function App() {
  const [usuario, setUsuario] = useState<Session | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUsuario(data.session);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registro" element={<RegisterForm />} />
        <Route path="/correodetectado" element={<Back />} />
        <Route path="/bienvenida" element={<Bienvenida />} />
        
        {/* Solo accesibles si hay usuario logueado */}
        {usuario && (
          <>
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/descargas" element={<Descargas />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
