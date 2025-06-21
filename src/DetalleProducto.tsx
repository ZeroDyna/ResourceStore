import React from 'react';
import { NavigateFunction, useParams, useNavigate, Params } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './Header';
import './DetalleProducto.css';

// HOC para pasar navigate y params a una clase
function withNavigationAndParams(Component: any) {
  return function WrappedComponent(props: any) {
    const params = useParams();
    const navigate = useNavigate();
    return <Component {...props} params={params} navigate={navigate} />;
  };
}

type Contenido = {
  id_contenido: number;
  nombre: string;
  descripcion?: string;
  autor?: string;
  archivo?: string;
  formato?: string;
  precio?: number;
};

type DetalleProductoProps = {
  params: Readonly<Params<string>>;
  navigate: NavigateFunction;
};

type DetalleProductoState = {
  contenido: Contenido | null;
  loading: boolean;
  error: string | null;
};

class DetalleProducto extends React.Component<DetalleProductoProps, DetalleProductoState> {
  constructor(props: DetalleProductoProps) {
    super(props);
    this.state = {
      contenido: null,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchContenido();
  }

  componentDidUpdate(prevProps: DetalleProductoProps) {
    if (
      this.props.params.id_contenido !== prevProps.params.id_contenido ||
      this.props.params.id !== prevProps.params.id
    ) {
      this.fetchContenido();
    }
  }

  fetchContenido = async () => {
    const id = this.props.params.id_contenido || this.props.params.id;
    if (!id) {
      this.setState({ loading: false, error: 'ID de contenido no definido.', contenido: null });
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('contenido')
        .select('*')
        .eq('id_contenido', id)
        .single();

      if (error || !data) {
        this.setState({ error: 'No se pudo cargar el contenido.', contenido: null });
      } else {
        this.setState({ contenido: data, error: null });
      }
    } catch (err) {
      this.setState({ error: 'Ocurrió un error inesperado.', contenido: null });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleAgregarAlCarrito = async (contenidoId: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert('Debes iniciar sesión');
        return;
      }

      const { data: existente, error: existeError } = await supabase
        .from("carrito")
        .select("*")
        .match({ id_user: userId, id_contenido: contenidoId });

      if (existeError) throw existeError;
      if (existente.length > 0) {
        alert("Ya está en el carrito");
        return;
      }

      const { error: insertError } = await supabase
        .from("carrito")
        .insert([{ id_user: userId, id_contenido: contenidoId }]);

      if (insertError) throw insertError;

      alert("Producto añadido al carrito");
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err);
    }
  };

  handleAgregarFavoritos = async (contenidoId: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert('Debes iniciar sesión');
        return;
      }

      const { data: existente, error: existeError } = await supabase
        .from("favoritos")
        .select("*")
        .match({ id_user: userId, id_contenido: contenidoId });

      if (existeError) throw existeError;
      if (existente.length > 0) {
        alert("Ya está en favoritos");
        return;
      }

      const { error: insertError } = await supabase
        .from("favoritos")
        .insert([{ id_user: userId, id_contenido: contenidoId }]);

      if (insertError) throw insertError;

      alert("Producto añadido a favoritos");
    } catch (err) {
      console.error("❌ Error al añadir a favoritos:", err);
    }
  };

  render() {
    const { contenido, loading, error } = this.state;
    const { navigate } = this.props;

    if (loading) return <div className="loading">Cargando recurso...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!contenido) return <div className="error">Recurso no encontrado.</div>;

    return (
      <div className="detalle-producto-container">
        <Header />

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

            <h2>{contenido.nombre || 'Nombre no disponible'}</h2>
            <img
              src={contenido.archivo || 'https://via.placeholder.com/300'}
              alt={contenido.nombre || 'Recurso'}
              style={{ width: '300px', margin: '1rem 0' }}
            />
            <p><strong>Descripción:</strong> {contenido.descripcion || 'No disponible'}</p>
            <p><strong>Autor:</strong> {contenido.autor || 'No disponible'}</p>
            <p><strong>Formato:</strong> {contenido.formato || 'No disponible'}</p>
            <p><strong>Precio:</strong> {contenido.precio || 'No disponible'}</p>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => this.handleAgregarAlCarrito(contenido.id_contenido)}
                style={{ marginRight: '1rem' }}
              >
                🛒 Añadir al carrito
              </button>

              <button
                onClick={() => this.handleAgregarFavoritos(contenido.id_contenido)}
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
            <img src="https://img.freepik.com/vector-gratis/nuevo-diseno-icono-x-logotipo-twitter-2023_1017-45418.jpg" alt="X" />
            <img src="https://cdn2.iconfinder.com/data/icons/2018-social-media-app-logos/1000/2018_social_media_popular_app_logo_instagram-512.png" alt="Instagram" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/960px-LinkedIn_logo_initials.png" alt="LinkedIn" />
          </div>
        </footer>
      </div>
    );
  }
}

export default withNavigationAndParams(DetalleProducto);
