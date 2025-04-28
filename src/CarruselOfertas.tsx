import { useState } from 'react';
import './CarruselOfertas.css';

const imagenes = [
  {
    src: 'https://preview.redd.it/what-is-the-best-ultraman-design-in-your-opinion-v0-7trajy7iwosd1.jpeg?auto=webp&s=04f69f164e5410f8e11d238c39e0c9f2b7a9d96b',
    alt: 'Ultraman 1',
  },
  {
    src: 'https://pm1.aminoapps.com/7564/815bfb97d7dcadd92f2094f9e19e65d8e4942798r1-572-572v2_00.jpg',
    alt: 'Ultraman Geed',
  },
  {
    src: 'https://m.media-amazon.com/images/M/MV5BZmU0NWRiYmEtZTJiZS00NDBkLWFlOGEtZWQ1M2M4NmM1OTY2XkEyXkFqcGc@._V1_.jpg',
    alt: 'Ultraman Tiga',
  },
  {
    src: 'https://preview.redd.it/eheo7vj44wza1.jpg?width=640&crop=smart&auto=webp&s=47b66cbe6198d3c86420775e2eb5770299ca89f8',
    alt: 'Ultraman Zero',
  },
  {
    src: 'https://i0.wp.com/cultfaction.com/wp-content/uploads/2014/11/ultraman-gaia.jpg?fit=640%2C360&ssl=1',
    alt: 'Ultraman Gaia',
  },
  {
    src: 'https://www.cstoysjapan.com/cdn/shop/collections/Ultraseven_Alternate_Transform.jpg?v=1469061842',
    alt: 'Ultraseven',
  },
];

const visibles = 3;

export default function CarruselOfertas() {
  const [startIndex, setStartIndex] = useState(0);

  const next = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % imagenes.length);
  };

  const prev = () => {
    setStartIndex((prevIndex) =>
      (prevIndex - 1 + imagenes.length) % imagenes.length
    );
  };

  const getVisibleImages = () => {
    return Array.from({ length: visibles }).map((_, i) => {
      const index = (startIndex + i) % imagenes.length;
      return imagenes[index];
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
          {getVisibleImages().map((img, i) => (
            <div className="oferta visible" key={i}>
              <img src={img.src} alt={img.alt} />
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
