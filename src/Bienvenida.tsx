import { useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traer_Productos } from './traer_Productos';
import { useState, useEffect } from 'react';

function Bienvenida() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1); // Página actual
  const [itemsPerPage, setItemsPerPage] = useState(4); // Cantidad de tarjetas por página
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProductos() {
      const productosData = await traer_Productos();
      setProductos(productosData);
      setFilteredProductos(productosData);
    }

    fetchProductos();
  }, []);

  const handleBusqueda = (e) => {
    const query = e.target.value.toLowerCase();
    setBusqueda(query);

    const filtered = productos.filter((producto) => {
      return (
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
      );
    });
    setFilteredProductos(filtered);
    setPage(1); // Reiniciar a la primera página cuando se realiza una búsqueda
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setPage(1); // Reiniciar a la primera página cuando cambia la cantidad de tarjetas
  };

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Productos que se mostrarán en la página actual
  const startIndex = (page - 1) * itemsPerPage;
  const currentProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

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
            <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
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

          <div className="pagination-controls">
            <label htmlFor="itemsPerPage">Tarjetas por página:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>

          <div className="cards">
            {currentProductos.map((producto) => (
              <div
                className="card"
                key={producto.id}
                onClick={() => navigate(`/producto/${producto.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={producto.url_imagen} alt={producto.nombre} />
                <p>
                  {producto.nombre}
                  <br />
                  Desde $5.00
                </p>
              </div>
            ))}
          </div>

          <div className="pagination-buttons">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              &lt; {/* Botón de página anterior */}
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={page === index + 1 ? 'active' : ''}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              &gt; {/* Botón de página siguiente */}
            </button>
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