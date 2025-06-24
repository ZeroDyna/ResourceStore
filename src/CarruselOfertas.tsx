import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { traerPromociones } from './traerPromociones';
import './CarruselOfertas.css';

export default function CarruselOfertas() {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibles = 3; // Ver 3 ofertas al mismo tiempo
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOfertas() {
      const ofertasData = await traerPromociones();
      if (Array.isArray(ofertasData)) {
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

  // Devuelve un array de objetos { oferta, indexReal }
  const getVisibleImages = () => {
    return Array.from({ length: visibles }).map((_, i) => {
      const indexReal = (startIndex + i) % ofertas.length;
      const oferta = ofertas[indexReal];
      if (!oferta) {
        return null;
      }
      // Devuelve el objeto y el índice real para usarlo como key
      return { oferta, indexReal };
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
          {getVisibleImages().map((item, i) => {
            if (!item) return null;
            const { oferta, indexReal } = item;
            return (
              <div
                className={`oferta ${i === 0 ? 'recomendacion' : ''}`} // Clase especial para la tarjeta inicial
                key={`${oferta.id}-${indexReal}`}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={oferta?.url_banner || oferta?.contenido?.archivo || 'https://via.placeholder.com/300'}
                  alt={oferta?.contenido?.nombre || 'Producto'}
                  onClick={() => navigate(`/contenido/${oferta?.contenido?.id_contenido}`)}
                />
                <p>{oferta?.contenido?.nombre || 'Producto sin nombre'}</p>
                {i === 0 && <p className="recomendacion-texto">Recomendado</p>}
              </div>
            );
          })}
        </div>
        <button className="arrow right-arrow" onClick={next}>
          →
        </button>
      </div>
    </section>
  );
}