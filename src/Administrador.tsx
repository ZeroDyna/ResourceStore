import { Usuario } from './Usuario';
// Importa también las clases necesarias
import { Categoria } from './Categoria';
import { Contenido } from './Contenido';
import { Promocion } from './Promocion';

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

  // 2. Agregar contenido al portal
  agregarContenido(contenido: Contenido) {
    // Lógica para agregar el contenido a la base de datos
  }

  // 3. Dar de baja contenido del portal
  darDeBajaContenido(contenido: Contenido) {
    // Lógica para marcar como inactivo o eliminar el contenido
  }

  // 4. Crear una categoría (puede ser raíz o hija)
  agregarCategoria(nombre: string, categoriaPadreId?: number | null): Categoria {
    const nuevaCategoria = new Categoria(
      Date.now(), // O el id que arroje la base de datos
      nombre,
      categoriaPadreId ?? null
    );
    // Aquí agregarías la lógica real para guardar en la base de datos
    return nuevaCategoria;
  }

  // 5. Ingresar promoción
  ingresarPromocion(promocion: Promocion) {
    // Lógica para agregar la promoción a la base de datos
  }

  // 6. Listar usuarios (puedes agregar filtros)
  listarUsuarios(): Usuario[] {
    // Devuelve todos los usuarios registrados
    return [];
  }

  // 7. Listar contenidos
  listarContenidos(): Contenido[] {
    // Devuelve todos los contenidos
    return [];
  }

  // 8. Listar categorías
  listarCategorias(): Categoria[] {
    // Devuelve todas las categorías
    return [];
  }

  // 9. Listar promociones
  listarPromociones(): Promocion[] {
    // Devuelve todas las promociones
    return [];
  }
}