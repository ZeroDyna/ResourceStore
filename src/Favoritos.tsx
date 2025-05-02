import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate para la navegación
import { supabase } from "./supabaseClient";
import "./Favoritos.css";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegar entre rutas

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const user = userData.user;

        if (!user) {
          console.warn("⚠️ No hay usuario logueado");
          setFavoritos([]);
          return;
        }

        const { data: favoritosData, error: favoritosError } = await supabase
          .from("favoritos")
          .select("id")
          .eq("usuario_id", user.id);

        if (favoritosError) throw favoritosError;
        if (!favoritosData || favoritosData.length === 0) {
          console.warn("⚠️ No hay favoritos para este usuario");
          setFavoritos([]);
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
          setFavoritos([]);
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
        setFavoritos(productosData);
      } catch (err) {
        console.error("❌ Error al obtener favoritos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritos();
  }, []);

  const handleQuitarFavorito = async (productoId: number) => {
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

      setFavoritos((prev) => prev.filter((fav) => fav.id !== productoId));
    } catch (err) {
      console.error("❌ Error al quitar favorito:", err);
    }
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="menu">
          <p className="section-title">Navegación</p>
          <ul>
            <li onClick={() => navigate("/")}>Inicio</li>
            <li onClick={() => navigate("/carrito")}>Carrito</li>
            <li onClick={() => navigate("/descargas")}>Descargas</li>
            <li onClick={() => navigate("/favoritos")} className="active">
              Favoritos
            </li>
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
                  <button className="btn-black">Añadir al carrito</button>
                  <button className="btn-red" onClick={() => handleQuitarFavorito(producto.id)}>
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