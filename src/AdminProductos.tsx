import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import './AdminProductos.css';

interface Contenido {
  id_contenido: number;
  nombre: string;
  autor: string;
  archivo: string;
  fecha_subida: string;
  tipo: string;
  formato: string;
  tamanio?: string;
  calidad?: string;
  id_admin: number;
  precio: number;
  descripcion?: string;
  id_categoria: number;
}

export default function AdminContenido() {
  const [contenido, setContenido] = useState<Contenido[]>([]);
  const [categorias, setCategorias] = useState<{ id_categoria: number; nombre: string }[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    autor: '',
    archivo: '',
    tipo: 'Imagen',
    formato: '',
    tamanio: '',
    calidad: '',
    id_admin: '',
    precio: '',
    descripcion: '',
    id_categoria: ''
  });
  const [editando, setEditando] = useState<Contenido | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerContenido();
    obtenerCategorias();
  }, []);

  const obtenerContenido = async () => {
    const { data, error } = await supabase.from('contenido').select('*');
    if (error) {
      alert("Error al obtener contenido");
      return;
    }
    setContenido(data || []);
  };

  const obtenerCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('id_categoria, nombre');
    if (error) {
      alert("Error al obtener categorías");
      return;
    }
    setCategorias(data || []);
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: '', autor: '', archivo: '', tipo: 'Imagen', formato: '', tamanio: '', calidad: '',
      id_admin: '', precio: '', descripcion: '', id_categoria: ''
    });
    setEditando(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const prepararDatos = () => {
    const datos = {
      ...form,
      fecha_subida: new Date().toISOString(),
      tamanio: form.tamanio || null,
      calidad: form.calidad || null,
      descripcion: form.descripcion || null,
      id_admin: form.id_admin ? parseInt(form.id_admin) : null,
      precio: form.precio ? parseFloat(form.precio) : null,
      id_categoria: form.id_categoria ? parseInt(form.id_categoria) : null
    };
    return datos;
  };

  const handleAgregar = async () => {
    const datos = prepararDatos();
    if (!datos.nombre || !datos.autor || !datos.archivo || !datos.tipo || !datos.formato || !datos.id_admin || !datos.precio || !datos.id_categoria) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    const { error } = await supabase.from('contenido').insert([datos]);
    if (error) {
      alert("Error al agregar contenido.");
      return;
    }
    obtenerContenido();
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    const datos = prepararDatos();
    if (!datos.nombre) {
      alert("El campo 'nombre' es obligatorio.");
      return;
    }
    const { error } = await supabase
      .from('contenido')
      .update(datos)
      .eq('id_contenido', editando.id_contenido);
    if (error) {
      alert("Error al actualizar contenido.");
      return;
    }
    obtenerContenido();
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleEditar = (item: Contenido) => {
    setForm({
      nombre: item.nombre || '',
      autor: item.autor || '',
      archivo: item.archivo || '',
      tipo: item.tipo || 'Imagen',
      formato: item.formato || '',
      tamanio: item.tamanio || '',
      calidad: item.calidad || '',
      id_admin: item.id_admin.toString() || '',
      precio: item.precio.toString() || '',
      descripcion: item.descripcion || '',
      id_categoria: item.id_categoria.toString() || '',
    });
    setEditando(item);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este contenido?")) return;
    const { error } = await supabase.from('contenido').delete().eq('id_contenido', id);
    if (error) {
      alert("Error al eliminar contenido");
      return;
    }
    obtenerContenido();
  };

  return (
    <div className="admin-prod-container">
      <h2 className="admin-title">Gestión de Contenido</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        
        <button
          className="admin-add-product-btn"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(!mostrarFormulario);
          }}
        >
          <span style={{ fontSize: 24, marginRight: 8 }}>＋</span> Agregar Contenido
        </button>
      </div>

      <div className="admin-prod-list">
        {contenido.map(item => (
          <div className="admin-prod-card" key={item.id_contenido}>
            <div className="admin-prod-img">
              <img
                src={item.archivo || "/placeholder.jpg"}
                alt={item.nombre}
                onError={e => (e.currentTarget.src = "/placeholder.jpg")}
              />
            </div>
            <div className="admin-prod-info">
              <h4>{item.nombre}</h4>
              <p><b>Autor:</b> {item.autor}</p>
              <p><b>Fecha subida:</b> {item.fecha_subida}</p>
              <p><b>Tipo:</b> {item.tipo}</p>
              <p><b>Formato:</b> {item.formato}</p>
              <div className="admin-prod-actions">
                <button className="modificar-btn" onClick={() => handleEditar(item)}>Modificar</button>
                <button className="eliminar-btn" onClick={() => handleEliminar(item.id_contenido)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mostrarFormulario && (
        <div className="admin-prod-form-modal">
          <div className="admin-prod-form">
            <button className="volver-btn" onClick={() => { limpiarFormulario(); setMostrarFormulario(false); }}>← Volver</button>
            <h3 style={{ marginBottom: 10, color: 'var(--celeste)', fontWeight: 800, fontSize: '1.35rem' }}>
              {editando ? "Editar contenido" : "Agregar contenido"}
            </h3>
            <input name="nombre" value={form.nombre} onChange={handleInputChange} placeholder="Nombre *" required />
            <input name="autor" value={form.autor} onChange={handleInputChange} placeholder="Autor *" />
            <input name="archivo" value={form.archivo} onChange={handleInputChange} placeholder="URL del archivo *" />
            <select name="tipo" value={form.tipo} onChange={handleInputChange}>
              <option value="Imagen">Imagen</option>
              <option value="Video">Video</option>
              <option value="Audio">Audio</option>
            </select>
            <input name="formato" value={form.formato} onChange={handleInputChange} placeholder="Formato *" />
            <input name="tamanio" value={form.tamanio} onChange={handleInputChange} placeholder="Tamaño (MB)" />
            <input name="calidad" value={form.calidad} onChange={handleInputChange} placeholder="Calidad" />
            <input name="id_admin" value={form.id_admin} onChange={handleInputChange} placeholder="ID Admin *" />
            <input name="precio" value={form.precio} onChange={handleInputChange} placeholder="Precio *" type="number" />
            <select name="id_categoria" value={form.id_categoria} onChange={handleInputChange}>
              <option value="">Selecciona una categoría *</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
            <textarea name="descripcion" value={form.descripcion} onChange={handleInputChange} placeholder="Descripción (opcional)" />
            <div style={{ marginTop: 15, display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              {editando ? (
                <>
                  <button className="modificar-btn" onClick={handleActualizar}>Actualizar</button>
                  <button className="eliminar-btn" onClick={() => { limpiarFormulario(); setMostrarFormulario(false); }}>Cancelar</button>
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
