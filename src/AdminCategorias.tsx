import React, { useEffect, useState } from 'react';
import { Gestor_Categoria } from './Gestor_categoria';
import { Categoria } from './Categoria';
import { Gestor_Producto } from './Gestor_producto';
import { Producto } from './Producto';
import './AdminCategorias.css';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Categoria, 'id'>>({ nombre: '', categoria_padre: null });
  const [editando, setEditando] = useState<Categoria | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        Gestor_Categoria.listarCategorias(),
        Gestor_Producto.listarProductos()
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (e) {
      alert("Error al listar categorías/productos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "categoria_padre"
        ? (value === "" ? null : Number(value))
        : value
    }));
  };

  const handleAgregar = async () => {
    try {
      await Gestor_Categoria.crearCategoria(form.nombre, form.categoria_padre);
      setForm({ nombre: '', categoria_padre: null });
      setShowForm(false);
      fetchData();
    } catch (e) {
      alert("Error al agregar categoría");
    }
  };

  const handleEditar = (cat: Categoria) => {
    setEditando(cat);
    setForm({ nombre: cat.nombre, categoria_padre: cat.categoria_padre ?? null });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await Gestor_Categoria.actualizarCategoria(editando.id, form.nombre, form.categoria_padre);
      setEditando(null);
      setShowForm(false);
      setForm({ nombre: '', categoria_padre: null });
      fetchData();
    } catch (e) {
      alert("Error al actualizar categoría");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    try {
      await Gestor_Categoria.eliminarCategoria(id);
      fetchData();
    } catch (e) {
      alert("Error al eliminar categoría");
    }
  };

  // Obtiene la imagen de un producto de la categoría, o placeholder si no hay
  const obtenerImagenCategoria = (categoriaId: number) => {
    const prod = productos.find(p => p.categoria === categoriaId && !!p.url_imagen);
    return prod?.url_imagen || "/folder-placeholder.png";
  };

  return (
    <div className="admin-cat-container">
      <h2 className="admin-title">Gestión de Categorías</h2>
      <div className="admin-cat-list">
        {categorias.map(cat => (
          <div className="admin-cat-card" key={cat.id}>
            <div className="admin-cat-img">
              <img
                src={obtenerImagenCategoria(cat.id)}
                alt={cat.nombre}
                onError={e => {
                  if (e.currentTarget.src !== window.location.origin + "/folder-placeholder.png") {
                    e.currentTarget.src = "/folder-placeholder.png";
                  }
                }}
              />
            </div>
            <div className="admin-cat-info">
              <h4>{cat.nombre}</h4>
              <p className="admin-cat-desc">
                {cat.categoria_padre
                  ? `Subcategoría de: ${categorias.find(c => c.id === cat.categoria_padre)?.nombre || 'N/A'}`
                  : "Categoría principal"}
              </p>
              <div className="admin-cat-actions">
                <button className="modificar-btn" onClick={() => handleEditar(cat)}>Modificar</button>
                <button className="eliminar-btn" onClick={() => handleEliminar(cat.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Botón grande para agregar categoría */}
      <div className="admin-add-cat-container">
        <button className="admin-add-cat-btn" onClick={() => { setEditando(null); setShowForm(!showForm); }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Categoría
        </button>
      </div>
      {/* Formulario modal/incrustado */}
      {showForm && (
        <div className="admin-cat-form-modal">
          <div className="admin-cat-form">
            <h3>{editando ? "Editar categoría" : "Agregar categoría"}</h3>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre de la categoría"
            />
            <select name="categoria_padre" value={form.categoria_padre ?? ''} onChange={handleChange}>
              <option value="">Categoría principal</option>
              {categorias
                .filter(c => !editando || c.id !== editando.id)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
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