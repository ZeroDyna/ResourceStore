import { supabase } from './supabaseClient';
import { Promocion } from './Promocion';

export const Gestor_Promocion = {
  listarPromociones: async (): Promise<Promocion[]> => {
    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('activa', true); // Solo activas
    if (error) throw error;
    return data || [];
  },

  crearPromocion: async (promo: Omit<Promocion, 'id_promocion'>) => {
    const cleanPromo = { activa: true, ...promo }; // Fuerza activa=true al crear
    Object.keys(cleanPromo).forEach(k => {
      if (cleanPromo[k as keyof typeof cleanPromo] === '') cleanPromo[k as keyof typeof cleanPromo] = null as any;
    });
    const { error } = await supabase
      .from('promociones')
      .insert([cleanPromo]);
    if (error) throw error;
    return true;
  },

  actualizarPromocion: async (id_promocion: number, promo: Partial<Omit<Promocion, 'id_promocion'>>) => {
    const cleanPromo = { ...promo };
    Object.keys(cleanPromo).forEach(k => {
      if (cleanPromo[k as keyof typeof cleanPromo] === '') cleanPromo[k as keyof typeof cleanPromo] = null as any;
    });
    const { error } = await supabase
      .from('promociones')
      .update(cleanPromo)
      .eq('id_promocion', id_promocion);
    if (error) throw error;
    return true;
  },

  eliminarPromocion: async (id_promocion: number) => {
    // Borrado lógico: activa = false
    const { error } = await supabase
      .from('promociones')
      .update({ activa: false })
      .eq('id_promocion', id_promocion);
    if (error) throw error;
    return true;
  }
};