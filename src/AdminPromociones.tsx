import React, { useEffect, useState } from 'react';
import { Gestor_Promocion } from './Gestor_Promociones';
import { Promocion } from './Promocion';
import { supabase } from './supabaseClient';
import './AdminPromociones.css';

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Promocion, 'id' | 'fecha_creacion'>>({
    admin_creador_id: '',
    descuento: 0,
    fecha_inicio: '',
    fecha_fin: '',
    activa: true,
    url_banner: '',
  });
  const [editando, setEditando] = useState<Promocion | null>(null);

  useEffect(() => {
    fetchPromociones();
    // Asigna el admin_creador_id cada vez que se abre el formulario de creación
    // (si usas un sistema de auth y quieres guardar el admin actual)
    // Puedes quitar esto si lo asignas en otro lado
  }, []);

  const fetchPromociones = async () => {
    try {
      const lista = await Gestor_Promocion.listarPromociones();
      setPromociones(lista);
    } catch (e) {
      alert("Error al listar promociones");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number"
        ? Number(value)
        : type === "checkbox"
        ? checked
        : value
    }));
  };

  const handleAgregar = async () => {
    // Setea admin_creador_id automáticamente si tienes usuarios autenticados
    let finalForm = { ...form };
    if (!finalForm.admin_creador_id) {
      const { data: { user } } = await supabase.auth.getUser();
      finalForm.admin_creador_id = user ? user.id : '';
    }
    try {
      await Gestor_Promocion.crearPromocion(finalForm);
      setForm({
        admin_creador_id: '',
        descuento: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
        url_banner: '',
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
      admin_creador_id: promo.admin_creador_id,
      descuento: promo.descuento,
      fecha_inicio: promo.fecha_inicio,
      fecha_fin: promo.fecha_fin,
      activa: promo.activa,
      url_banner: promo.url_banner,
    });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await Gestor_Promocion.actualizarPromocion(editando.id, form);
      setEditando(null);
      setShowForm(false);
      setForm({
        admin_creador_id: '',
        descuento: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
        url_banner: '',
      });
      fetchPromociones();
    } catch (e) {
      alert("Error al actualizar promoción");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar promoción?")) return;
    try {
      await Gestor_Promocion.eliminarPromocion(id);
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
          <div className="admin-promo-card" key={promo.id}>
            <div className="admin-promo-img">
              <img
                src={promo.url_banner || "/promo-placeholder.png"}
                alt={"Banner de promoción"}
                onError={e => (e.currentTarget.src = "/promo-placeholder.png")}
              />
            </div>
            <div className="admin-promo-info">
              <p><b>Admin:</b> {promo.admin_creador_id}</p>
              <p><b>Descuento:</b> {promo.descuento}%</p>
              <p><b>Inicio:</b> {promo.fecha_inicio}</p>
              <p><b>Fin:</b> {promo.fecha_fin}</p>
              <p><b>Activa:</b> {promo.activa ? "Sí" : "No"}</p>
              <div className="admin-promo-actions">
                <button className="modificar-btn" onClick={() => handleEditar(promo)}>Modificar</button>
                <button className="eliminar-btn" onClick={() => handleEliminar(promo.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Botón grande para agregar promoción */}
      <div className="admin-add-promo-container">
        <button className="admin-add-promo-btn" onClick={() => { setEditando(null); setShowForm(!showForm); }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Promoción
        </button>
      </div>
      {/* Formulario modal/incrustado */}
      {showForm && (
        <div className="admin-promo-form-modal">
          <div className="admin-promo-form">
            <h3>{editando ? "Editar promoción" : "Agregar promoción"}</h3>
            <input
              name="descuento"
              value={form.descuento}
              onChange={handleChange}
              placeholder="Descuento (%)"
              type="number"
              min="0"
              max="100"
            />
            <input
              name="fecha_inicio"
              value={form.fecha_inicio}
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
              name="url_banner"
              value={form.url_banner}
              onChange={handleChange}
              placeholder="URL del banner"
            />

            <label style={{ marginTop: 10 }}>
              <input
                name="activa"
                type="checkbox"
                checked={!!form.activa}
                onChange={handleChange}
                style={{ marginRight: 7 }}
              />
              Activa
            </label>
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