import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DetalleProducto.css';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    async function fetchProducto() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al cargar producto:', error);
      } else {
        setProducto(data);
      }
    }

    fetchProducto();
  }, [id]);

  if (!producto) return <div>Cargando producto...</div>;

  return (
    <div className="detalle-producto-container">
      {/* Encabezado */}
      <header className="top-bar">
        <h1>Resources store</h1>
        <div className="top-info">
          <span>Mi saldo: $400</span>
          <span>USER_1</span>
        </div>
      </header>

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

        {/* Contenido */}
        <section className="recomendaciones">
          <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>⬅ Volver</button>

          <h2>{producto.nombre}</h2>
          <img
            src={producto.url_imagen}
            alt={producto.nombre}
            style={{ width: '300px', margin: '1rem 0' }}
          />
          <p><strong>Descripción:</strong> {producto.descripcion}</p>
          <p><strong>Categoría:</strong> {producto.categoria_id}</p>
          <p><strong>Subcategoría:</strong> {producto.subcategoria_id}</p>

          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={() => alert('Añadido al carrito')} style={{ marginRight: '1rem' }}>
              🛒 Añadir al carrito
            </button>
            <button onClick={() => alert('Añadido a favoritos')}>
              ❤️ Añadir a favoritos
            </button>
          </div>
        </section>

        {/* Sección derecha vacía o para destacados si deseas agregar */}
        <aside className="destacados"></aside>
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

export default DetalleProducto;
