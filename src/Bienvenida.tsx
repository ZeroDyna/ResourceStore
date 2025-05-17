import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traer_Productos } from './traer_Productos';
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import './CarruselOfertas.css';

function Bienvenida() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProductos() {
      const productosData = await traer_Productos();
      setProductos(productosData);
      setFilteredProductos(productosData.slice(0, 3)); // Mostrar solo 1 recomendación al inicio
    }

    async function fetchCategorias() {
      const { data, error } = await supabase.from('categorias').select('*');
      if (error) {
        console.error('Error al obtener categorías:', error);
      } else {
        setCategorias(data || []);
      }
    }

    async function fetchSubcategorias() {
      const { data, error } = await supabase.from('subcategorias').select('*');
      if (error) {
        console.error('Error al obtener subcategorías:', error);
      } else {
        setSubcategorias(data || []);
      }
    }

    fetchProductos();
    fetchCategorias();
    fetchSubcategorias();
  }, []);

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setBusqueda(query);
    filtrarProductos(query, categoria, subcategoria);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoria = e.target.value;
    setCategoria(selectedCategoria);
    filtrarProductos(busqueda, selectedCategoria, subcategoria);
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubcategoria = e.target.value;
    setSubcategoria(selectedSubcategoria);
    filtrarProductos(busqueda, categoria, selectedSubcategoria);
  };

  const filtrarProductos = (query: string, categoria: string, subcategoria: string) => {
    let filtered = productos;

    if (query) {
      filtered = filtered.filter((producto: any) =>
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
      );
    }

    if (categoria) {
      filtered = filtered.filter((producto: any) => producto.categoria_id == categoria);
    }

    if (subcategoria) {
      filtered = filtered.filter((producto: any) => producto.subcategoria_id == subcategoria);
    }

    setFilteredProductos(filtered);
    setPage(1);
  };

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const agregarACarrito = async (productoId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes iniciar sesión');
        return;
      }

      const { data: carritoExistente, error: errorBuscar } = await supabase
        .from('carritos')
        .select('id')
        .eq('usuario_id', user.id)
        .maybeSingle();

      if (errorBuscar) throw errorBuscar;

      let carritoId = carritoExistente?.id;
      if (!carritoId) {
        const { data: nuevoCarrito, error: errorCrear } = await supabase
          .from('carritos')
          .insert({ usuario_id: user.id })
          .select()
          .single();

        if (errorCrear) throw errorCrear;
        carritoId = nuevoCarrito.id;
      }

      const { error: errorDetalle } = await supabase
        .from('detalle_carrito')
        .insert([{ carrito_id: carritoId, producto_id: productoId }]);

      if (errorDetalle) throw errorDetalle;

      alert('Producto agregado al carrito con éxito.');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="principal-container">
      <header className="top-bar">
        <h1>Resources Store</h1>
        <div className="top-info">
          <span>Mi saldo: $400</span>
          <span>USER_1</span>
        </div>
      </header>

      <section>
        <CarruselOfertas />
      </section>

      <main className="contenido-principal">
        <aside className="sidebar">
          <ul>
            <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
            <li onClick={() => navigate("/carrito")}>Carrito</li>
            <li onClick={() => navigate("/descargas")}>Descargas</li>
            <li onClick={() => navigate("/favoritos")}>Favoritos</li>
          </ul>
        </aside>

        <section className="recomendaciones">
          <h3>Explorar Productos</h3>
          <div className="filtros busqueda">
            <input
              type="text"
              id="buscador"
              placeholder="Buscar contenido..."
              value={busqueda}
              onChange={handleBusqueda}
            />
            <select id="categoria" value={categoria} onChange={handleCategoriaChange}>
              <option value="">Todas las Categorías</option>
              {categorias.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <select id="subcategoria" value={subcategoria} onChange={handleSubcategoriaChange}>
              <option value="">Todas las Subcategorías</option>
              {subcategorias.map((subcat: any) => (
                <option key={subcat.id} value={subcat.id}>{subcat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="cards">
            {currentProductos.map((producto: any) => (
              <div className="card" key={producto.id}>
                <img
                  src={producto.url_imagen}
                  alt={producto.nombre}
                  onClick={() => navigate(`/producto/${producto.id}`)}
                  style={{ cursor: 'pointer' }}
                />
                <p>{producto.nombre}</p>
                <div className="botones">
                  <button onClick={() => agregarACarrito(producto.id)} style={{ marginRight: '1rem' }}>
                    🛒 
                  </button>
                  <button
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        alert('Debes iniciar sesión');
                        return;
                      }

                      const mensaje = await agregarAFavoritos(producto.id, user.id);
                      alert(mensaje);
                    }}
                    style={{ marginRight: '1rem' }}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="botones-paginacion">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={page === index + 1 ? 'activo' : ''}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              &gt;
            </button>
          </div>
        </section>

        <aside className="destacados">
          <h4>Videos Destacados</h4>
          <ul>
            <li>Video1.MP4</li>
            <li>Video2.AVI</li>
            <li>Video3.MKV</li>
          </ul>

          <h4>Imágenes Destacadas</h4>
          <ul>
            <li>Imagen1.PNG</li>
            <li>Imagen2.WEBP</li>
            <li>Imagen3.JPG</li>
          </ul>

          <h4>Audios Destacados</h4>
          <ul>
            <li>Audio1.MP3</li>
            <li>Audio2.WAV</li>
            <li>Audio3.OGG</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default Bienvenida;