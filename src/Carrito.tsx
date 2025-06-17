import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./Carrito.css";


function withNavigation(Component: any) {
  return function WrappedComponent(props: any) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
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

type CarritoProps = {
  navigate: NavigateFunction;
};

type CarritoState = {
  carrito: Contenido[];
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

// Obtener los contenidos del carrito
fetchCarrito = async () => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      this.setState({ carrito: [] });
      return;
    }

    const { data: carritoData, error: carritoError } = await supabase
      .from("carrito")
      .select("id_contenido")
      .eq("id_user", userId);

    if (carritoError) throw carritoError;
    if (!carritoData || carritoData.length === 0) {
      this.setState({ carrito: [] });
      return;
    }

    const contenidosIds = carritoData.map(item => item.id_contenido);

    const contenidosPromises = contenidosIds.map(async (contenidoId: number) => {
      const { data, error } = await supabase
        .from("contenido")
        .select("id_contenido, nombre, descripcion, autor, precio, archivo")
        .eq("id_contenido", contenidoId)
        .single();

      if (error) return null;
      return data;
    });

    const contenidosData = (await Promise.all(contenidosPromises)).filter(Boolean) as Contenido[];
    this.setState({ carrito: contenidosData });
  } catch (err) {
    console.error("❌ Error al obtener carrito:", err);
  } finally {
    this.setState({ loading: false });
  }
};

handleQuitarCarrito = async (contenidoId: number) => {
  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from("carrito")
      .delete()
      .match({ id_user: userId, id_contenido: contenidoId });

    if (deleteError) throw deleteError;

    await this.fetchCarrito();
  } catch (err) {
    console.error("❌ Error al quitar del carrito:", err);
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

    await this.fetchCarrito();
  } catch (err) {
    console.error("❌ Error al añadir al carrito:", err);
  }
};


  getTotalCarrito = () => {
    return this.state.carrito.reduce((total, contenido) => total + contenido.precio, 0);
  };

  handlePagarCarrito = () => {
    const total = this.getTotalCarrito();
    if (total === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    alert(`Gracias por tu compra. Total pagado: $${total.toFixed(2)}`);
    // Aquí puedes vaciar el carrito si deseas
  };
  

  render() {
    const { carrito, loading } = this.state;
    const { navigate } = this.props;

    return (
      <div className="container">
        <header className="top-bar">
          <h1>Resources Store</h1>
        </header>
        <aside className="sidebar">
          <div className="menu">
            <p className="section-title">Navegación</p>
            <ul>
              <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
              <li onClick={() => navigate("/carrito")} className="active">Carrito</li>
              <li onClick={() => navigate("/descargas")}>Descargas</li>
              <li onClick={() => navigate("/favoritos")}>Favoritos</li>
            </ul>
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
              {carrito.map((contenido, index) => (
                <div className="item" key={index + "-" + contenido.id_contenido}>
                  <img
                    src={contenido.archivo || "https://via.placeholder.com/150"}
                    alt={contenido.nombre}
                  />
                  <div className="info">
                    <h3>{contenido.nombre}</h3>
                    <p>{contenido.descripcion}</p>
                    <p>Autor: {contenido.autor || "Desconocido"}</p>
                    <p>Precio: ${contenido.precio.toFixed(2)}</p>
                    <div className="buttons">
                      <button className="btn-black">Regalar</button>
                      <button
                        className="btn-red"
                        onClick={() => this.handleQuitarCarrito(contenido.id_contenido)}
                      >
                        Quitar de carrito
                      </button>
                    </div>
                  </div>
                  <div className="price">${contenido.precio.toFixed(2)}</div>
                </div>
              ))}

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
