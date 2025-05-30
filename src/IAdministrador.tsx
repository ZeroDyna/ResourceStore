import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traer_Productos } from './traer_Productos';
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import './CarruselOfertas.css';

// HOC para usar useNavigate con clase
function withNavigation(Component: any) {
  return function Wrapper(props: any) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_id?: string;
  subcategoria_id?: string;
  url_imagen?: string;
};

type Categoria = {
  id: number;
  nombre: string;
};

type Subcategoria = {
  id: number;
  nombre: string;
};

type IAdministradorProps = {
  navigate: NavigateFunction;
};

type IAdministradorState = {
  productos: Producto[];
  filteredProductos: Producto[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  busqueda: string;
  categoria: string;
  subcategoria: string;
  page: number;
  itemsPerPage: number;
};

class IAdministrador extends React.Component<IAdministradorProps, IAdministradorState> {
  constructor(props: IAdministradorProps) {
    super(props);
    this.state = {
      productos: [],
      filteredProductos: [],
      categorias: [],
      subcategorias: [],
      busqueda: '',
      categoria: '',
      subcategoria: '',
      page: 1,
      itemsPerPage: 4,
    };
  }

  async componentDidMount() {
    await this.fetchProductos();
    await this.fetchCategorias();
    await this.fetchSubcategorias();
  }

  fetchProductos = async () => {
    const productosData = await traer_Productos();
    this.setState({ productos: productosData, filteredProductos: productosData });
  };

  fetchCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) {
      console.error('Error al obtener categorías:', error);
    } else {
      this.setState({ categorias: data || [] });
    }
  };

  fetchSubcategorias = async () => {
    const { data, error } = await supabase.from('subcategorias').select('*');
    if (error) {
      console.error('Error al obtener subcategorías:', error);
    } else {
      this.setState({ subcategorias: data || [] });
    }
  };

  handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    this.setState({ busqueda: query }, () => {
      this.filtrarProductos(query, this.state.categoria, this.state.subcategoria);
    });
  };

  handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoria = e.target.value;
    this.setState({ categoria: selectedCategoria }, () => {
      this.filtrarProductos(this.state.busqueda, selectedCategoria, this.state.subcategoria);
    });
  };

  handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubcategoria = e.target.value;
    this.setState({ subcategoria: selectedSubcategoria }, () => {
      this.filtrarProductos(this.state.busqueda, this.state.categoria, selectedSubcategoria);
    });
  };

  filtrarProductos = (query: string, categoria: string, subcategoria: string) => {
    let filtered = this.state.productos;

    if (query) {
      filtered = filtered.filter((producto: Producto) =>
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
      );
    }

    if (categoria) {
      filtered = filtered.filter((producto: Producto) => producto.categoria_id == categoria);
    }

    if (subcategoria) {
      filtered = filtered.filter((producto: Producto) => producto.subcategoria_id == subcategoria);
    }

    this.setState({ filteredProductos: filtered, page: 1 });
  };

  agregarACarrito = async (productoId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes iniciar sesión');
        return;
      }

      const { data: carritoExistente, error: errorBuscar } = await supabase
        .from('carritos')
        .select('id')
        .eq('usuario_id', user.id)
        .maybeSingle();

      if (errorBuscar) throw errorBuscar;

      let carritoId = carritoExistente?.id;
      if (!carritoId) {
        const { data: nuevoCarrito, error: errorCrear } = await supabase
          .from('carritos')
          .insert({ usuario_id: user.id })
          .select()
          .single();

        if (errorCrear) throw errorCrear;
        carritoId = nuevoCarrito.id;
      }

      const { error: errorDetalle } = await supabase
        .from('detalle_carrito')
        .insert([{ carrito_id: carritoId, producto_id: productoId }]);

      if (errorDetalle) throw errorDetalle;

      alert('Producto agregado al carrito con éxito.');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito. Por favor, intenta de nuevo.');
    }
  };

  handleAgregarOferta = () => {
    this.props.navigate('/admin/ofertas');
  };

  setPage = (page: number) => {
    this.setState({ page });
  };

  render() {
    const {
      filteredProductos,
      categorias,
      subcategorias,
      busqueda,
      categoria,
      subcategoria,
      page,
      itemsPerPage
    } = this.state;
    const { navigate } = this.props;

    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="principal-container">
        <header className="top-bar">
          <h1>Panel de Administración</h1>
          <div className="top-info">
            <span>Admin</span>
          </div>
        </header>

        <section>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#333' }}>Ofertas</h2>
              <button
                style={{
                  background: '#222',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={this.handleAgregarOferta}
              >
                + Agregar Oferta
              </button>
            </div>
            <CarruselOfertas />
          </div>
        </section>

        <main className="contenido-principal">
          <aside className="sidebar">
            <ul>
              <li onClick={() => navigate("/admin")}>Inicio Admin</li>
              <li onClick={() => navigate("/admin/productos")}>Todos los Productos</li>
              <li onClick={() => navigate("/admin/usuarios")}>Usuarios</li>
              <li onClick={() => navigate("/admin/ventas")}>Ventas</li>
              <li onClick={() => navigate("/admin/ofertas")}>Ofertas</li>
              <li onClick={() => navigate("/bienvenida")}>Vista Usuario</li>
            </ul>
          </aside>

          <section className="recomendaciones">
            <h3>Explorar Productos</h3>
            <div className="filtros busqueda">
              <input
                type="text"
                id="buscador"
                placeholder="Buscar contenido..."
                value={busqueda}
                onChange={this.handleBusqueda}
              />
              <select id="categoria" value={categoria} onChange={this.handleCategoriaChange}>
                <option value="">Todas las Categorías</option>
                {categorias.map((cat: Categoria) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <select id="subcategoria" value={subcategoria} onChange={this.handleSubcategoriaChange}>
                <option value="">Todas las Subcategorías</option>
                {subcategorias.map((subcat: Subcategoria) => (
                  <option key={subcat.id} value={subcat.id}>{subcat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="cards">
              {currentProductos.map((producto: Producto) => (
                <div className="card" key={producto.id}>
                  <img
                    src={producto.url_imagen}
                    alt={producto.nombre}
                    onClick={() => navigate(`/admin/producto/${producto.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>{producto.nombre}</p>
                  <div className="botones">
                    <button onClick={() => this.agregarACarrito(producto.id)} style={{ marginRight: '1rem' }}>
                      🛒 
                    </button>
                    <button
                      onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          alert('Debes iniciar sesión');
                          return;
                        }
                        const mensaje = await agregarAFavoritos(producto.id, user.id);
                        alert(mensaje);
                      }}
                      style={{ marginRight: '1rem' }}
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="botones-paginacion">
              <button onClick={() => this.setPage(page - 1)} disabled={page === 1}>
                &lt;
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={page === index + 1 ? 'activo' : ''}
                  onClick={() => this.setPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button onClick={() => this.setPage(page + 1)} disabled={page === totalPages}>
                &gt;
              </button>
            </div>
          </section>

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
      </div>
    );
  }
}

export default withNavigation(IAdministrador);