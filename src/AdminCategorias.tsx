import React, { useEffect, useState } from 'react';
import { Gestor_Categoria, Categoria } from './Gestor_categoria';
import './AdminCategorias.css';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Categoria, never>>({
    id_categoria: 0,
    nombre: '',
    id_categoria_padre: null,
    id_admin: null,
  });
  const [editando, setEditando] = useState<Categoria | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cats = await Gestor_Categoria.listarCategorias();
      setCategorias(cats);
    } catch (e) {
      alert("Error al listar categorías");
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === "id_categoria" || name === "id_categoria_padre" || name === "id_admin"
          ? value === "" ? null : Number(value)
          : value
    }));
  };

  const handleAgregar = async () => {
    try {
      await Gestor_Categoria.crearCategoria(
        form.id_categoria,
        form.nombre,
        form.id_categoria_padre,
        form.id_admin
      );
      setForm({ id_categoria: 0, nombre: '', id_categoria_padre: null, id_admin: null });
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      if (e.code === "23505") {
        alert("El id_categoria ya existe. Por favor elige otro ID.");
      } else {
        alert("Error al agregar categoría");
      }
      console.error(e);
    }
  };

  const handleEditar = (cat: Categoria) => {
    setEditando(cat);
    setForm({
      id_categoria: cat.id_categoria,
      nombre: cat.nombre,
      id_categoria_padre: cat.id_categoria_padre ?? null,
      id_admin: cat.id_admin ?? null,
    });
    setShowForm(true);
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await Gestor_Categoria.actualizarCategoria(
        form.id_categoria,
        form.nombre,
        form.id_categoria_padre,
        form.id_admin
      );
      setEditando(null);
      setShowForm(false);
      setForm({ id_categoria: 0, nombre: '', id_categoria_padre: null, id_admin: null });
      fetchData();
    } catch (e) {
      alert("Error al actualizar categoría");
      console.error(e);
    }
  };

  const handleEliminar = async (id_categoria: number) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    try {
      await Gestor_Categoria.eliminarCategoria(id_categoria);
      fetchData();
    } catch (e) {
      alert("Error al eliminar categoría");
      console.error(e);
    }
  };

  return (
    <div className="admin-cat-container">
      <h2 className="admin-title">Gestión de Categorías</h2>
      <div className="admin-cat-list">
        {categorias.map((cat) => (
          <div className="admin-cat-card" key={cat.id_categoria}>
            <div className="admin-cat-info">
              <h4>{cat.nombre}</h4>
              <p className="admin-cat-desc">
                {cat.id_categoria_padre
                  ? `Subcategoría de: ${
                    categorias.find(c => c.id_categoria === cat.id_categoria_padre)?.nombre || 'N/A'
                  }`
                  : "Categoría principal"}
              </p>
              <p>
                <b>ID Admin:</b> {cat.id_admin ?? "N/A"}
              </p>
              <div className="admin-cat-actions">
                <button className="modificar-btn" onClick={() => handleEditar(cat)}>
                  Modificar
                </button>
                <button className="eliminar-btn" onClick={() => handleEliminar(cat.id_categoria)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-add-cat-container">
        <button
          className="admin-add-cat-btn"
          onClick={() => {
            setEditando(null);
            setShowForm(!showForm);
          }}
        >
          <span style={{ fontSize: 28, marginRight: 8 }}>+</span> Agregar Categoría
        </button>
      </div>
      {showForm && (
        <div className="admin-cat-form-modal">
          <div className="admin-cat-form">
            <h3>{editando ? "Editar categoría" : "Agregar categoría"}</h3>
            <input
              name="id_categoria"
              type="number"
              value={form.id_categoria ?? ""}
              onChange={handleChange}
              placeholder="ID Categoría"
              required
              disabled={!!editando} // No permitir cambiar id_categoria al editar
            />
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre de la categoría"
              required
            />
            <select
              name="id_categoria_padre"
              value={form.id_categoria_padre ?? ""}
              onChange={handleChange}
            >
              <option value="" key="root">Categoría principal</option>
              {categorias
                .filter(c => !editando || c.id_categoria !== editando.id_categoria)
                .map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
            </select>
            <input
              name="id_admin"
              type="number"
              value={form.id_admin ?? ""}
              onChange={handleChange}
              placeholder="ID Admin"
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