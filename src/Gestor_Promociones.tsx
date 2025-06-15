import { supabase } from './supabaseClient';

export interface Promocion {
  id_promocion: number;
  id_admin: string;
  porcentaje: number;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string;
  activa: boolean;
  url_banner: string;
  id_contenido?: number | null;
}

export const Gestor_Promocion = {
  listarPromociones: async (): Promise<Promocion[]> => {
    const { data, error } = await supabase
      .from('promociones')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  crearPromocion: async (promo: Omit<Promocion, 'id_promocion'>) => {
    // Limpia strings vacíos a null
    const cleanPromo = { ...promo };
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
    const { error } = await supabase
      .from('promociones')
      .delete()
      .eq('id_promocion', id_promocion);
    if (error) throw error;
    return true;
  }
};