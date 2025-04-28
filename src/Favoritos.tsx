import './favoritos.css';
import './CarruselOfertas';
type PrincipalProps = {
  setVista: (vista: string) => void;
};
export default function Favoritos({setVista}:PrincipalProps) {
  return (
    <>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Favoritos - Resources Store</title>
    <link rel="stylesheet" href="favoritos.css" />
    <link rel="stylesheet" href="styles_main.css" />
    <header className="topbar">
      <div className="store-name">Resources store</div>
      <div className="topbar-right">
        <button className="btn-recargar">Recargar</button>
        <span className="saldo">Mi saldo: $400</span>
        <span className="username">USER_1</span>
        <div className="user-icon">🔍</div>
      </div>
    </header>
    <div className="container">
      <aside className="sidebar">
        <div className="menu">
          <p className="section-title">Usuario</p>
          <ul>
          <li onClick={() => setVista('carrito')} style={{ cursor: 'pointer' }}>
      Carrito
      </li>
      
      <li onClick={() => setVista('Descargas')} style={{ cursor: 'pointer' }}>
      Descargas
      </li>
      <li  className='active' onClick={() => setVista('favoritos')} style={{ cursor: 'pointer' }}>
      Favoritos
        </li>           
            <li>Regalos</li>
          </ul>
          <p className="section-title">Categorías</p>
          <ul>
            <li>Audio</li>
            <li>Imágenes</li>
            <li>Videos</li>
          </ul>
        </div>
        <div className="chat-box">
          <p>
            <strong>Usuario 1</strong> te envió un regalo
          </p>
          <a href="#">¡Desocúpate!</a>
        </div>
      </aside>
      <main className="main-content">
        <h2>Videos Favoritos</h2>
        <div className="item">
          <img
            src="https://img.icons8.com/ios-filled/100/video.png"
            alt="Video1"
          />
          <div className="info">
            <p>
              <strong>Video1.MP4</strong>
              <br />
              Autor: 1 | Categoría: 2 | 1025 MB
            </p>
            <p>Descripción: Lorem ipsum dolor sit amet...</p>
            <div className="buttons">
              <button className="btn-black">Añadir al carrito</button>
              <button className="btn-red">Quitar de favoritos</button>
            </div>
          </div>
          <div className="price">$5.89</div>
        </div>
        <div className="item">
          <img
            src="https://img.icons8.com/ios-filled/100/video.png"
            alt="Video2"
          />
          <div className="info">
            <p>
              <strong>Video1.MP4</strong>
              <br />
              Autor: 1 | Categoría: 2 | 1025 MB
            </p>
            <p>Descripción: Lorem ipsum dolor sit amet...</p>
            <div className="buttons">
              <button className="btn-black">Añadir al carrito</button>
              <button className="btn-red">Quitar de favoritos</button>
            </div>
          </div>
          <div className="price">$5.89</div>
        </div>
        <h2>Audios Favoritos</h2>
        <div className="item">
          <img
            src="https://img.icons8.com/ios-filled/50/000000/audio.png"
            alt="Audio"
          />
          <div className="info">
            <p>
              <strong>Audio1.MP3</strong>
              <br />
              Autor: 2 | Categoría: 3 | 9 MB
            </p>
            <p>Descripción: Lorem ipsum dolor sit amet...</p>
            <div className="buttons">
              <button className="btn-black">Añadir al carrito</button>
              <button className="btn-red">Quitar de favoritos</button>
            </div>
          </div>
          <div className="price">$5.89</div>
        </div>
        <div className="item">
          <img src="audio.png" alt="Audio" />
          <div className="info">
            <p>
              <strong>Audio1.MP3</strong>
              <br />
              Autor: 2 | Categoría: 3 | 9 MB
            </p>
            <p>Descripción: Lorem ipsum dolor sit amet...</p>
            <div className="buttons">
              <button className="btn-black">Añadir al carrito</button>
              <button className="btn-red">Quitar de favoritos</button>
            </div>
          </div>
          <div className="price">$5.89</div>
        </div>
      </main>
    </div>
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
        <p className="attribution">
          Icons by{" "}
          <a href="https://icons8.com" target="_blank" rel="noopener noreferrer">
            Icons8
          </a>
        </p>
      </div>
    </footer>
  </>
  
  );
}
