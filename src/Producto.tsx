export class Producto {
  id: number;
  nombre: string;
  descripcion: string;
  autor: string;
  precio: number;
  calificacion: number;
  categoria: number;
  admin_creador_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  url_imagen: string;

  constructor(
    id: number,
    nombre: string,
    descripcion: string,
    autor: string,
    precio: number,
    calificacion: number,
    categoria: number,
    admin_creador_id: number,
    fecha_creacion: string,
    fecha_actualizacion: string,
    activo: boolean,
    url_imagen: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.autor = autor;
    this.precio = precio;
    this.calificacion = calificacion;
    this.categoria = categoria;
    this.admin_creador_id = admin_creador_id;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.activo = activo;
    this.url_imagen = url_imagen;
  }
}