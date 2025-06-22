import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { supabase } from "./supabaseClient";
import Header from './Header';
import RegaloModal from './RegaloModal';

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
  archivo_contenido?: string; // archivo real
};

type CarritoProps = {
  navigate: NavigateFunction;
};

type CarritoState = {
  carrito: Contenido[];
  loading: boolean;
  usuario: {
    nombre_usuario: string;
    saldo: number;
  } | null;
  promociones: Promocion[];
  regaloContenidoId: number | null;
};

type Promocion = {
  id_contenido: number;
  porcentaje: number;
};

class Carrito extends React.Component<CarritoProps, CarritoState> {
  constructor(props: CarritoProps) {
    super(props);
    this.state = {
      carrito: [],
      loading: true,
      usuario: null,
      promociones: [],
      regaloContenidoId: null,
    };
  }

async componentDidMount() {
await Promise.all([
  this.fetchUsuario(),
  this.fetchCarrito(),
  this.fetchPromociones()
]);
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
        .select("id_contenido, nombre, descripcion, autor, precio, archivo,archivo_contenido")
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
    console.log("✅ Producto añadido al carrito correctamente.");
    alert("Producto añadido al carrito correctamente.");
  } catch (err) {
    console.error("❌ Error al añadir al carrito:", err);
  }
};


getTotalCarrito = () => {
  return this.state.carrito.reduce((total, contenido) => {
  return total + this.getPrecioConDescuento(contenido);
}, 0);
};

handlePagarCarrito = async () => {
  const total = this.getTotalCarrito();
  const { carrito, usuario } = this.state;

  if (!usuario) {
    alert("No hay usuario autenticado.");
    return;
  }

  if (total === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  if (usuario.saldo < total) {
    alert("Saldo insuficiente para completar la compra.");
    return;
  }

  try {
    const userId = localStorage.getItem("user_id");
    if (!userId) throw new Error("ID de usuario no encontrado.");

    // 1. Agregar todos los productos del carrito a la tabla descargas
    const inserts = carrito.map((contenido) => ({
      id_user: userId,
      id_contenido: contenido.id_contenido,
      es_regalo: false,
      fecha_descarga: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("descargas")
      .insert(inserts);

    if (insertError) throw insertError;

    // 2. Descontar el saldo del usuario
    const nuevoSaldo = usuario.saldo - total;

    const { error: updateError } = await supabase
      .from("usuario")
      .update({ saldo: nuevoSaldo })
      .eq("id_user", userId);

    if (updateError) throw updateError;

    // 3. Vaciar el carrito
    const { error: deleteError } = await supabase
      .from("carrito")
      .delete()
      .eq("id_user", userId);

    if (deleteError) throw deleteError;

    // 4. Actualizar el estado en el componente
    this.setState({
      carrito: [],
      usuario: {
        ...usuario,
        saldo: nuevoSaldo,
      },
    });

    localStorage.setItem("user_saldo", nuevoSaldo.toString());

    alert(`Gracias por tu compra. Total pagado: $${total.toFixed(2)}`);
  } catch (error) {
    console.error("❌ Error durante el pago:", error);
    alert("Ocurrió un error al procesar la compra. Inténtalo nuevamente.");
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


fetchPromociones = async () => {
  try {
    const today = new Date().toISOString();

    const { data, error } = await supabase
      .from("promociones")
      .select("id_contenido, porcentaje, fecha_ini, fecha_fin")
      .eq("activa", true);

    if (error) throw error;

    // Filtrar por fecha válida
    const promocionesValidas = data.filter((promo) => {
      const ini = new Date(promo.fecha_ini);
      const fin = new Date(promo.fecha_fin);
      const hoy = new Date();
      return hoy >= ini && hoy <= fin;
    });

    this.setState({ promociones: promocionesValidas });
  } catch (err) {
    console.error("❌ Error al obtener promociones:", err);
  }
};
  
getPrecioConDescuento = (contenido: Contenido): number => {
  const { promociones } = this.state;
  const promo = promociones.find(p => p.id_contenido === contenido.id_contenido);
  if (!promo) return contenido.precio;

  const descuento = (contenido.precio * promo.porcentaje) / 100;
  return contenido.precio - descuento;
};

handleRegalar = (contenidoId: number) => {
  // Simplemente abre el modal con el contenido a regalar
  this.setState({ regaloContenidoId: contenidoId });
};

handleEnviarRegalo = async (usuarioDestino: string, mensaje: string) => {
  const { carrito, usuario, regaloContenidoId } = this.state;

  if (!usuario || !regaloContenidoId) {
    alert("⚠️ Usuario no autenticado o contenido inválido.");
    return;
  }

  const contenido = carrito.find(c => c.id_contenido === regaloContenidoId);
  if (!contenido) {
    alert("⚠️ Contenido no encontrado en el carrito.");
    return;
  }

  const precio = this.getPrecioConDescuento(contenido);
  if (usuario.saldo < precio) {
    alert("⚠️ Saldo insuficiente para regalar este contenido.");
    return;
  }

  try {
    // Buscar al usuario destinatario
    const { data: destinatario, error: errorUser } = await supabase
      .from("usuario")
      .select("id_user")
      .ilike("nombre_usuario", usuarioDestino.trim())  // insensible a mayúsculas
      .maybeSingle();

    if (errorUser) {
      console.error("❌ Error al buscar usuario:", errorUser);
      alert("Error al buscar el usuario.");
      return;
    }

    if (!destinatario) {
      alert("⚠️ Usuario destino no encontrado.");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("⚠️ Usuario remitente no autenticado.");
      return;
    }

    // Insertar en la tabla Regalo (con R mayúscula y columnas correctas)
    const { data: regalo, error: regaloError } = await supabase
      .from("Regalo")
      .insert([{
        ID_user_Usuario_remitente: parseInt(userId,10),
        ID_user_Usuario_destino: destinatario.id_user,
        ID_contenido_Contenido: contenido.id_contenido,
        mensaje: mensaje.trim(),
      }])
      .select()
      .single();

    if (regaloError) {
      console.error("❌ Error al insertar en Regalo:", regaloError);
      alert("Error al registrar el regalo.");
      return;
    }

    // Insertar en la tabla descargas
    const { error: descargaError } = await supabase
      .from("descargas")
      .insert([{
        id_user: destinatario.id_user,
        id_contenido: contenido.id_contenido,
        fecha_descarga: new Date().toISOString(),
        es_regalo: true,
        id_regalo: regalo.id,
      }]);

    if (descargaError) {
      console.error("❌ Error al insertar en descargas:", descargaError);
      alert("Error al registrar la descarga del regalo.");
      return;
    }

    // Descontar el saldo al usuario remitente
    const nuevoSaldo = usuario.saldo - precio;
    const { error: updateError } = await supabase
      .from("usuario")
      .update({ saldo: nuevoSaldo })
      .eq("id_user", userId);

    if (updateError) {
      console.error("❌ Error al actualizar saldo:", updateError);
      alert("Error al descontar el saldo.");
      return;
    }

    // Actualizar estado local
    this.setState({
      usuario: { ...usuario, saldo: nuevoSaldo },
      regaloContenidoId: null,
    });
    localStorage.setItem("user_saldo", nuevoSaldo.toString());

    alert("🎁 Regalo enviado con éxito.");
  } catch (error) {
    console.error("❌ Error inesperado al enviar regalo:", error);
    alert("Error al enviar regalo. Verifica el nombre del usuario y vuelve a intentarlo.");
  }
};


handleCerrarModal = () => {
  // Cierra el modal de regalo
  this.setState({ regaloContenidoId: null });
};
  


  render() {
    const { carrito, loading } = this.state;
    const { navigate } = this.props;

    return (
      <div className="container">
        <Header />
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
                    <p>
                      Precio: ${this.getPrecioConDescuento(contenido).toFixed(2)}
                      {this.getPrecioConDescuento(contenido) < contenido.precio && (
                        <span className="precio-original"> (Antes: ${contenido.precio.toFixed(2)})</span>
                      )}
                    </p>
                    <div className="buttons">
                      <button 
                        className="btn-black"
                        onClick={() => this.handleRegalar(contenido.id_contenido)}
                      >
                        Regalar
                      </button>
                      <button
                        className="btn-red"
                        onClick={() => this.handleQuitarCarrito(contenido.id_contenido)}
                      >
                        Quitar de carrito
                      </button>
                      
                    </div>
                  </div>
                  <div className="price">${this.getPrecioConDescuento(contenido).toFixed(2)}
                      {this.getPrecioConDescuento(contenido) < contenido.precio && (
                        <span className="precio-original"> </span>
                      )}</div>
                </div>
              ))}
              {this.state.regaloContenidoId && (
                <RegaloModal
                  contenidoId={this.state.regaloContenidoId}
                  onClose={this.handleCerrarModal}
                  onRegalar={this.handleEnviarRegalo}
                />
              )}

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
