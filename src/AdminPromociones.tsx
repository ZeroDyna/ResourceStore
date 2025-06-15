import React, { useEffect, useState } from 'react';
import { Gestor_Promocion } from './Gestor_Promociones';
import { Promocion } from './Promocion';
import { supabase } from './supabaseClient';
import './AdminPromociones.css';

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Promocion, 'id_promocion'>>({
    id_admin: '',
    porcentaje: 0,
    descripcion: '',
    fecha_ini: '',
    fecha_fin: '',
    id_contenido: null,
  });
  const [editando, setEditando] = useState<Promocion | null>(null);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    try {
      const lista = await Gestor_Promocion.listarPromociones();
      setPromociones(lista);
    } catch (e) {
      alert("Error al listar promociones");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'id_contenido') {
      setForm(prev => ({
        ...prev,
        id_contenido: value === '' ? null : Number(value),
      }));
    } else if (name === 'porcentaje') {
      setForm(prev => ({
        ...prev,
        porcentaje: Number(value)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAgregar = async () => {
    let finalForm = { ...form };
    Object.keys(finalForm).forEach(k => {
      if (finalForm[k as keyof typeof finalForm] === '') {
        finalForm[k as keyof typeof finalForm] = null as any;
      }
    });
    // Si usas auth, puedes obtener aquí el id del admin autenticado
    if (!finalForm.id_admin) {
      const { data: { user } } = await supabase.auth.getUser();
      finalForm.id_admin = user ? user.id : '';
    }
    try {
      await Gestor_Promocion.crearPromocion(finalForm);
      setForm({
        id_admin: '',
        porcentaje: 0,
        descripcion: '',
        fecha_ini: '',
        fecha_fin: '',
        id_contenido: null,
      });
      setShowForm(false);
      fetchPromociones();
    } catch (e) {
      alert("Error al agregar promoción");
    }
  };

  const handleEditar = (promo: Promocion) => {
    setEditando(promo);
    setForm({
      id_admin: promo.id_admin,
      porcentaje: promo.porcentaje,
      descripcion: promo.descripcion,
      fecha_ini: promo.fecha_ini,
      fecha_fin: promo.fecha_fin,
      id_contenido: promo.id_contenido ?? null,
    });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    let finalForm = { ...form };
    Object.keys(finalForm).forEach(k => {
      if (finalForm[k as keyof typeof finalForm] === '') {
        finalForm[k as keyof typeof finalForm] = null as any;
      }
    });
    try {
      await Gestor_Promocion.actualizarPromocion(editando.id_promocion, finalForm);
      setEditando(null);
      setShowForm(false);
      setForm({
        id_admin: '',
        porcentaje: 0,
        descripcion: '',
        fecha_ini: '',
        fecha_fin: '',
        id_contenido: null,
      });
      fetchPromociones();
    } catch (e) {
      alert("Error al actualizar promoción");
    }
  };

  const handleEliminar = async (id_promocion: number) => {
    if (!window.confirm("¿Eliminar promoción?")) return;
    try {
      await Gestor_Promocion.eliminarPromocion(id_promocion);
      fetchPromociones();
    } catch (e) {
      alert("Error al eliminar promoción");
    }
  };

  return (
    <div className="admin-promo-container">
      <h2 className="admin-title">Gestión de Promociones</h2>
      <div className="admin-promo-list">
        {promociones.map(promo => (
          <div className="admin-promo-card" key={promo.id_promocion}>
            <div className="admin-promo-info">
              <p><b>Admin:</b> {promo.id_admin}</p>
              <p><b>Porcentaje:</b> {promo.porcentaje}%</p>
              <p><b>Descripción:</b> {promo.descripcion}</p>
              <p><b>Inicio:</b> {promo.fecha_ini}</p>
              <p><b>Fin:</b> {promo.fecha_fin}</p>
              <p><b>ID Contenido:</b> {promo.id_contenido ?? 'N/A'}</p>
              <div className="admin-promo-actions">
                <button className="modificar-btn" onClick={() => handleEditar(promo)}>Modificar</button>
                <button className="eliminar-btn" onClick={() => handleEliminar(promo.id_promocion)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-add-promo-container">
        <button className="admin-add-promo-btn" onClick={() => { setEditando(null); setShowForm(!showForm); }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Promoción
        </button>
      </div>
      {showForm && (
        <div className="admin-promo-form-modal">
          <div className="admin-promo-form">
            <h3>{editando ? "Editar promoción" : "Agregar promoción"}</h3>
            <input
              name="id_admin"
              value={form.id_admin}
              onChange={handleChange}
              placeholder="ID Admin"
            />
            <input
              name="porcentaje"
              value={form.porcentaje}
              onChange={handleChange}
              placeholder="Porcentaje (%)"
              type="number"
              min="0"
              max="100"
            />
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
            />
            <input
              name="fecha_ini"
              value={form.fecha_ini}
              onChange={handleChange}
              placeholder="Fecha de inicio"
              type="date"
            />
            <input
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              placeholder="Fecha de fin"
              type="date"
            />
            <input
              name="id_contenido"
              value={form.id_contenido ?? ''}
              onChange={handleChange}
              placeholder="ID Contenido (opcional)"
              type="number"
              min="1"
            />
            <div style={{ marginTop: 12 }}>
              {editando ? (
                <>
                  <button className="modificar-btn" onClick={handleActualizar}>Actualizar</button>
                  <button className="eliminar-btn" style={{ marginLeft: 8 }}
                    onClick={() => { setEditando(null); setShowForm(false); }}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button className="modificar-btn" onClick={handleAgregar}>Agregar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}