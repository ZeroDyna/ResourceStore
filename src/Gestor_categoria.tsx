import { supabase } from './supabaseClient';

export interface Categoria {
  id_categoria: number;
  nombre: string;
  id_categoria_padre: number | null;
  id_admin: number | null;
}

export class Gestor_Categoria {
  // Crear categoría
  static async crearCategoria(
    id_categoria: number,
    nombre: string,
    id_categoria_padre?: number | null,
    id_admin?: number | null
  ): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ id_categoria, nombre, id_categoria_padre: id_categoria_padre ?? null, id_admin: id_admin ?? null }])
      .select()
      .single();
    if (error) throw error;
    return {
      id_categoria: data.id_categoria,
      nombre: data.nombre,
      id_categoria_padre: data.id_categoria_padre,
      id_admin: data.id_admin
    };
  }

  // Actualizar categoría
  static async actualizarCategoria(
    id_categoria: number,
    nombre: string,
    id_categoria_padre?: number | null,
    id_admin?: number | null
  ): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre, id_categoria_padre: id_categoria_padre ?? null, id_admin: id_admin ?? null })
      .eq('id_categoria', id_categoria)
      .select()
      .single();
    if (error) throw error;
    return {
      id_categoria: data.id_categoria,
      nombre: data.nombre,
      id_categoria_padre: data.id_categoria_padre,
      id_admin: data.id_admin
    };
  }

  // Eliminar categoría
  static async eliminarCategoria(id_categoria: number) {
    const { error } = await supabase.from('categorias').delete().eq('id_categoria', id_categoria);
    if (error) throw error;
    return true;
  }

  // Listar categorías
  static async listarCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) throw error;
    return (data || []).map(
      (cat: any) => ({
        id_categoria: cat.id_categoria,
        nombre: cat.nombre,
        id_categoria_padre: cat.id_categoria_padre,
        id_admin: cat.id_admin
      })
    );
  }
}