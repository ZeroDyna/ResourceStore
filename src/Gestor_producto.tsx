import { supabase } from './supabaseClient';
import { Producto } from './Producto';

export class Gestor_Producto {
  // Crear producto
  static async crearProducto(producto: Omit<Producto, 'id'>) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single();
    if (error) throw error;
    return new Producto(
      data.id, data.nombre, data.descripcion, data.autor, data.precio,
      data.calificacion, data.categoria, data.admin_creador_id,
      data.fecha_creacion, data.fecha_actualizacion, data.activo, data.url_imagen
    );
  }

  // Editar producto
  static async editarProducto(id: number, cambios: Partial<Omit<Producto, 'id'>>) {
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return new Producto(
      data.id, data.nombre, data.descripcion, data.autor, data.precio,
      data.calificacion, data.categoria, data.admin_creador_id,
      data.fecha_creacion, data.fecha_actualizacion, data.activo, data.url_imagen
    );
  }

  // Eliminar producto
  static async eliminarProducto(id: number) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Listar productos
  static async listarProductos(): Promise<Producto[]> {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) throw error;
    return (data || []).map(
      (prod: any) =>
        new Producto(
          prod.id, prod.nombre, prod.descripcion, prod.autor, prod.precio,
          prod.calificacion, prod.categoria, prod.admin_creador_id,
          prod.fecha_creacion, prod.fecha_actualizacion, prod.activo, prod.url_imagen
        )
    );
  }
}