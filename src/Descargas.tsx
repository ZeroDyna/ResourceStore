import './Descargas.css';
import './CarruselOfertas.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import Header from './C19header';

export default function Descargas() {
  const [descargados, setDescargados] = React.useState([]);
  const [noDescargados, setNoDescargados] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchDescargas();
  }, []);

  const fetchDescargas = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

const { data, error } = await supabase
  .from("descargas")
  .select(`
    *,
    contenido: id_contenido (
      nombre,
      descripcion,
      archivo,
      formato,
      tamanio,
      tipo,
      archivo_contenido
    ),
    regalo: id_regalo (
      mensaje,
      remitente: ID_user_Usuario_remitente (
        nombre_usuario
      )
    )
  `)
  .eq("id_user", userId);

    if (error) {
      console.error("❌ Error al traer descargas:", error);
      return;
    }

    const descargados = data.filter(d => d.descargado === true);
    const noDescargados = data.filter(d => d.descargado === false);

    setDescargados(descargados);
    setNoDescargados(noDescargados);
    setLoading(false);
  };

  const getIcon = (tipo: string) => {
    if (tipo?.toLowerCase().includes("imagen")) return "https://img.icons8.com/ios-filled/100/image.png";
    if (tipo?.toLowerCase().includes("video")) return "https://img.icons8.com/ios-filled/100/video.png";
    if (tipo?.toLowerCase().includes("audio")) return "https://img.icons8.com/ios-filled/100/music.png";
    return "https://via.placeholder.com/100";
  };

const handleDescargar = async (item: any) => {
  try {
    const url = item.contenido.archivo_contenido;
    const nombreArchivo = item.contenido.nombre || "archivo";

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al descargar archivo");

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log("🔍 ID de descarga:", item.id);


    // ✅ 1. Marcar como descargado en Supabase
    const { error } = await supabase
      .from("descargas")
      .update({ descargado: true })
      .eq("id_descargas", item.id_descargas);

    if (error) {
      console.error("❌ Error al marcar como descargado:", error);
    } else {
      // ✅ 2. Mover de noDescargados a descargados localmente
      setNoDescargados(prev => prev.filter(p => p.id !== item.id));
      setDescargados(prev => [...prev, { ...item, descargado: true }]);
    }
  } catch (error) {
    console.error("❌ Error al descargar archivo:", error);
    alert("Hubo un problema al descargar el archivo.");
  }
};
  return (
    <>
      <Header />
      <div className="container">
        <aside className="sidebar">
          <div className="menu">
            <p className="section-title">Navegación</p>
            <ul>
              <li onClick={() => navigate("/Bienvenida")}>Inicio</li>
              <li onClick={() => navigate("/carrito")}>Carrito</li>
              <li onClick={() => navigate("/descargas")} className="active">Descargas</li>
              <li onClick={() => navigate("/favoritos")}>Favoritos</li>
            </ul>
          </div>
        </aside>

        <main className="contenido">

          {loading ? (
            <p>Cargando tus descargas...</p>
          ) : (
            <>
              <section className="descargados">
                <h2>Contenidos Descargados</h2>
                {descargados.length === 0 ? (
                  <p>No tienes descargas realizadas aún.</p>
                ) : (
                  descargados.map((item: any) => (
                    <div key={item.id} className="recurso">
                      <img
                        src={item.contenido.archivo || "https://via.placeholder.com/150"}
                        alt={item.contenido.nombre}
                      />
                      <div>
                        <p><strong>{item.contenido.nombre}</strong></p>
                        <p>{item.contenido.descripcion}</p>
                        <p className="fecha">Descargado el: {new Date(item.fecha_descarga).toLocaleString()}</p>
                        
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="no-descargados">
                <h2>Contenidos No Descargados</h2>
                {noDescargados.length === 0 ? (
                  <p>Ya descargaste todos tus contenidos.</p>
                ) : (
                  noDescargados.map((item: any) => (
                  <div key={item.id} className="recurso">
                    
                    {/* Mostrar solo si NO es regalo */}
                    {!item.es_regalo && (
                       <img
                        src={item.contenido.archivo || "https://via.placeholder.com/150"}
                        alt={item.contenido.nombre}
                      />
                    )}

                    <div>
                      {/* Mostrar nombre y descripción solo si NO es regalo */}
                      {!item.es_regalo && (
                        <>
                          <p><strong>{item.contenido.nombre}</strong></p>
                          <p>{item.contenido.descripcion}</p>
                        </>
                      )}

                      {/* Mostrar mensaje de regalo si es_regalo */}
                      {item.es_regalo && item.regalo && (
                        <>
                          <p className="mensaje-regalo">🎁 Regalo enviado por: <strong>{item.regalo.remitente.nombre_usuario}</strong></p>
                          <p className="mensaje-regalo">💬 Mensaje: "{item.regalo.mensaje}"</p>
                        </>
                      )}

                      <div className="acciones">
                        <button className="descargar" onClick={() => handleDescargar(item)}>
                          ⬇️ Descargar
                        </button>
                      </div>

                      <p className="fecha-compra">Comprado el: {new Date(item.fecha_descarga).toLocaleString()}</p>
                    </div>
                  </div>
                  ))
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <footer className="footer">
        <span>© 2025 Resources Store</span>
        <div className="social">
          <img src="https://img.icons8.com/ios-filled/50/twitterx--v1.png" alt="X" />
          <img src="https://img.icons8.com/ios-filled/50/instagram-new--v1.png" alt="Instagram" />
          <img src="https://img.icons8.com/ios-filled/50/linkedin.png" alt="LinkedIn" />
        </div>
      </footer>
    </>
  );
}
