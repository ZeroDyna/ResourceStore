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
}

export default function AdminContenido() {
  const [contenido, setContenido] = useState<Contenido[]>([]);
  const [form, setForm] = useState<Omit<Contenido, 'id_contenido'>>({
    nombre: '',
    autor: '',
    archivo: '',
    fecha_subida: '',
    tipo: '',
    formato: '',
  });
  const [editando, setEditando] = useState<Contenido | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerContenido();
  }, []);

  const obtenerContenido = async () => {
    const { data, error } = await supabase.from('contenido').select('*');
    if (error) {
      alert("Error al obtener contenido");
      return;
    }
    setContenido(data || []);
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: '',
      autor: '',
      archivo: '',
      fecha_subida: '',
      tipo: '',
      formato: '',
    });
    setEditando(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const prepararDatos = () => {
    const datos = { ...form };
    Object.keys(datos).forEach(key => {
      if (datos[key as keyof typeof datos] === '') {
        datos[key as keyof typeof datos] = null;
      }
    });
    return datos;
  };

  const handleAgregar = async () => {
    const datos = prepararDatos();
    if (!datos.nombre) {
      alert("El campo 'nombre' es obligatorio.");
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
      nombre: item.nombre ?? '',
      autor: item.autor ?? '',
      archivo: item.archivo ?? '',
      fecha_subida: item.fecha_subida ? item.fecha_subida.substring(0, 16) : '',
      tipo: item.tipo ?? '',
      formato: item.formato ?? '',
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

      {/* Botones debajo del título */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="admin-add-product-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
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
            <button
              className="volver-btn"
              onClick={() => {
                limpiarFormulario();
                setMostrarFormulario(false);
              }}
            >
              ← Volver
            </button>
            <h3 style={{marginBottom:10, color:'var(--celeste)', fontWeight:800, fontSize:'1.35rem'}}>
              {editando ? "Editar contenido" : "Agregar contenido"}
            </h3>
            <input name="nombre" value={form.nombre ?? ''} onChange={handleInputChange} placeholder="Nombre *" required />
            <input name="autor" value={form.autor ?? ''} onChange={handleInputChange} placeholder="Autor" />
            <input name="archivo" value={form.archivo ?? ''} onChange={handleInputChange} placeholder="URL o ruta de imagen" />
            <input name="fecha_subida" type="datetime-local" value={form.fecha_subida ?? ''} onChange={handleInputChange} placeholder="Fecha subida" />
            <input name="tipo" value={form.tipo ?? ''} onChange={handleInputChange} placeholder="Tipo" />
            <input name="formato" value={form.formato ?? ''} onChange={handleInputChange} placeholder="Formato" />
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
