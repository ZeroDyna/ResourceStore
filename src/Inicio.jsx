import { useNavigate } from 'react-router-dom';
import "./FormStyles.css";

function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="inicio-container">
      <h1>Bienvenido a Resources Store</h1>
      <div className="inicio-buttons">
        <button onClick={() => navigate('/login')}>Iniciar Sesión</button>
        <button onClick={() => navigate('/registro')}>Registrarse</button>
        <button onClick={() => navigate('/bienvenida')}>Explorar</button>
      </div>
    </div>
  );
}

export default Inicio;
