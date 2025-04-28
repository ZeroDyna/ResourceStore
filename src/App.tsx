import { useState } from 'react';
import Favoritos from './Favoritos';
import Bienvenida from './Bienvenida';
import Carrito from './Carrito'
import Descargas from './Descargas';
import './App.css'; 
function App() {
  const [vista, setVista] = useState('Bienvenida');

  return (
    <div>
        {vista === 'Bienvenida' && <Bienvenida setVista={setVista} />}
        {vista === 'carrito' && <Carrito setVista={setVista}/>}
        {vista === 'favoritos' && <Favoritos setVista={setVista} />}
        {vista === 'Descargas' && <Descargas setVista = {setVista}/>}
      
    </div>
  );
}

export default App;
