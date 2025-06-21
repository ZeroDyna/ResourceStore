import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traerContenido } from './traerContenido'; // Ajusta el nombre si cambiaste el archivo.
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import { Link } from 'react-router-dom';
import { agregarACarrito } from './agregarAlCarrito';
import './CarruselOfertas.css';
import Header from './Header';

function Bienvenida() {
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [filteredContenidos, setFilteredContenidos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [usuario, setUsuario] = useState<{ nombre_usuario: string, saldo: number } | null>(null);
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
    const user_Id = localStorage.getItem('user_id');
    if (!user_Id) return null;
    const { data: usuario } = await supabase
      .from('usuario')  
      .select('id_user, nombre_usuario, email, saldo')
      .eq('id_user', user_Id)
      .maybeSingle();
    return usuario;
  };


  const handleAgregarAlCarrito = async (contenidoId: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
  
      // Verifica si ya está en el carrito
      const { data: existente, error: existeError } = await supabase
        .from("carrito")
        .select("*")
        .match({ id_user: userId, id_contenido: contenidoId });
  
      if (existeError) throw existeError;
      if (existente.length > 0){ 
        alert("Ya está en el carrito");
        return;
      }
  
      const { error: insertError } = await supabase
        .from("carrito")
        .insert([{ id_user: userId, id_contenido: contenidoId }]);
  
      if (insertError) throw insertError;
  
      return 'Producto agregado a carrito con éxito.';
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err);
    }
  };

useEffect(() => {
  const cargarUsuario = async () => {
    const usuarioData = await obtenerUsuario();
    if (usuarioData) {
      setUsuario(usuarioData);
    }
  };

  cargarUsuario();
}, []);

  return (
    <div className="principal-container">
      <Header />

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
                  <button 
                    onClick={async () => {
                      const usuario = await obtenerUsuario();
                      if (!usuario) {
                        alert('Debes iniciar sesión');
                        return;
                      }
                      const mensaje = await handleAgregarAlCarrito(contenido.id_contenido);
                      alert(mensaje);
                    }}
                    style={{ marginRight: '1rem' }}
                    >
                    🛒</button>
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