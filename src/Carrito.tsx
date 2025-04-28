import './carrito.css';
type PrincipalProps = {
  setVista: (vista: string) => void;
};
export function Carrito({ setVista }: PrincipalProps) {
  return (
    <>
      {/* Este meta y title NO son necesarios dentro de un componente de React */}
      <header>
        <h1>Resources store</h1>
        <div className="header-right">
          <button className="recargar">Recargar</button>
          <span className="saldo">Mi saldo: $400</span>
          <span className="usuario">USER_1</span>
        </div>
      </header>
      <div className="container">
      <aside className="sidebar">
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

      <li>Categorías</li>
      <li>Imágenes</li>
      <li>Videos</li>
    </ul>
  </aside>
        <main>
          <div className="search-bar">
            <input type="text" placeholder="🔍 Buscar" />
          </div>
          <section className="recursos">
            <h2>Videos</h2>
            <div className="item">
              <img
                src="https://img.icons8.com/ios-filled/100/video.png"
                alt="Video"
              />
              <div className="info">
                <strong>Video1.MP4</strong>
                <br />
                Categoría 2<br />
                1025 MB
                <br />
                <p>Descripción: Lorem ipsum dolor sit amet...</p>
                <button className="agregar">🛒 Agregar</button>
              </div>
              <div className="precio">$5.89</div>
            </div>

            <h2>Imágenes</h2>
            <div className="item">
              <img
                src="https://img.icons8.com/ios-filled/100/image.png"
                alt="Imagen"
              />
              <div className="info">
                <strong>Imagen1.PNG</strong>
                <br />
                Categoría 2<br />
                1 MB
                <br />
                <p>Descripción: Lorem ipsum dolor sit amet...</p>
                <button className="agregar">🛒 Agregar</button>
              </div>
              <div className="precio">$5.89</div>
            </div>
          </section>
          <div className="pago-final">
            <p>
              Total a pagar: <strong>$29.45</strong>
            </p>
            <button className="pagar">Pagar</button>
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
        </div>
      </footer>
    </>
  );
}
export default Carrito;