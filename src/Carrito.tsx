import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate para la navegación
import { supabase } from "./supabaseClient";
import "./Carrito.css";
export default function Carrito() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegar entre rutas

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const user = userData.user;

        if (!user) {
          console.warn("⚠️ No hay usuario logueado");
          setCarrito([]);
          return;
        }

        const { data: carritoData, error: carritoError } = await supabase
          .from("carritos")
          .select("id")
          .eq("usuario_id", user.id);

        if (carritoError) throw carritoError;
        if (!carritoData || carritoData.length === 0) {
          console.warn("⚠️ No hay carrito para este usuario");
          setCarrito([]);
          return;
        }

        const carritoIds = carritoData.map((car) => car.id);
        const { data: detalleCarritoData, error: detalleCarritoError } = await supabase
          .from("detalle_carrito")
          .select("producto_id")
          .in("carrito_id", carritoIds);

        if (detalleCarritoError) throw detalleCarritoError;
        if (!detalleCarritoData || detalleCarritoData.length === 0) {
          console.warn("⚠️ No hay detalles de carrito para estos productos");
          setCarrito([]);
          return;
        }

        const productosPromises = detalleCarritoData.map(async (detalle) => {
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
        setCarrito(productosData);
      } catch (err) {
        console.error("❌ Error al obtener carrito:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrito();
  }, []);

  const handleQuitarCarrito = async (productoId: number) => {
    try {
      const { data: detalleData, error: detalleError } = await supabase
        .from("detalle_carrito")
        .select("id")
        .eq("producto_id", productoId);

      if (detalleError || !detalleData || detalleData.length === 0) {
        throw new Error("No se encontró el detalle carrito para el producto dado.");
      }

      const detalleCarritoId = detalleData[0].id;

      const { error: deleteError } = await supabase
        .from("detalle_carrito")
        .delete()
        .eq("id", detalleCarritoId);

      if (deleteError) throw deleteError;

      setCarrito((prev) => prev.filter((car) => car.id !== productoId));
    } catch (err) {
      console.error("❌ Error al quitar de carrito:", err);
    }
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="menu">
          <p className="section-title">Navegación</p>
          <ul>
            <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
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
        <h2>Mi carrito</h2>

        {loading ? (
          <p>Cargando carrito...</p>
        ) : carrito.length === 0 ? (
          <p>No tienes productos en carrito.</p>
        ) : (
          carrito.map((producto) => (
            <div className="item" key={producto.id}>
              <img src={producto.url_imagen || "https://via.placeholder.com/150"} alt={producto.nombre} />
              <div className="info">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Autor: {producto.autor || "Desconocido"}</p>
                <p>Precio: ${producto.precio?.toFixed(2)}</p>
                <div className="buttons">
                  <button className="btn-black">Regalar</button>
                  <button className="btn-red" onClick={() => handleQuitarCarrito(producto.id)}>
                    Quitar de carrito
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