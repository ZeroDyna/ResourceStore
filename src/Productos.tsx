import { Link } from 'react-router-dom';

const Productos = ({ productos }: { productos: any[] }) => {
  return (
    <div className="row">
      {productos.map((producto) => (
        <div key={producto.id} className="col-md-4">
          <div className="card">
            <img src={producto.imagen_url} className="card-img-top" alt={producto.nombre} />
            <div className="card-body">
              <h5 className="card-title">{producto.nombre}</h5>
              <p className="card-text">{producto.descripcion}</p>
              <p className="card-text">Precio: ${producto.precio}</p>

              {/* Link para redirigir a los detalles del producto */}
              <Link to={`/producto/${producto.id}`} className="btn btn-primary">
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Productos;
