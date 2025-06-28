import React from "react";
import { supabase } from "../lib/supabaseClient";

// Componente principal con todo el flujo
export class Recargar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCard: false,
      monto: "",
      error: "",
      loading: false,
      recargasPendientes: [],
      cargandoPendientes: false,
    };
    this.userId = props.userId;   // Debes pasar el id del usuario autenticado como prop
    this.adminId = props.adminId; // Debes pasar el id del admin si es modo admin
  }

  // Para usuarios: abrir/cerrar tarjeta
  handleShowCard = () => this.setState({ showCard: true, error: "", monto: "" });
  handleHideCard = () => this.setState({ showCard: false, error: "", monto: "" });

  // Para usuarios: enviar recarga
  handleMontoChange = e => this.setState({ monto: e.target.value, error: "" });
  handleRecarga = async () => {
    this.setState({ loading: true, error: "" });
    const montoNumber = parseFloat(this.state.monto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      this.setState({ error: "Ingresa un monto válido.", loading: false });
      return;
    }
    const { error } = await supabase.from("recarga").insert([
      {
        monto: montoNumber,
        id_user: this.userId,
        fecha_recarga: new Date().toISOString(),
        aceptada: null,
        id_admin: null,
      },
    ]);
    if (error) {
      this.setState({ error: "Error al registrar la recarga.", loading: false });
    } else {
      this.setState({ showCard: false, monto: "", loading: false });
      alert("Solicitud de recarga enviada.");
    }
  };

  // Para admin: cargar recargas pendientes
  fetchRecargasPendientes = async () => {
    this.setState({ cargandoPendientes: true });
    const { data, error } = await supabase
      .from("recarga")
      .select("id_recarga, fecha_recarga, monto, id_user")
      .is("aceptada", null); // o .eq("aceptada", false) según tu flujo
    if (!error) this.setState({ recargasPendientes: data || [], cargandoPendientes: false });
    else this.setState({ recargasPendientes: [], cargandoPendientes: false });
  };

  // Para admin: aceptar/denegar recarga
  handleDecision = async (rec, aceptar) => {
    await supabase
      .from("recarga")
      .update({ aceptada: aceptar, id_admin: this.adminId })
      .eq("id_recarga", rec.id_recarga);

    if (aceptar) {
      // Sumar saldo al usuario (mejor vía función SQL, pero aquí directo para ejemplo)
      await supabase.rpc("sumar_saldo_usuario", { user_id: rec.id_user, monto_add: rec.monto });
    }

    // Remueve de la lista local
    this.setState(state => ({
      recargasPendientes: state.recargasPendientes.filter(r => r.id_recarga !== rec.id_recarga),
    }));
  };

  // Si es modo admin, carga pendientes al montar
  componentDidMount() {
    if (this.adminId) this.fetchRecargasPendientes();
  }

  render() {
    // Si es admin, muestra interfaz de admin
    if (this.adminId) {
      return (
        <div>
          <h2>Recargas Pendientes</h2>
          {this.state.cargandoPendientes && <div>Cargando...</div>}
          {this.state.recargasPendientes.length === 0 && <div>No hay recargas pendientes.</div>}
          {this.state.recargasPendientes.map(rec => (
            <div key={rec.id_recarga} className="recarga-pendiente">
              <div>
                Usuario: {rec.id_user} <br />
                Fecha: {new Date(rec.fecha_recarga).toLocaleString()} <br />
                Monto: ${rec.monto}
              </div>
              <button onClick={() => this.handleDecision(rec, true)}>Aceptar</button>
              <button onClick={() => this.handleDecision(rec, false)} style={{ marginLeft: 10 }}>
                Denegar
              </button>
            </div>
          ))}
        </div>
      );
    }

    // Si es usuario normal
    return (
      <div>
        <button onClick={this.handleShowCard}>Nueva Recarga</button>
        {this.state.showCard && (
          <div className="recarga-card">
            <h3>Recargar saldo</h3>
            <label>Monto a recargar:</label>
            <input
              type="number"
              value={this.state.monto}
              onChange={this.handleMontoChange}
              placeholder="Ingresa el monto"
              min="1"
              step="0.01"
            />
            {this.state.error && <div style={{ color: "red" }}>{this.state.error}</div>}
            <div style={{ marginTop: 10 }}>
              <button onClick={this.handleRecarga} disabled={this.state.loading}>
                {this.state.loading ? "Enviando..." : "Aceptar"}
              </button>
              <button onClick={this.handleHideCard} style={{ marginLeft: 10 }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}