import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './AdminProductos.css';

interface Contenido {
  id_contenido: number;
  nombre: string;
  autor: string;
  archivo: string;
  descripcion: string;
  fecha_subida: string;
  tipo: string;
  formato: string;
  tamanio: number | null;
  calidad: string;
  precio: number;
  id_admin: number | null;
  id_categoria: number | null;
}

export default function AdminContenido() {
  const [contenido, setContenido] = useState<Contenido[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Contenido, 'id_contenido'>>({
    nombre: '',
    autor: '',
    archivo: '',
    descripcion: '',
    fecha_subida: '',
    tipo: '',
    formato: '',
    tamanio: null,
    calidad: '',
    precio: 0,
    id_admin: null,
    id_categoria: null,
  });
  const [editando, setEditando] = useState<Contenido | null>(null);

  useEffect(() => {
    fetchContenido();
  }, []);

  const fetchContenido = async () => {
    try {
      const { data, error } = await supabase.from('contenido').select('*');
      if (error) throw error;
      setContenido(data || []);
    } catch (e) {
      alert("Error al listar contenido");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "tamanio" ||
        name === "id_admin" ||
        name === "id_categoria" ||
        name === "precio"
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const limpiarForm = () => ({
    nombre: '',
    autor: '',
    archivo: '',
    descripcion: '',
    fecha_subida: '',
    tipo: '',
    formato: '',
    tamanio: null,
    calidad: '',
    precio: 0,
    id_admin: null,
    id_categoria: null,
  });

  const handleAgregar = async () => {
    try {
      // Clona el form y elimina cualquier id_contenido por si acaso
      const { /* id_contenido, */ ...insertData } = form;
      const cleanForm: any = { ...insertData };
      Object.keys(cleanForm).forEach((key) => {
        if (
          cleanForm[key] === '' &&
          (typeof cleanForm[key] === 'string' || cleanForm[key] === undefined)
        ) {
          cleanForm[key] = null;
        }
      });
      if (!cleanForm.nombre) {
        alert("El campo 'nombre' es obligatorio.");
        return;
      }
      if (cleanForm.precio === null || cleanForm.precio === undefined) {
        alert("El campo 'precio' es obligatorio.");
        return;
      }
      // NO enviar id_contenido
      const { error } = await supabase.from('contenido').insert([cleanForm]);
      if (error) throw error;
      setForm(limpiarForm());
      setShowForm(false);
      fetchContenido();
    } catch (e: any) {
      alert("Error al agregar contenido: " + (e?.message || JSON.stringify(e)));
    }
  };

  const handleEditar = (cont: Contenido) => {
    setEditando(cont);
    setForm({
      nombre: cont.nombre ?? '',
      autor: cont.autor ?? '',
      archivo: cont.archivo ?? '',
      descripcion: cont.descripcion ?? '',
      fecha_subida: cont.fecha_subida
        ? cont.fecha_subida.substring(0, 16)
        : '',
      tipo: cont.tipo ?? '',
      formato: cont.formato ?? '',
      tamanio: cont.tamanio ?? null,
      calidad: cont.calidad ?? '',
      precio: cont.precio ?? 0,
      id_admin: cont.id_admin ?? null,
      id_categoria: cont.id_categoria ?? null,
    });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      const cleanForm: any = { ...form };
      Object.keys(cleanForm).forEach((key) => {
        if (
          cleanForm[key] === '' &&
          (typeof cleanForm[key] === 'string' || cleanForm[key] === undefined)
        ) {
          cleanForm[key] = null;
        }
      });
      if (!cleanForm.nombre) {
        alert("El campo 'nombre' es obligatorio.");
        return;
      }
      if (cleanForm.precio === null || cleanForm.precio === undefined) {
        alert("El campo 'precio' es obligatorio.");
        return;
      }
      const { error } = await supabase
        .from('contenido')
        .update(cleanForm)
        .eq('id_contenido', editando.id_contenido);
      if (error) throw error;
      setEditando(null);
      setShowForm(false);
      setForm(limpiarForm());
      fetchContenido();
    } catch (e: any) {
      alert("Error al actualizar contenido: " + (e?.message || JSON.stringify(e)));
    }
  };

  const handleEliminar = async (id_contenido: number) => {
    if (!window.confirm("¿Eliminar contenido?")) return;
    try {
      const { error } = await supabase.from('contenido').delete().eq('id_contenido', id_contenido);
      if (error) throw error;
      fetchContenido();
    } catch (e) {
      alert("Error al eliminar contenido");
    }
  };

  return (
    <div className="admin-prod-container">
      <h2 className="admin-title">Gestión de Contenido</h2>
      <div className="admin-prod-list">
        {contenido.map((cont) => (
          <div className="admin-prod-card" key={cont.id_contenido}>
            <div className="admin-prod-info">
              <h4>{cont.nombre}</h4>
              <p><b>Autor:</b> {cont.autor}</p>
              <p><b>Descripción:</b> {cont.descripcion}</p>
              <p><b>Archivo:</b> {cont.archivo}</p>
              <p><b>Fecha subida:</b> {cont.fecha_subida}</p>
              <p><b>Tipo:</b> {cont.tipo}</p>
              <p><b>Formato:</b> {cont.formato}</p>
              <p><b>Tamaño:</b> {cont.tamanio}</p>
              <p><b>Calidad:</b> {cont.calidad}</p>
              <p><b>Precio:</b> {cont.precio}</p>
              <p><b>ID Admin:</b> {cont.id_admin}</p>
              <p><b>ID Categoría:</b> {cont.id_categoria}</p>
              <div className="admin-prod-actions">
                <button className="modificar-btn" onClick={() => handleEditar(cont)}>
                  Modificar
                </button>
                <button className="eliminar-btn" onClick={() => handleEliminar(cont.id_contenido)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-add-product-container">
        <button
          className="admin-add-product-btn"
          onClick={() => {
            setEditando(null);
            setShowForm(!showForm);
          }}
        >
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Contenido
        </button>
      </div>
      {showForm && (
        <div className="admin-prod-form-modal">
          <div className="admin-prod-form">
            <h3>{editando ? "Editar contenido" : "Agregar contenido"}</h3>
            <input
              name="nombre"
              value={form.nombre ?? ''}
              onChange={handleChange}
              placeholder="Nombre *"
              required
            />
            <input name="autor" value={form.autor ?? ''} onChange={handleChange} placeholder="Autor" />
            <input name="archivo" value={form.archivo ?? ''} onChange={handleChange} placeholder="Archivo" />
            <textarea name="descripcion" value={form.descripcion ?? ''} onChange={handleChange} placeholder="Descripción" />
            <input
              name="fecha_subida"
              value={form.fecha_subida ?? ''}
              onChange={handleChange}
              placeholder="Fecha subida"
              type="datetime-local"
            />
            <input name="tipo" value={form.tipo ?? ''} onChange={handleChange} placeholder="Tipo" />
            <input name="formato" value={form.formato ?? ''} onChange={handleChange} placeholder="Formato" />
            <input
              name="tamanio"
              value={form.tamanio ?? ''}
              onChange={handleChange}
              placeholder="Tamaño"
              type="number"
              step="any"
            />
            <input name="calidad" value={form.calidad ?? ''} onChange={handleChange} placeholder="Calidad" />
            <input
              name="precio"
              value={form.precio ?? ''}
              onChange={handleChange}
              placeholder="Precio"
              type="number"
              required
              step="any"
            />
            <input
              name="id_admin"
              value={form.id_admin ?? ''}
              onChange={handleChange}
              placeholder="ID Admin"
              type="number"
            />
            <input
              name="id_categoria"
              value={form.id_categoria ?? ''}
              onChange={handleChange}
              placeholder="ID Categoría"
              type="number"
            />
            <div style={{ marginTop: 12 }}>
              {editando ? (
                <>
                  <button className="modificar-btn" onClick={handleActualizar}>
                    Actualizar
                  </button>
                  <button
                    className="eliminar-btn"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      setEditando(null);
                      setShowForm(false);
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button className="modificar-btn" onClick={handleAgregar}>
                  Agregar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}