import { Usuario } from './Usuario';
import { Categoria } from './Categoria';
import { Promocion } from './Promocion';
import { Gestor_Categoria } from './Gestor_Categoria';
import { Gestor_Producto } from './Gestor_producto';
import { Producto } from './Producto';

export class Administrador {
  id: number;
  email: string;
  contraseña_hash: string;
  nombre: string;
  fecha_creacion: Date;
  ultimo_acceso: Date;
  estado: string;

  constructor(
    id: number,
    email: string,
    contraseña_hash: string,
    nombre: string,
    fecha_creacion: Date,
    ultimo_acceso: Date,
    estado: string
  ) {
    this.id = id;
    this.email = email;
    this.contraseña_hash = contraseña_hash;
    this.nombre = nombre;
    this.fecha_creacion = fecha_creacion;
    this.ultimo_acceso = ultimo_acceso;
    this.estado = estado;
  }

  // 1. Cargar dinero a la cuenta de un usuario
  cargarSaldoAUsuario(usuario: Usuario, monto: number) {
    usuario.saldo += monto;
    // Aquí podrías registrar la transacción en un historial si lo deseas
  }

  // 2. Crear una categoría (usa el gestor)
  async agregarCategoria(nombre: string, categoriaPadreId?: number | null): Promise<Categoria> {
    const nuevaCategoria = await Gestor_Categoria.crearCategoria(nombre, categoriaPadreId ?? null);
    return nuevaCategoria;
  }

  // 3. Editar una categoría
  async editarCategoria(id: number, nombre: string, categoriaPadreId?: number | null): Promise<Categoria> {
    const categoriaEditada = await Gestor_Categoria.editarCategoria(id, nombre, categoriaPadreId ?? null);
    return categoriaEditada;
  }

  // 4. Eliminar una categoría
  async eliminarCategoria(id: number): Promise<boolean> {
    return await Gestor_Categoria.eliminarCategoria(id);
  }

  // 5. Listar categorías
  async listarCategorias(): Promise<Categoria[]> {
    return await Gestor_Categoria.listarCategorias();
  }

  // 6. Crear producto
  async agregarProducto(producto: Omit<Producto, 'id'>): Promise<Producto> {
    return await Gestor_Producto.crearProducto(producto);
  }

  // 7. Editar producto
  async editarProducto(id: number, cambios: Partial<Omit<Producto, 'id'>>): Promise<Producto> {
    return await Gestor_Producto.editarProducto(id, cambios);
  }

  // 8. Eliminar producto
  async eliminarProducto(id: number): Promise<boolean> {
    return await Gestor_Producto.eliminarProducto(id);
  }

  // 9. Listar productos
  async listarProductos(): Promise<Producto[]> {
    return await Gestor_Producto.listarProductos();
  }
}
