import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traer_Productos } from './traer_Productos';  // Importa la función para obtener productos
import { useState, useEffect } from 'react';

function Bienvenida() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  // Obtener productos d  e la base de datos al cargar el componente
  useEffect(() => {
    async function fetchProductos() {
      const productosData = await traer_Productos();
      setProductos(productosData);
      setFilteredProductos(productosData);
    }
    
    fetchProductos();
  }, []);

  // Manejar cambio en el campo de búsqueda
  const handleBusqueda = (e) => {
    const query = e.target.value.toLowerCase();
    setBusqueda(query);

    // Filtrar productos por nombre, categoria o subcategoria
    const filtered = productos.filter((producto) => {
      return (
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
      );
    });
    setFilteredProductos(filtered);
  };

  return (
    <div className="principal-container">
      {/* Header */}
      <header className="top-bar">
        <h1>Resources store</h1>
        <div className="top-info">
          <span>Mi saldo: $400</span>
          <span>USER_1</span>
        </div>
      </header>

      {/* Carrusel */}
      <section>
        <CarruselOfertas />
      </section>

      <main className="contenido-principal">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li onClick={() => navigate("/")}>Inicio</li>
            <li onClick={() => navigate("/carrito")}>Carrito</li>
            <li onClick={() => navigate("/descargas")}>Descargas</li>
            <li onClick={() => navigate("/favoritos")}>Favoritos</li>
            <li>Categorías</li>
            <li>Imágenes</li>
            <li>Videos</li>
          </ul>
        </aside>

        {/* Contenido central */}
        <section className="recomendaciones">
          <h3>Imágenes Que Te Pueden Gustar</h3>
          <div className="busqueda">
            <input
              type="text"
              id="buscador"
              placeholder="Buscar contenido..."
              value={busqueda}
              onChange={handleBusqueda}
            />
          </div>

          <div className="cards">
            {filteredProductos.map((producto) => (
              <div className="card" key={producto.id}>
                <img src={producto.url_imagen} alt={producto.nombre} />
                <p>
                  {producto.nombre}
                  <br />
                  Desde $5.00
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Barra lateral derecha */}
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

      {/* Pie de página */}
      <footer className="footer">
        <span>© 2025 Resources Store</span>
        <div className="social">
          <img src="https://img.freepik.com/vector-gratis/nuevo-diseno-icono-x-logotipo-twitter-2023_1017-45418.jpg?semt=ais_hybrid&w=740" alt="X" />
          <img src="https://cdn2.iconfinder.com/data/icons/2018-social-media-app-logos/1000/2018_social_media_popular_app_logo_instagram-512.png" alt="Instagram" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/960px-LinkedIn_logo_initials.png" alt="LinkedIn" />
        </div>
      </footer>
    </div>
  );
}

export default Bienvenida;