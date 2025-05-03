import { useNavigate } from 'react-router-dom';
import fondo from './fondo.jpeg'; // Importación de la imagen de fondo
import "./inicio.css";

function Inicio() {
  const navigate = useNavigate();

  return (
    <div 
      className="inicio-container" 
      style={{ backgroundImage: `url(${fondo})` }} // Uso de la imagen importada como fondo
    >
      <h1 className="inicio-titulo">Bienvenido a RESOURCES STORE</h1>
      <p className="inicio-subtitulo">la mejor tienda de recursos audiovisuales</p>
      <div className="inicio-buttons">
        <button className="inicio-boton" onClick={() => navigate('/login')}>Iniciar sesión</button>
        <button className="inicio-boton" onClick={() => navigate('/registro')}>Registrarse</button>
        <button className="inicio-boton" onClick={() => navigate('/bienvenida')}>Explorar</button>
      </div>
    </div>
  );
}

export default Inicio;