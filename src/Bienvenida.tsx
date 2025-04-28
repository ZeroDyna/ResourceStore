import CarruselOfertas from './CarruselOfertas';
type PrincipalProps = {
  setVista: (vista: string) => void;
};
function Bienvenida({ setVista }: PrincipalProps) {
    return (
      <div className="principal-container">
        {/* Puedes seguir con más secciones como recomendaciones, destacados, etc. */
        <>
        <meta charSet="UTF-8" />
<title>Resources store</title>
{/* Encabezado superior */}
<header className="top-bar">
  <h1>Resources store</h1>
  <div className="top-info">
    <span>Mi saldo: $400</span>
    <span>USER_1</span>
  </div>
</header>
{/* Sección de ofertas */}
<section>
<CarruselOfertas />
</section>
<main className="contenido-principal">
  {/* Barra lateral izquierda */}
  <aside className="sidebar">
    <ul>
      <li>Inicio</li>
      
      <li onClick={() => setVista('carrito')} style={{ cursor: 'pointer' }}>
      Carrito
      </li>
      
      <li onClick={() => setVista('Descargas')} style={{ cursor: 'pointer' }}>
      Descargas
      </li>
      <li onClick={() => setVista('favoritos')} style={{ cursor: 'pointer' }}>
  Favoritos
</li>

      <li>Categorías</li>
      <li>Imágenes</li>
      <li>Videos</li>
    </ul>
  </aside>
  {/* Contenido central */}
  <section className="recomendaciones">
    <h3>Imágenes Que Te Pueden Gustar</h3>
    <div className="busqueda">
      <input type="text" id="buscador" placeholder="Buscar contenido..." />
    </div>
    <div className="cards">
      <div className="card">
        <img
          src="https://pbs.twimg.com/media/D_Mr4jeXUAAPs4i.jpg"
          alt="Colección PNG"
        />
        <p>
          Colección PNG
          <br />
          Desde $0.50
        </p>
      </div>
      <div className="card">
        <img
          src="https://i.pinimg.com/736x/40/a7/e0/40a7e081d0497ca403027b737f1e31d9.jpg"
          alt="Colección JPG"
        />
        <p>
          Colección JPG
          <br />
          Desde $0.60
        </p>
      </div>
    </div>
    <div className="detalle">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9A_f0YVfZcrIYTlO-ss16_wNeb9wo5iCWwQ&s"
        alt="Video ejemplo"
      />
      <div className="info">
        <h4>Video1.MP3</h4>
        <p>Descripción del recurso, duración y tamaño del archivo.</p>
        <span className="precio">$5.89</span>
        <div className="botones">
          <button>Añadir al carrito</button>
          <button>Añadir a favoritos</button>
        </div>
      </div>
    </div>
  </section>
  {/* Barra lateral derecha */}
  <aside className="destacados">
    <h4>Videos Destacados</h4>
    <ul>
      <li>Video1.MP4</li>
      <li>Video2.AVI</li>
      <li>Video3.MKV</li>
    </ul>
    <h4>Imágenes Destacadas</h4>
    <ul>
      <li>Imagen1.PNG</li>
      <li>Imagen2.WEBP</li>
      <li>Imagen3.JPG</li>
    </ul>
    <h4>Audios Destacados</h4>
    <ul>
      <li>Audio1.MP3</li>
      <li>Audio2.WAV</li>
      <li>Audio3.OGG</li>
    </ul>
  </aside>
</main>
{/* Pie de página */}
<footer className="footer">
  <span>© 2025 Resources Store</span>
  <div className="social">
    <img
      src="https://img.freepik.com/vector-gratis/nuevo-diseno-icono-x-logotipo-twitter-2023_1017-45418.jpg?semt=ais_hybrid&w=740"
      alt="X"
    />
    <img
      src="https://cdn2.iconfinder.com/data/icons/2018-social-media-app-logos/1000/2018_social_media_popular_app_logo_instagram-512.png"
      alt="Instagram"
    />
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/960px-LinkedIn_logo_initials.png"
      alt="LinkedIn"
    />
  </div>
</footer>
{/* JS */}
</>
        }
        

      </div>
    );
  }

export default Bienvenida;