import React from 'react';
import { NavigateFunction, useParams, useNavigate, Params } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DetalleProducto.css';
import { agregarAFavoritos } from './Gestor_Favoritos';
import { agregarACarrito } from './agregarAlCarrito';

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
  // Agrega aquí otros campos que realmente existan en la tabla contenido
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
    // Detectar cambio de id_contenido y recargar si es necesario
    if (
      this.props.params.id_contenido !== prevProps.params.id_contenido ||
      this.props.params.id !== prevProps.params.id
    ) {
      this.fetchContenido();
    }
  }

  fetchContenido = async () => {
    // Soporta /contenido/:id_contenido y /contenido/:id por compatibilidad
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
        console.error('Error al cargar contenido:', error);
      } else {
        this.setState({ contenido: data, error: null });
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      this.setState({ error: 'Ocurrió un error inesperado.', contenido: null });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleAgregarCarrito = async () => {
    const { contenido } = this.state;
    if (!contenido) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }

    const mensaje = await agregarACarrito(contenido.id_contenido, user.id);
    alert(mensaje);
  };

  handleAgregarFavoritos = async () => {
    const { contenido } = this.state;
    if (!contenido) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }

    const mensaje = await agregarAFavoritos(contenido.id_contenido, user.id);
    alert(mensaje);
  };

  render() {
    const { contenido, loading, error } = this.state;
    const { navigate } = this.props;

    if (loading) return <div className="loading">Cargando recurso...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!contenido) return <div className="error">Recurso no encontrado.</div>;

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

            <h2>{contenido.nombre || 'Nombre no disponible'}</h2>
            {/* Si tienes una imagen, usa el campo real, si no, muestra un placeholder */}
            <img
              src={contenido.archivo || 'https://via.placeholder.com/300'}
              alt={contenido.nombre || 'Recurso'}
              style={{ width: '300px', margin: '1rem 0' }}
            />
            <p><strong>Descripción:</strong> {contenido.descripcion || 'No disponible'}</p>
            <p><strong>Autor:</strong> {contenido.autor || 'No disponible'}</p>
            <p><strong>Formato:</strong> {contenido.formato || 'No disponible'}</p>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={this.handleAgregarCarrito}
                style={{ marginRight: '1rem' }}
              >
                🛒 Añadir al carrito
              </button>

              <button
                onClick={this.handleAgregarFavoritos}
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
}

export default withNavigationAndParams(DetalleProducto);