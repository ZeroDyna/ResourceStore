import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Recarga {
  id_recarga: number;
  fecha_recarga: string;
  monto: number;
  id_admin: number | null;
  id_user: number;
  aceptada: boolean | null;
}

interface Usuario {
  id_user: number;
  nombre_usuario: string;
  saldo: number;
}

const AdminRecargas: React.FC = () => {
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<Recarga[]>([]);
  const [usuarios, setUsuarios] = useState<{ [id: number]: Usuario }>({});

  useEffect(() => {
    fetchRecargasPendientes();
    fetchHistorialRecargas();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (recargas.length === 0 && historial.length === 0) return;
      const ids = Array.from(new Set([...recargas, ...historial].map(r => r.id_user)));
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from('usuario')
        .select('id_user, nombre_usuario, saldo')
        .in('id_user', ids);
      if (!error && data) {
        const dict: { [id: number]: Usuario } = {};
        data.forEach((u: Usuario) => dict[u.id_user] = u);
        setUsuarios(dict);
      }
    };
    fetchUsuarios();
    // eslint-disable-next-line
  }, [recargas, historial]);

  async function fetchRecargasPendientes() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('recarga')
      .select('*')
      .is('aceptada', null)
      .order('fecha_recarga', { ascending: true });
    setLoading(false);
    if (error) setError('Error al obtener recargas pendientes');
    else setRecargas(data || []);
  }

  async function fetchHistorialRecargas() {
    const { data, error } = await supabase
      .from('recarga')
      .select('*')
      .not('aceptada', 'is', null)
      .order('fecha_recarga', { ascending: false });
    if (!error) setHistorial(data || []);
  }

  async function aceptarRecarga(recarga: Recarga) {
    setLoading(true);
    setError('');
    const adminIdValue = localStorage.getItem('admin_id');
    const adminId = adminIdValue ? Number(adminIdValue) : null;
    if (!adminId || isNaN(adminId)) {
      setError('No hay un admin válido en localStorage. Inicia sesión como administrador.');
      setLoading(false);
      return;
    }
    // Verifica que el admin exista en la tabla admin
    const { data: adminExists, error: adminError } = await supabase
      .from('admin')
      .select('id_admin')
      .eq('id_admin', adminId)
      .single();
    if (adminError || !adminExists) {
      setError('El administrador que intenta aceptar la recarga no existe en la base de datos.');
      setLoading(false);
      return;
    }
    // Trae el saldo actual del usuario desde la BD
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuario')
      .select('id_user, saldo')
      .eq('id_user', recarga.id_user)
      .single();
    if (usuarioError || !usuarioData) {
      setError('No se encontró el usuario o hubo un error al traer el usuario');
      setLoading(false);
      return;
    }
    const nuevoSaldo = Number(usuarioData.saldo || 0) + Number(recarga.monto || 0);

    // 1. Marca la recarga como aceptada si sigue pendiente
    const { error: recargaError, data: recargaData } = await supabase
      .from('recarga')
      .update({ aceptada: true, id_admin: adminId })
      .eq('id_recarga', recarga.id_recarga)
      .is('aceptada', null)
      .select();

    if (recargaError) {
      setError('Error al aceptar recarga: ' + recargaError.message);
      setLoading(false);
      return;
    }
    if (!recargaData || recargaData.length === 0) {
      setError('Esta recarga ya fue gestionada o no existe.');
      setLoading(false);
      await fetchRecargasPendientes();
      await fetchHistorialRecargas();
      return;
    }

    // 2. Actualiza el saldo
    const { error: saldoError } = await supabase
      .from('usuario')
      .update({ saldo: nuevoSaldo })
      .eq('id_user', recarga.id_user);

    if (saldoError) {
      setError('Error al actualizar saldo: ' + saldoError.message);
      setLoading(false);
      return;
    }

    await fetchRecargasPendientes();
    await fetchHistorialRecargas();
    setLoading(false);
  }

  async function rechazarRecarga(recarga: Recarga) {
    setLoading(true);
    setError('');
    const adminIdValue = localStorage.getItem('admin_id');
    const adminId = adminIdValue ? Number(adminIdValue) : null;
    if (!adminId || isNaN(adminId)) {
      setError('No hay un admin válido en localStorage. Inicia sesión como administrador.');
      setLoading(false);
      return;
    }
    // Verifica que el admin exista en la tabla admin
    const { data: adminExists, error: adminError } = await supabase
      .from('admin')
      .select('id_admin')
      .eq('id_admin', adminId)
      .single();
    if (adminError || !adminExists) {
      setError('El administrador que intenta rechazar la recarga no existe en la base de datos.');
      setLoading(false);
      return;
    }
    const { error, data } = await supabase
      .from('recarga')
      .update({ aceptada: false, id_admin: adminId })
      .eq('id_recarga', recarga.id_recarga)
      .is('aceptada', null);
    if (error) {
      setError('Error al rechazar recarga: ' + error.message);
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      setError('Esta recarga ya fue gestionada o no existe.');
      setLoading(false);
      await fetchRecargasPendientes();
      await fetchHistorialRecargas();
      return;
    }
    await fetchRecargasPendientes();
    await fetchHistorialRecargas();
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Recargas Pendientes</h2>
      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {recargas.length === 0 && !loading && <div>No hay recargas pendientes.</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recargas.map((r) => (
            <tr key={r.id_recarga}>
              <td>{r.id_recarga}</td>
              <td>{usuarios[r.id_user]?.nombre_usuario || r.id_user}</td>
              <td>${r.monto.toFixed(2)}</td>
              <td>{r.fecha_recarga ? new Date(r.fecha_recarga).toLocaleString() : '-'}</td>
              <td>
                <button disabled={loading} onClick={() => aceptarRecarga(r)}>Aceptar</button>
                <button disabled={loading} onClick={() => rechazarRecarga(r)} style={{ marginLeft: 8 }}>Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Historial de Recargas</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((r) => (
            <tr key={r.id_recarga}>
              <td>{r.id_recarga}</td>
              <td>{usuarios[r.id_user]?.nombre_usuario || r.id_user}</td>
              <td>${r.monto.toFixed(2)}</td>
              <td>{r.fecha_recarga ? new Date(r.fecha_recarga).toLocaleString() : '-'}</td>
              <td>{r.aceptada === true ? "Aceptada" : "Rechazada"}</td>
              <td>{r.id_admin ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRecargas;