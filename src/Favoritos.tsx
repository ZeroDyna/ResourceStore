import React from "react";
import { supabase } from "./supabaseClient";
import { agregarACarrito } from './agregarAlCarrito';
import { useNavigate, useLocation, useParams, useSearchParams, useNavigationType } from "react-router-dom";
import "./Favoritos.css";

function withHooks(Component) {
  return function Wrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigationType = useNavigationType();

    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
        searchParams={searchParams}
        navigationType={navigationType}
      />
    );
  };
}

class Favoritos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favoritos: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchFavoritos();
  }

  fetchFavoritos = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;

      if (!user) {
        console.warn("⚠️ No hay usuario logueado");
        this.setState({ favoritos: [] });
        return;
      }

      const { data: favoritosData, error: favoritosError } = await supabase
        .from("favoritos")
        .select("id")
        .eq("usuario_id", user.id);

      if (favoritosError) throw favoritosError;
      if (!favoritosData || favoritosData.length === 0) {
        console.warn("⚠️ No hay favoritos para este usuario");
        this.setState({ favoritos: [] });
        return;
      }

      const favoritoIds = favoritosData.map((fav) => fav.id);
      const { data: detalleFavoritosData, error: detalleFavoritosError } = await supabase
        .from("detalle_favorito")
        .select("producto_id")
        .in("favorito_id", favoritoIds);

      if (detalleFavoritosError) throw detalleFavoritosError;
      if (!detalleFavoritosData || detalleFavoritosData.length === 0) {
        console.warn("⚠️ No hay detalles de favoritos para estos favoritos");
        this.setState({ favoritos: [] });
        return;
      }

      const productosPromises = detalleFavoritosData.map(async (detalle) => {
        const { data: productoData, error: productoError } = await supabase
          .from("productos")
          .select("id, nombre, descripcion, autor, precio, calificacion, url_imagen")
          .eq("id", detalle.producto_id)
          .single();

        if (productoError) {
          console.warn(`⚠️ Error al obtener producto ${detalle.producto_id}:`, productoError);
          return null;
        }

        return productoData;
      });

      const productosData = (await Promise.all(productosPromises)).filter(Boolean);
      this.setState({ favoritos: productosData });
    } catch (err) {
      console.error("❌ Error al obtener favoritos:", err);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleQuitarFavorito = async (productoId) => {
    try {
      const { data: detalleData, error: detalleError } = await supabase
        .from("detalle_favorito")
        .select("id")
        .eq("producto_id", productoId);

      if (detalleError || !detalleData || detalleData.length === 0) {
        throw new Error("No se encontró el detalle favorito para el producto dado.");
      }

      const detalleFavoritoId = detalleData[0].id;

      const { error: deleteError } = await supabase
        .from("detalle_favorito")
        .delete()
        .eq("id", detalleFavoritoId);

      if (deleteError) throw deleteError;

      this.setState((prevState) => ({
        favoritos: prevState.favoritos.filter((fav) => fav.id !== productoId),
      }));
    } catch (err) {
      console.error("❌ Error al quitar favorito:", err);
    }
  };

  handleAgregarCarrito = async (productoId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }

    console.log('🔍 user:', user);
    await agregarACarrito(productoId, user.id);
  };

  render() {
    const { favoritos, loading } = this.state;
    const { navigate } = this.props;

    return (
      <div className="container">
        <aside className="sidebar">
          <div className="menu">
            <p className="section-title">Navegación</p>
            <ul>
              <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
              <li onClick={() => navigate("/carrito")}>Carrito</li>
              <li onClick={() => navigate("/descargas")}>Descargas</li>
              <li onClick={() => navigate("/favoritos")} className="active">Favoritos</li>
            </ul>
            <p className="section-title">Categorías</p>
            <ul>
              <li>Videos</li>
              <li>Audios</li>
              <li>Imágenes</li>
            </ul>
          </div>
          <div className="chat-box">
            <p>¡Explora tus favoritos!</p>
          </div>
        </aside>

        <main className="main-content">
          <h2>Mis Favoritos</h2>

          {loading ? (
            <p>Cargando favoritos...</p>
          ) : favoritos.length === 0 ? (
            <p>No tienes productos en favoritos.</p>
          ) : (
            favoritos.map((producto) => (
              <div className="item" key={producto.id}>
                <img src={producto.url_imagen || "https://via.placeholder.com/150"} alt={producto.nombre} />
                <div className="info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>
                  <p>Autor: {producto.autor || "Desconocido"}</p>
                  <p>Precio: ${producto.precio?.toFixed(2)}</p>
                  <div className="buttons">
                    <button
                      onClick={() => this.handleAgregarCarrito(producto.id)}
                      style={{ marginRight: '1rem' }}
                    >
                      🛒 Añadir al carrito
                    </button>
                    <button className="btn-red" onClick={() => this.handleQuitarFavorito(producto.id)}>
                      Quitar de favoritos
                    </button>
                  </div>
                </div>
                <div className="price">${producto.precio?.toFixed(2)}</div>
              </div>
            ))
          )}
        </main>
      </div>
    );
  }
}

export default withHooks(Favoritos);
