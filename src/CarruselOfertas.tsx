import { useState, useEffect } from 'react';
import { traerOfertas } from './traer_ofertas'; // Importamos la función
import './CarruselOfertas.css';

export default function CarruselOfertas() {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibles = 3;

  useEffect(() => {
    async function loadOfertas() {
      const ofertasData = await traerOfertas(); // Llamamos a la función para obtener las ofertas
      console.log('Ofertas cargadas:', ofertasData);
      if (Array.isArray(ofertasData)) {  // Verificamos que es un array antes de actualizar el estado
        setOfertas(ofertasData);
      } else {
        console.error('Las ofertas no son un array:', ofertasData);
      }
    }

    loadOfertas();
  }, []);

  const next = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % ofertas.length);
  };

  const prev = () => {
    setStartIndex((prevIndex) =>
      (prevIndex - 1 + ofertas.length) % ofertas.length
    );
  };
  console.log(ofertas);

  const getVisibleImages = () => {
    return Array.from({ length: visibles }).map((_, i) => {
      const index = (startIndex + i) % ofertas.length;
      return ofertas[index];
    });
  };

  return (
    <section className="ofertas">
      <h2>OFERTAS POR TIEMPO LIMITADO</h2>
      <div className="carousel">
        <button className="arrow left-arrow" onClick={prev}>
          ←
        </button>
        <div className="ofertas-container">
          {getVisibleImages().map((oferta, i) => (
            <div className="oferta visible" key={i}>
              <img src={oferta?.url_banner} alt={oferta?.nombre} />
            </div>
          ))}
        </div>
        <button className="arrow right-arrow" onClick={next}>
          →
        </button>
      </div>
    </section>
  );
}
