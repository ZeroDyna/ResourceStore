import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Carrito.css";

// HOC para pasar navigate a componente de clase
function withNavigation(Component: any) {
  return function WrappedComponent(props: any) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  autor?: string;
  precio: number;
  calificacion?: number;
  url_imagen?: string;
};

type CarritoProps = {
  navigate: NavigateFunction;
};

type CarritoState = {
  carrito: Producto[];
  loading: boolean;
};

class Carrito extends React.Component<CarritoProps, CarritoState> {
  constructor(props: CarritoProps) {
    super(props);
    this.state = {
      carrito: [],
      loading: true,
    };
  }

  async componentDidMount() {
    await this.fetchCarrito();
  }

  // ✅ Obtener productos del carrito
  fetchCarrito = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;

      if (!user) {
        console.warn("⚠️ No hay usuario logueado");
        this.setState({ carrito: [] });
        return;
      }

      const { data: carritoData, error: carritoError } = await supabase
        .from("carritos")
        .select("id")
        .eq("usuario_id", user.id);

      if (carritoError) throw carritoError;
      if (!carritoData || carritoData.length === 0) {
        this.setState({ carrito: [] });
        return;
      }

      const carritoIds = carritoData.map((car: any) => car.id);
      const { data: detalleCarritoData, error: detalleCarritoError } = await supabase
        .from("detalle_carrito")
        .select("producto_id")
        .in("carrito_id", carritoIds);

      if (detalleCarritoError) throw detalleCarritoError;
      if (!detalleCarritoData || detalleCarritoData.length === 0) {
        this.setState({ carrito: [] });
        return;
      }

      const productosPromises = detalleCarritoData.map(async (detalle: any) => {
        const { data: productoData, error: productoError } = await supabase
          .from("productos")
          .select("id, nombre, descripcion, autor, precio, calificacion, url_imagen")
          .eq("id", detalle.producto_id)
          .single();

        if (productoError) return null;
        return productoData;
      });

      const productosData = (await Promise.all(productosPromises)).filter(Boolean) as Producto[];
      this.setState({ carrito: productosData });
    } catch (err) {
      console.error("❌ Error al obtener carrito:", err);
    } finally {
      this.setState({ loading: false });
    }
  };

  // ✅ Eliminar producto del carrito
  handleQuitarCarrito = async (productoId: number) => {
    try {
      const { data: detalleData, error: detalleError } = await supabase
        .from("detalle_carrito")
        .select("id")
        .eq("producto_id", productoId)
        .limit(1);

      if (detalleError || !detalleData || detalleData.length === 0) {
        throw new Error("No se encontró el detalle carrito para el producto.");
      }

      const detalleCarritoId = detalleData[0].id;

      const { error: deleteError } = await supabase
        .from("detalle_carrito")
        .delete()
        .eq("id", detalleCarritoId);

      if (deleteError) throw deleteError;

      await this.fetchCarrito();
    } catch (err) {
      console.error("❌ Error al quitar de carrito:", err);
    }
  };

  // ✅ Añadir producto al carrito
  handleAgregarAlCarrito = async (productoId: number) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;

      const { data: carritoData } = await supabase
        .from("carritos")
        .select("id")
        .eq("usuario_id", user.id)
        .single();

      const carritoId = carritoData?.id;
      if (!carritoId) throw new Error("No se encontró carrito para el usuario.");

      const { error: insertError } = await supabase
        .from("detalle_carrito")
        .insert([{ carrito_id: carritoId, producto_id: productoId }]);

      if (insertError) throw insertError;

      await this.fetchCarrito();
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err);
    }
  };

  // ✅ Calcular total
  getTotalCarrito = () => {
    return this.state.carrito.reduce((total, producto) => total + producto.precio, 0);
  };

  handlePagarCarrito = () => {
  const total = this.getTotalCarrito();
  if (total === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  // Aquí podrías redirigir al sistema de pago real
  alert(`Gracias por tu compra. Total pagado: $${total.toFixed(2)}`);

  // Opcional: Vaciar carrito después de pagar
  // Podrías implementar lógica adicional aquí para mover productos a "descargados"
};


  render() {
    const { carrito, loading } = this.state;
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
            <>
              {carrito.map((producto, index) => (
                <div className="item" key={index + "-" + producto.id}>
                  <img
                    src={producto.url_imagen || "https://via.placeholder.com/150"}
                    alt={producto.nombre}
                  />
                  <div className="info">
                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion}</p>
                    <p>Autor: {producto.autor || "Desconocido"}</p>
                    <p>Precio: ${producto.precio?.toFixed(2)}</p>
                    <div className="buttons">
                      <button className="btn-black">Regalar</button>
                      <button
                        className="btn-red"
                        onClick={() => this.handleQuitarCarrito(producto.id)}
                      >
                        Quitar de carrito
                      </button>
                    </div>
                  </div>
                  <div className="price">${producto.precio?.toFixed(2)}</div>
                </div>
              ))}

              {/* ✅ Mostrar total */}
              <div className="total">
                <h3>Total: ${this.getTotalCarrito().toFixed(2)}</h3>
              </div>
              <button className="btn-pay" onClick={this.handlePagarCarrito}>
                Pagar carrito
              </button>
            </>
          )}
        </main>
      </div>
    );
  }
}

export default withNavigation(Carrito);
