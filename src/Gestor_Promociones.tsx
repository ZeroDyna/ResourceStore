import { supabase } from './supabaseClient';
import { Promocion } from './Promocion';

// Gestor que usa la tabla "ofertas" como promociones
export class Gestor_Promocion {
  static async listarPromociones(): Promise<Promocion[]> {
    const { data, error } = await supabase.from('ofertas').select('*');
    if (error) throw error;
    return data || [];
  }

  static async crearPromocion(promocion: Omit<Promocion, 'id' | 'fecha_creacion'>) {
    // fecha_creacion y id los maneja la DB
    const { data, error } = await supabase
      .from('ofertas')
      .insert([promocion])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async actualizarPromocion(id: number, cambios: Partial<Omit<Promocion, 'id' | 'fecha_creacion'>>) {
    const { data, error } = await supabase
      .from('ofertas')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async eliminarPromocion(id: number) {
    const { error } = await supabase.from('ofertas').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}