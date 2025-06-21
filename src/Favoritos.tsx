import { supabase } from "./supabaseClient";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agregarACarrito } from './agregarAlCarrito';
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  useNavigationType
} from "react-router-dom";
import Header from './Header';
import "./favoritos.css";

// HOC para pasar hooks a la clase
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

type Contenido = {
  id_contenido: number;
  nombre: string;
  descripcion: string;
  autor?: string;
  precio: number;
  archivo?: string;
};

type FavoritosProps = {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  params: ReturnType<typeof useParams>;
  searchParams: URLSearchParams;
  navigationType: ReturnType<typeof useNavigationType>;
};

type FavoritosState = {
  favoritos: Contenido[];
  loading: boolean;
  usuario: {
    nombre_usuario: string;
    saldo: number;
  } | null;
};

class Favoritos extends React.Component<FavoritosProps, FavoritosState> {
  constructor(props: FavoritosProps) {
    super(props);
    this.state = {
      favoritos: [],
      loading: true,
      usuario: null,
    };
  }

componentDidMount() {
  const init = async () => {
    await Promise.all([
      this.fetchUsuario(),
      this.fetchFavoritos()
    ]);
  };

  init();
}

  fetchFavoritos = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        this.setState({ favoritos: [] });
        return;
      }

      if (!userId) {
        console.warn("⚠️ No hay usuario logueado");
        this.setState({ favoritos: [] });
        return;
      }

      const { data: favoritosData, error: favoritosError } = await supabase
        .from("favoritos")
        .select("id_contenido")
        .eq("id_user", userId);

      if (favoritosError) throw favoritosError;
      if (!favoritosData || favoritosData.length === 0) {
        console.warn("⚠️ No hay favoritos para este usuario");
        this.setState({ favoritos: [] });
        return;
      }

      const favoritoIds = favoritosData.map(item => item.id_contenido);
      
      const contenidosPromises = favoritoIds.map(async (contenidoId: number) => {
      const { data, error } = await supabase
        .from("contenido")
        .select("id_contenido, nombre, descripcion, autor, precio, archivo")
        .eq("id_contenido", contenidoId)
        .single();

        if (error) return null;
        return data;
      });

      const contenidosData = (await Promise.all(contenidosPromises)).filter(Boolean) as Contenido[];
          this.setState({ favoritos: contenidosData });
        } catch (err) {
          console.error("❌ Error al obtener favoritos:", err);
        } finally {
          this.setState({ loading: false });
        }
        };

handleQuitarFavorito = async (contenidoId: number) => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from("favoritos")
      .delete()
      .match({ id_user: userId, id_contenido: contenidoId });

    if (deleteError) throw deleteError;

    await this.fetchFavoritos();
  } catch (err) {
    console.error("❌ Error al quitar del carrito:", err);
  }
};
handleAgregarAFavorito = async (contenidoId: number) => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    // Verifica si ya está en el carrito
    const { data: existente, error: existeError } = await supabase
      .from("favoritos")
      .select("*")
      .match({ id_user: userId, id_contenido: contenidoId });

    if (existeError) throw existeError;
    if (existente.length > 0) return;

    const { error: insertError } = await supabase
      .from("favoritos")
      .insert([{ id_user: userId, id_contenido: contenidoId }]);

    if (insertError) throw insertError;

    await this.fetchFavoritos();
  } catch (err) {
    console.error("❌ Error al añadir a favoritos:", err);
  }
};

handleAgregarAlCarrito = async (contenidoId: number) => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    // Verifica si ya está en el carrito
    const { data: existente, error: existeError } = await supabase
      .from("carrito")
      .select("*")
      .match({ id_user: userId, id_contenido: contenidoId });

    if (existeError) throw existeError;
    if (existente.length > 0) return;

    const { error: insertError } = await supabase
      .from("carrito")
      .insert([{ id_user: userId, id_contenido: contenidoId }]);

    if (insertError) throw insertError;

    await this.fetchFavoritos();
  } catch (err) {
    console.error("❌ Error al añadir al carrito:", err);
  }
};

fetchUsuario = async () => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const { data, error } = await supabase
      .from("usuario")
      .select("nombre_usuario, saldo")
      .eq("id_user", userId)
      .single();

    if (error) throw error;

    this.setState({ usuario: data });
  } catch (err) {
    console.error("❌ Error al obtener usuario:", err);
  }
};

  render() {
    const { favoritos, loading } = this.state;
    const { navigate } = this.props;

    return (
      <div className="container">
        <Header />
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
              <div className="item" key={producto.id_contenido}>
                <img src={producto.archivo || "https://via.placeholder.com/150"} alt={producto.nombre} />
                <div className="info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>
                  <p>Autor: {producto.autor || "Desconocido"}</p>
                  <p>Precio: ${producto.precio?.toFixed(2)}</p>
                  <div className="buttons">
                    <button
                      onClick={() => this.handleAgregarAlCarrito(producto.id_contenido)}
                      style={{ marginRight: '1rem' }}
                    >
                      🛒 Añadir al carrito
                    </button>
                    <button className="btn-red" onClick={() => this.handleQuitarFavorito(producto.id_contenido)}>
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
