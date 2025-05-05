import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DetalleProducto.css';
import { agregarAFavoritos } from './Gestor_Favoritos';
import { agregarACarrito } from './agregarAlCarrito';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducto() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('No se pudo cargar el producto.');
          console.error('Error al cargar producto:', error);
        } else {
          setProducto(data);
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        setError('Ocurrió un error inesperado.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProducto();
    } else {
      setError('No se proporcionó un ID válido.');
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="loading">Cargando producto...</div>;

  if (error) return <div className="error">{error}</div>;

  if (!producto) return <div className="error">Producto no encontrado.</div>;

  return (
    <div className="detalle-producto-container">
      <header className="top-bar">
        <h1>Resources Store</h1>
        <div className="top-info">
          <span>Mi saldo: $400</span>
          <span>USER_1</span>
        </div>
      </header>

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
          <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>⬅ Volver</button>

          <h2>{producto.nombre || 'Nombre no disponible'}</h2>
          <img
            src={producto.url_imagen || 'https://via.placeholder.com/300'}
            alt={producto.nombre || 'Producto'}
            style={{ width: '300px', margin: '1rem 0' }}
          />
          <p><strong>Descripción:</strong> {producto.descripcion || 'No disponible'}</p>
          <p><strong>Categoría:</strong> {producto.categoria_id || 'No disponible'}</p>
          <p><strong>Subcategoría:</strong> {producto.subcategoria_id || 'No disponible'}</p>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  alert('Debes iniciar sesión');
                  return;
                }

                const mensaje = await agregarACarrito(producto.id, user.id);
                alert(mensaje);
              }}
              style={{ marginRight: '1rem' }}
            >
              🛒 Añadir al carrito
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
              ❤️ Agregar a Favoritos
            </button>
          </div>
        </section>
      </main>

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