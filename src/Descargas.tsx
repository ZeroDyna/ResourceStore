import './Descargas.css'
import './CarruselOfertas.css'

type PrincipalProps = {
  setVista: (vista: string) => void;
};
export default function Descargas({ setVista }: PrincipalProps) {
return (
    <>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resources Store - Historial</title>
    <link rel="stylesheet" href="CarruselOfertas.css" />
    <link rel="stylesheet" href="Descargas.css" />
    <header className="topbar">
      <div className="store-name">Resources store</div>
      <div className="topbar-right">
        <button className="btn-recargar">Recargar</button>
        <span className="saldo">Mi saldo: $400</span>
        <span className="username">USER_1</span>
        <div className="user-icon"> </div>
      </div>
    </header>
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Usuario</h3>
          <ul>
          <li onClick = {() => setVista('Bienvenida')} style = {{ cursor:'pointer'}}> 
      Inicio
      </li> 
      
      <li onClick={() => setVista('carrito')} style={{ cursor: 'pointer' }}>
      Carrito
      </li>
      
      <li onClick={() => setVista('Descargas')} style={{ cursor: 'pointer' }}>
      Descargas
      </li>
      <li onClick={() => setVista('favoritos')} style={{ cursor: 'pointer' }}>
  Favoritos
</li>
     </ul>
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-title">Categorías</h3>
          <ul>
            <li>
              <button>Audio</button>
            </li>
            <li>
              <button>Imágenes</button>
            </li>
            <li>
              <button>Videos</button>
            </li>
          </ul>
        </div>
      </div>
      <main className="contenido">
        <input type="text" className="buscador" placeholder="🔍 Buscar" />
        <section className="descargados">
          <h2>Videos Descargados</h2>
          <div className="recurso">
            <img
              src="https://img.icons8.com/ios-filled/100/video.png"
              alt="video"
            />
            <div>
              <p>
                <strong>Video1.MP4</strong>
              </p>
              <p>Categoría 3 - 1020 MB</p>
              <p>Descripción: Lorem ipsum dolor sit amet...</p>
              <p className="fecha">Descargado el: 15/04/2025 - 10:20 h</p>
            </div>
          </div>
          <div className="recurso">
            <img
              src="https://img.icons8.com/ios-filled/100/video.png"
              alt="video"
            />
            <div>
              <p>
                <strong>Video1.MP4</strong>
              </p>
              <p>Categoría 2 - 939 MB</p>
              <p>Descripción: Lorem ipsum dolor sit amet...</p>
              <p className="fecha">Descargado el: 15/04/2025 - 10:05 h</p>
            </div>
          </div>
          <a href="#" className="ver-todo">
            Ver Todo
          </a>
        </section>
        <section className="no-descargados">
          <h2>Imágenes No Descargadas</h2>
          <div className="recurso">
            <img
              src="https://img.icons8.com/ios-filled/100/image.png"
              alt="imagen"
            />
            <div>
              <p>
                <strong>Imagen1.PNG</strong>
              </p>
              <p>Categoría 2 - 1 MB</p>
              <p>Descripción: Lorem ipsum dolor sit amet...</p>
              <div className="acciones">
                <button className="regalar">🎁 Regalar</button>
                <button className="descargar">⬇️ Descargar</button>
              </div>
              <p className="fecha-compra">Comprado el: 15/04/2025 - 10:21 h</p>
            </div>
          </div>
          <div className="recurso">
            <img
              src="https://img.icons8.com/ios-filled/100/image.png"
              alt="imagen"
            />
            <div>
              <p>
                <strong>Imagen1.PNG</strong>
              </p>
              <p>Categoría 2 - 1 MB</p>
              <p>Descripción: Lorem ipsum dolor sit amet...</p>
              <div className="acciones">
                <button className="regalar">🎁 Regalar</button>
                <button className="descargar">⬇️ Descargar</button>
              </div>
              <p className="fecha-compra">Comprado el: 15/04/2025 - 10:21 h</p>
            </div>
          </div>
          <a href="#" className="ver-todo">
            Ver Todo
          </a>
        </section>
        <section className="no-descargados">
          <h2>Videos No Descargados</h2>
          <div className="recurso">
            <img
              src="https://img.icons8.com/ios-filled/100/video.png"
              alt="video"
            />
            <div>
              <p>
                <strong>Video1.MP4</strong>
              </p>
              <p>Categoría 1 - 1500 MB</p>
              <p>Descripción: Lorem ipsum dolor sit amet...</p>
              <div className="acciones">
                <button className="regalar">🎁 Regalar</button>
                <button className="descargar">⬇️ Descargar</button>
              </div>
              <p className="fecha-compra">Comprado el: 15/04/2025 - 10:21 h</p>
            </div>
          </div>
          <a href="#" className="ver-todo">
            Ver Todo
          </a>
        </section>
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
      </div>
    </footer>
  </>
    
);
}