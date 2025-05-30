import React, { useEffect, useState } from 'react';
import { Gestor_Producto } from './Gestor_producto';
import { Producto } from './Producto';
import './AdminProductos.css';
export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Producto, 'id'>>({
    nombre: '',
    descripcion: '',
    autor: '',
    precio: 0,
    calificacion: 0,
    categoria: '',
    admin_creador_id: '',
    fecha_creacion: '',
    fecha_actualizacion: '',
    activo: true,
    url_imagen: '',
  });
  const [editando, setEditando] = useState<Producto | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const lista = await Gestor_Producto.listarProductos();
      setProductos(lista);
    } catch (e) {
      alert("Error al listar productos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleAgregar = async () => {
    try {
      await Gestor_Producto.crearProducto(form);
      setForm({
        nombre: '',
        descripcion: '',
        autor: '',
        precio: 0,
        calificacion: 0,
        categoria: '',
        admin_creador_id: '',
        fecha_creacion: '',
        fecha_actualizacion: '',
        activo: true,
        url_imagen: '',
      });
      setShowForm(false);
      fetchProductos();
    } catch (e) {
      alert("Error al agregar producto");
    }
  };

  const handleEditar = (prod: Producto) => {
    setEditando(prod);
    setForm({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      autor: prod.autor,
      precio: prod.precio,
      calificacion: prod.calificacion,
      categoria: prod.categoria,
      admin_creador_id: prod.admin_creador_id,
      fecha_creacion: prod.fecha_creacion,
      fecha_actualizacion: prod.fecha_actualizacion,
      activo: prod.activo,
      url_imagen: prod.url_imagen,
    });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await Gestor_Producto.editarProducto(editando.id, form);
      setEditando(null);
      setShowForm(false);
      setForm({
        nombre: '',
        descripcion: '',
        autor: '',
        precio: 0,
        calificacion: 0,
        categoria: '',
        admin_creador_id: '',
        fecha_creacion: '',
        fecha_actualizacion: '',
        activo: true,
        url_imagen: '',
      });
      fetchProductos();
    } catch (e) {
      alert("Error al actualizar producto");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    try {
      await Gestor_Producto.eliminarProducto(id);
      fetchProductos();
    } catch (e) {
      alert("Error al eliminar producto");
    }
  };

  return (
    <div className="admin-prod-container">
      <h2 className="admin-title">Interfaz de Gestión de Administrador</h2>
      <div className="admin-prod-list">
        {productos.map(prod => (
          <div className="admin-prod-card" key={prod.id}>
            <div className="admin-prod-img">
              <img
                src={prod.url_imagen || "/placeholder.png"}
                alt={prod.nombre}
                onError={e => (e.currentTarget.src = "/placeholder.png")}
              />
            </div>
            <div className="admin-prod-info">
              <h4>{prod.nombre}</h4>
              <p className="admin-prod-desc">{prod.descripcion || "Sin descripción..."}</p>
              <div className="admin-prod-actions">
                <button className="modificar-btn" onClick={() => handleEditar(prod)}>Modificar</button>
                <button className="eliminar-btn" onClick={() => handleEliminar(prod.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Botón grande para agregar producto */}
      <div className="admin-add-product-container">
        <button className="admin-add-product-btn" onClick={() => { setEditando(null); setShowForm(!showForm); }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Producto
        </button>
      </div>
      {/* Formulario modal/incrustado */}
      {showForm && (
        <div className="admin-prod-form-modal">
          <div className="admin-prod-form">
            <h3>{editando ? "Editar producto" : "Agregar producto"}</h3>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" />
            <input name="autor" value={form.autor} onChange={handleChange} placeholder="Autor" />
            <input name="precio" value={form.precio} onChange={handleChange} placeholder="Precio" type="number" step="0.01" />
            <input name="url_imagen" value={form.url_imagen} onChange={handleChange} placeholder="URL imagen" />
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