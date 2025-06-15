import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import CarruselOfertas from './CarruselOfertas';
import { traerContenido } from './traerContenido';
import { supabase } from './supabaseClient';
import { agregarAFavoritos } from './Gestor_Favoritos';
import './CarruselOfertas.css';

// HOC para navegación con react-router v6
function withNavigation(Component: any) {
  return function Wrapper(props: any) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

// Tipos ajustados a tu nueva base de datos
type Contenido = {
  id_contenido: number;
  nombre: string;
  autor?: string;
  archivo?: string;
  fecha_subida?: string;
  tipo?: string;
  formato?: string;
  id_categoria?: number;
  // Puedes agregar más campos según la tabla contenido
};

type Categoria = {
  id_categoria: number;
  nombre: string;
};

type Subcategoria = {
  id_categoria: number;
  nombre: string;
};

type IAdministradorProps = {
  navigate: NavigateFunction;
};

type IAdministradorState = {
  contenidos: Contenido[];
  filteredContenidos: Contenido[];
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
      contenidos: [],
      filteredContenidos: [],
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
    await this.fetchContenidos();
    await this.fetchCategorias();
    await this.fetchSubcategorias();
  }

  fetchContenidos = async () => {
    const contenidosData = await traerContenido();
    this.setState({ contenidos: contenidosData, filteredContenidos: contenidosData });
  };

  fetchCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('*').is('id_categoria_padre', null);
    if (error) {
      console.error('Error al obtener categorías:', error);
    } else {
      this.setState({ categorias: data || [] });
    }
  };

  fetchSubcategorias = async () => {
    // Subcategorías: aquellas que tienen id_categoria_padre no null
    const { data, error } = await supabase.from('categorias').select('*').not('id_categoria_padre', 'is', null);
    if (error) {
      console.error('Error al obtener subcategorías:', error);
    } else {
      this.setState({ subcategorias: data || [] });
    }
  };

  handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    this.setState({ busqueda: query }, () => {
      this.filtrarContenidos(query, this.state.categoria, this.state.subcategoria);
    });
  };

  handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoria = e.target.value;
    this.setState({ categoria: selectedCategoria }, () => {
      this.filtrarContenidos(this.state.busqueda, selectedCategoria, this.state.subcategoria);
    });
  };

  handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubcategoria = e.target.value;
    this.setState({ subcategoria: selectedSubcategoria }, () => {
      this.filtrarContenidos(this.state.busqueda, this.state.categoria, selectedSubcategoria);
    });
  };

  filtrarContenidos = (query: string, categoria: string, subcategoria: string) => {
    let filtered = this.state.contenidos;

    if (query) {
      filtered = filtered.filter((contenido: Contenido) =>
        contenido.nombre.toLowerCase().includes(query) ||
        (contenido.autor?.toLowerCase().includes(query) ?? false)
      );
    }

    if (categoria) {
      filtered = filtered.filter((contenido: Contenido) => String(contenido.id_categoria) === categoria);
    }

    if (subcategoria) {
      filtered = filtered.filter((contenido: Contenido) => String(contenido.id_categoria) === subcategoria);
    }

    this.setState({ filteredContenidos: filtered, page: 1 });
  };

  agregarACarrito = async (id_contenido: number) => {
    try {
      // Busca id_user en sessionStorage
      const id_user = sessionStorage.getItem('user_id');
      if (!id_user) {
        alert('Debes iniciar sesión');
        return;
      }

      // Buscar o crear carrito
      const { data: carritoExistente, error: errorBuscar } = await supabase
        .from('carrito')
        .select('id_carrito')
        .eq('id_user', id_user)
        .maybeSingle();

      let carritoId = carritoExistente?.id_carrito;

      if (!carritoId) {
        const { data: nuevoCarrito, error: errorCrear } = await supabase
          .from('carrito')
          .insert({ id_user: id_user, monto_total: 0, monto_a_pagar: 0 })
          .select()
          .single();

        if (errorCrear) throw errorCrear;
        carritoId = nuevoCarrito.id_carrito;
      }

      // Insertar detalle en el carrito
      const { error: errorDetalle } = await supabase
        .from('detalle_carrito')
        .insert([{ id_carrito: carritoId, id_contenido }]);

      if (errorDetalle) throw errorDetalle;

      alert('Contenido agregado al carrito con éxito.');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito. Por favor, intenta de nuevo.');
    }
  };

  // ACCIONES DE NAVEGACIÓN ADMIN
  goToCategorias = () => this.props.navigate('/admin/categorias');
  goToContenidos = () => this.props.navigate('/admin/productos'); // o '/admin/contenidos' si tienes esa ruta
  goToOfertas = () => this.props.navigate('/admin/ofertas');
  goToUsuarios = () => this.props.navigate('/admin/usuarios');
  goToVentas = () => this.props.navigate('/admin/ventas');
  goToBienvenida = () => this.props.navigate('/bienvenida');
  goToInicioAdmin = () => this.props.navigate('/IAdministrador');

  setPage = (page: number) => {
    this.setState({ page });
  };

  render() {
    const {
      filteredContenidos,
      categorias,
      subcategorias,
      busqueda,
      categoria,
      subcategoria,
      page,
      itemsPerPage,
    } = this.state;

    const totalPages = Math.ceil(filteredContenidos.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentContenidos = filteredContenidos.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="principal-container">
        <header className="top-bar">
          <h1>Panel de Administración</h1>
          <div className="top-info">
            <span>Admin</span>
          </div>
        </header>

        <main className="contenido-principal">
          {/* Sidebar profesional con todas las acciones y navegación */}
          <aside className="sidebar">
            <ul>
              <li onClick={this.goToInicioAdmin}>Inicio Admin</li>
              <li onClick={this.goToCategorias}>Gestionar Categorías</li>
              <li onClick={this.goToContenidos}>Gestionar Contenidos</li>
              <li onClick={this.goToOfertas}>Gestionar Ofertas</li>
              <li onClick={this.goToUsuarios}>Gestionar Usuarios</li>
              <li onClick={this.goToVentas}>Gestionar Ventas</li>
              <li onClick={this.goToBienvenida}>Vista Usuario</li>
            </ul>
          </aside>

          <section className="recomendaciones">
            <h3>Explorar Contenidos</h3>
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
                  <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                ))}
              </select>
              <select id="subcategoria" value={subcategoria} onChange={this.handleSubcategoriaChange}>
                <option value="">Todas las Subcategorías</option>
                {subcategorias.map((subcat: Subcategoria) => (
                  <option key={subcat.id_categoria} value={subcat.id_categoria}>{subcat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="cards">
              {currentContenidos.map((contenido: Contenido) => (
                <div className="card" key={contenido.id_contenido}>
                  <img
                    src={contenido.archivo || "https://via.placeholder.com/150"}
                    alt={contenido.nombre}
                    onClick={() => this.props.navigate(`/admin/contenido/${contenido.id_contenido}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>{contenido.nombre}</p>
                  <div className="botones">
                    <button onClick={() => this.agregarACarrito(contenido.id_contenido)} style={{ marginRight: '1rem' }}>
                      🛒 
                    </button>
                    <button
                      onClick={async () => {
                        const id_user = sessionStorage.getItem('user_id');
                        if (!id_user) {
                          alert('Debes iniciar sesión');
                          return;
                        }
                        const mensaje = await agregarAFavoritos(contenido.id_contenido, id_user);
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

            {/* Sección de Ofertas */}
            <section style={{ marginTop: "2rem" }}>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1rem" }}>
                  <h4 style={{ margin: 0 }}>Ofertas Destacadas</h4>
                  <button
                    style={{
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: "bold"
                    }}
                    onClick={this.goToOfertas}
                  >
                    + Gestionar Oferta
                  </button>
                </div>
                <CarruselOfertas />
              </div>
            </section>
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