import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traerContenido } from './traerContenido';
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import './CarruselOfertas.css';
import Header from './C19header';

function Bienvenida() {
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [filteredContenidos, setFilteredContenidos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [usuario, setUsuario] = useState<{ id_user: number, nombre_usuario: string, saldo: number } | null>(null);
  const [page, setPage] = useState(1);
  const [videosDestacados, setVideosDestacados] = useState<any[]>([]);
  const [imagenesDestacadas, setImagenesDestacadas] = useState<any[]>([]);
  const [audiosDestacados, setAudiosDestacados] = useState<any[]>([]);
  const [tipo, setTipo] = useState('');
  const [showRecarga, setShowRecarga] = useState(false);
  const [montoRecarga, setMontoRecarga] = useState('');
  const [recargaError, setRecargaError] = useState('');
  const [recargaLoading, setRecargaLoading] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDatos() {
      const contenidosData = await traerContenido();
      setContenidos(contenidosData);
      setFilteredContenidos(contenidosData);

      const { data: catData } = await supabase.from('categorias').select('*');
      setCategorias(catData || []);

    
    }

    fetchDatos();
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      const usuarioData = await obtenerUsuario();
      if (usuarioData) {
        setUsuario(usuarioData);
      }
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarDestacados = async () => {
      const vids = await cargarContenidosDestacados('Video');
      const imgs = await cargarContenidosDestacados('Imagen');
      const auds = await cargarContenidosDestacados('Audio');
      setVideosDestacados(vids);
      setImagenesDestacadas(imgs);
      setAudiosDestacados(auds);
    };
    cargarDestacados();
  }, []);

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

  const cargarContenidosDestacados = async (tipo: string) => {
    try {
      const { data: descargasData } = await supabase
        .from('descargas')
        .select('id_contenido')
        .eq('descargado', true);

      const idsContenidos = descargasData.map((d: any) => d.id_contenido);

      const { data: contenidosData } = await supabase
        .from('contenido')
        .select('*')
        .in('id_contenido', idsContenidos)
        .eq('tipo', tipo)
        .limit(3);

      return contenidosData;
    } catch (error) {
      console.error(`Error al cargar ${tipo}s destacados:`, error);
      return [];
    }
  };

const filtrarContenidos = (query: string, categoria: string, tipo: string) => {
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

  if (tipo) {
    filtered = filtered.filter((contenido) => contenido.tipo === tipo);
  }

  setFilteredContenidos(filtered);
  setPage(1);
};


const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setBusqueda(query);
  filtrarContenidos(query, categoria, tipo);
};
const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selected = e.target.value;
  setCategoria(selected);
  filtrarContenidos(busqueda, selected, tipo);
};

const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selected = e.target.value;
  setTipo(selected);
  filtrarContenidos(busqueda, categoria, selected);
};

  const handleAgregarAlCarrito = async (contenidoId: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      const { data: existente } = await supabase
        .from("carrito")
        .select("*")
        .match({ id_user: userId, id_contenido: contenidoId });
      if (existente.length > 0) {
        alert("Ya está en el carrito");
        return;
      }
      const { error: insertError } = await supabase
        .from("carrito")
        .insert([{ id_user: userId, id_contenido: contenidoId }]);
      if (insertError) throw insertError;
      return 'Producto agregado a carrito con éxito.';
    } catch (err) {
      console.error("Error al añadir al carrito:", err);
    }
  };

  // RECARGA: Lógica para solicitar recarga
  const handleSolicitarRecarga = async () => {
  setRecargaLoading(true);
  setRecargaError('');
  if (!usuario) {
    setRecargaError('Debes iniciar sesión');
    setRecargaLoading(false);
    return;
  }
  const montoNumber = parseFloat(montoRecarga);

  if (isNaN(montoNumber) || montoNumber <= 0) {
    setRecargaError('Ingresa un monto válido');
    setRecargaLoading(false);
    return;
  }

  // Opcional: log para depurar
  console.log({
    fecha_recarga: new Date().toISOString(),
    monto: montoNumber,
    id_admin: null,
    id_user: Number(usuario.id_user),
    aceptada: null
  });

  const { error } = await supabase.from('recarga').insert([
    {
      fecha_recarga: new Date().toISOString(), // timestamp
      monto: montoNumber,                      // numeric
      id_admin: null,                          // int4 (o el id del admin si aplica)
      id_user: Number(usuario.id_user),        // int4
      aceptada: null                           // bool (o true/false)
    }
  ]);
  setRecargaLoading(false);
  if (error) {
    setRecargaError('Error al solicitar recarga: ' + error.message);
    console.error(error);
  } else {
    setShowRecarga(false);
    setMontoRecarga('');
    alert("Solicitud de recarga enviada.");
  }
};
  const totalPages = Math.ceil(filteredContenidos.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentContenidos = filteredContenidos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="principal-container">
      {/* PASA la prop para que el botón del Header abra el modal */}
      <Header F01-onRecargarClick={() => setShowRecarga(true)} />

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

        {/* Tarjetita de recarga */}
        {showRecarga && (
          <div className="recarga-card" style={{
            position: 'fixed',
            zIndex: 10,
            left: 0, right: 0, top: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 32px #999',
              minWidth: '320px',
              maxWidth: '90vw'
            }}>
              <h3>Solicitar recarga</h3>
              <label>Monto a recargar:</label>
              <input
                type="number"
                value={montoRecarga}
                onChange={e => setMontoRecarga(e.target.value)}
                placeholder="Ingresa el monto"
                min="1"
                step="0.01"
                style={{ margin: '0.5rem 0', width: '100%' }}
              />
              {recargaError && <div style={{ color: "red", marginBottom: '.5rem' }}>{recargaError}</div>}
              <div style={{ marginTop: 10 }}>
                <button onClick={handleSolicitarRecarga} disabled={recargaLoading}>
                  {recargaLoading ? "Enviando..." : "Aceptar"}
                </button>
                <button onClick={() => setShowRecarga(false)} style={{ marginLeft: 10 }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="recomendaciones">
          <h3>Explorar Contenidos</h3>
          {<div className="filtros busqueda">
            <input type="text" placeholder="Buscar contenido..." value={busqueda} onChange={handleBusqueda} />
            {/*<select value={categoria} onChange={handleCategoriaChange}>
              <option value="">Todas las Categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
            <select value={tipo} onChange={handleTipoChange}>
              <option value="">Todos los Tipos</option>
              <option value="Video">Video</option>
              <option value="Imagen">Imagen</option>
              <option value="Audio">Audio</option>
            </select>*/}
          </div>}

          <div className="cards">
            {currentContenidos.map((contenido) => (
              <div className="card" key={contenido.id_contenido}>
                <img
                  src={contenido.archivo}
                  alt={contenido.nombre}
                  onClick={() => navigate(`/contenido/${contenido.id_contenido}`)}
                  style={{ cursor: 'pointer' }}
                />
                <p onClick={() => navigate(`/contenido/${contenido.id_contenido}`)} style={{ cursor: 'pointer', fontWeight: 500 }}>{contenido.nombre}</p>
                <div className="botones">
                  <button onClick={async () => {
                    const usuario = await obtenerUsuario();
                    if (!usuario) return alert('Debes iniciar sesión');
                    const mensaje = await handleAgregarAlCarrito(contenido.id_contenido);
                    alert(mensaje);
                  }}>🛒</button>
                  <button onClick={async () => {
                    const usuario = await obtenerUsuario();
                    if (!usuario) return alert('Debes iniciar sesión');
                    const mensaje = await agregarAFavoritos(contenido.id_contenido, usuario.id_user);
                    alert(mensaje);
                  }}>❤️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="botones-paginacion">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index} className={page === index + 1 ? 'activo' : ''} onClick={() => setPage(index + 1)}>
                {index + 1}
              </button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>&gt;</button>
          </div>
        </section>

        <aside className="destacados">
          <h4>Videos Destacados</h4>
          <ul>
            {videosDestacados.map((v) => (
              <li key={v.id_contenido}>{v.nombre}</li>
            ))}
          </ul>
          <h4>Imágenes Destacadas</h4>
          <ul>
            {imagenesDestacadas.map((i) => (
              <li key={i.id_contenido}>{i.nombre}</li>
            ))}
          </ul>
          <h4>Audios Destacados</h4>
          <ul>
            {audiosDestacados.map((a) => (
              <li key={a.id_contenido}>{a.nombre}</li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default Bienvenida;