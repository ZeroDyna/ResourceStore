import { supabase } from './supabaseClient';
import { Categoria } from './Categoria';

export class Gestor_Categoria {
  // Crear categoría
  static async crearCategoria(nombre: string, categoriaPadre?: number | null) {
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, categoria_padre: categoriaPadre ?? null }])
      .select()
      .single();
    if (error) throw error;
    return new Categoria(data.id, data.nombre, data.categoria_padre);
  }

  // Editar categoría
  static async editarCategoria(id: number, nombre: string, categoriaPadre?: number | null) {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre, categoria_padre: categoriaPadre ?? null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return new Categoria(data.id, data.nombre, data.categoria_padre);
  }

  // Eliminar categoría
  static async eliminarCategoria(id: number) {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Listar categorías
  static async listarCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) throw error;
    return (data || []).map(
      (cat: any) => new Categoria(cat.id, cat.nombre, cat.categoria_padre)
    );
  }
}