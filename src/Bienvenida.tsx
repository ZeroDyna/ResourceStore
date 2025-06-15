import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traerContenido } from './traerContenido'; // Ajusta el nombre si cambiaste el archivo.
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import './CarruselOfertas.css';

function Bienvenida() {
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [filteredContenidos, setFilteredContenidos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDatos() {
      const contenidosData = await traerContenido();
      setContenidos(contenidosData);
      setFilteredContenidos(contenidosData);

      const { data: catData, error: catError } = await supabase.from('categorias').select('*');
      if (!catError) setCategorias(catData || []);

      const { data: subData, error: subError } = await supabase.from('categorias').select('*');
      if (!subError) setSubcategorias(subData?.filter(c => c.id_categoria_padre !== null) || []);
    }

    fetchDatos();
  }, []);

  const filtrarContenidos = (query: string, categoria: string, subcategoria: string) => {
    let filtered = contenidos;

    if (query) {
      filtered = filtered.filter((contenido) =>
        contenido.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (contenido.autor?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
    }

    if (categoria) {
      filtered = filtered.filter((contenido) => contenido.id_categoria === parseInt(categoria));
    }

    if (subcategoria) {
      filtered = filtered.filter((contenido) => contenido.id_categoria === parseInt(subcategoria));
    }

    setFilteredContenidos(filtered);
    setPage(1);
  };

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBusqueda(query);
    filtrarContenidos(query, categoria, subcategoria);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCategoria(selected);
    filtrarContenidos(busqueda, selected, subcategoria);
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSubcategoria(selected);
    filtrarContenidos(busqueda, categoria, selected);
  };

  const totalPages = Math.ceil(filteredContenidos.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentContenidos = filteredContenidos.slice(startIndex, startIndex + itemsPerPage);

  // Helper para obtener usuario actual (por email)
  const obtenerUsuario = async () => {
    const email = sessionStorage.getItem('user_email');
    if (!email) return null;
    const { data: usuario } = await supabase
      .from('usuario')  
      .select('id_user, nombre_usuario, email, saldo')
      .eq('email', email)
      .maybeSingle();
    return usuario;
  };

  const agregarACarrito = async (id_contenido: number) => {
    try {
      const usuario = await obtenerUsuario();
      if (!usuario) {
        alert('Debes iniciar sesión');
        return;
      }

      const { data: carrito, error: errorBuscar } = await supabase
        .from('carrito')
        .select('id_carrito')
        .eq('id_user', usuario.id_user)
        .maybeSingle();

      let carritoId = carrito?.id_carrito;

      if (!carritoId) {
        const { data: nuevo, error: errorCrear } = await supabase
          .from('carrito')
          .insert({ id_user: usuario.id_user, monto_total: 0, monto_a_pagar: 0 })
          .select()
          .single();

        if (errorCrear) throw errorCrear;
        carritoId = nuevo.id_carrito;
      }

      const { error: errorInsertar } = await supabase
        .from('detalle_carrito')
        .insert({ id_carrito: carritoId, id_contenido });

      if (errorInsertar) throw errorInsertar;

      alert('Contenido agregado al carrito con éxito.');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito.');
    }
  };

  return (
    <div className="principal-container">
      <header className="top-bar">
        <h1>Resources Store</h1>
        <div className="top-info">
          <span>Mi saldo: ${/* puedes mostrar el saldo si lo guardas en sessionStorage o con el usuario */}</span>
          <span>{sessionStorage.getItem('user_email') || 'Invitado'}</span>
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
          <h3>Explorar Contenidos</h3>
          <div className="filtros busqueda">
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={busqueda}
              onChange={handleBusqueda}
            />
            <select value={categoria} onChange={handleCategoriaChange}>
              <option value="">Todas las Categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
            <select value={subcategoria} onChange={handleSubcategoriaChange}>
              <option value="">Todas las Subcategorías</option>
              {subcategorias.map((sub) => (
                <option key={sub.id_categoria} value={sub.id_categoria}>{sub.nombre}</option>
              ))}
            </select>
          </div>

          <div className="cards">
            {currentContenidos.map((contenido) => (
              <div className="card" key={contenido.id_contenido}>
                <img
                  src={contenido.archivo}
                  alt={contenido.nombre}
                  onClick={() => navigate(`/contenido/${contenido.id_contenido}`)}
                  style={{ cursor: 'pointer' }}
                />
                <p
                  style={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate(`/contenido/${contenido.id_contenido}`)}
                >
                  {contenido.nombre}
                </p>
                <div className="botones">
                  <button onClick={() => agregarACarrito(contenido.id_contenido)} style={{ marginRight: '1rem' }}>🛒</button>
                  <button
                    onClick={async () => {
                      const usuario = await obtenerUsuario();
                      if (!usuario) {
                        alert('Debes iniciar sesión');
                        return;
                      }
                      const mensaje = await agregarAFavoritos(contenido.id_contenido, usuario.id_user);
                      alert(mensaje);
                    }}
                    style={{ marginRight: '1rem' }}
                  >❤️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="botones-paginacion">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={page === index + 1 ? 'activo' : ''}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>&gt;</button>
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