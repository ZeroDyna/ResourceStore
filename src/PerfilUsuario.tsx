// PerfilUsuario.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './PerfilUsuario.css';
interface Props {
  visible: boolean;
  onClose: () => void;
  nombre_usuario: string;
}

const PerfilUsuario: React.FC<Props> = ({ visible, onClose, nombre_usuario }) => {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (visible && nombre_usuario) {
      fetchUsuario();
    }
  }, [visible]);

  const fetchUsuario = async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('nombre, nombre_usuario, email, saldo')
      .eq('nombre_usuario', nombre_usuario)
      .single();

    if (error) {
      console.error('❌ Error al obtener usuario:', error);
    } else {
      setUsuario(data);
    }
  };

  if (!visible) return null;

  return (
    <div className="perfil-usuario-popup">
      <div className="perfil-contenido">
        <button onClick={onClose} className="cerrar-btn">❌</button>
        <h3>Perfil del Usuario</h3>
        {usuario ? (
          <ul>
            <li><strong>Nombre:</strong> {usuario.nombre}</li>
            <li><strong>Usuario:</strong> {usuario.nombre_usuario}</li>
            <li><strong>Email:</strong> {usuario.email}</li>
            <li><strong>Saldo:</strong> ${usuario.saldo.toFixed(2)}</li>
          </ul>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
    </div>
  );
};

export default PerfilUsuario;
