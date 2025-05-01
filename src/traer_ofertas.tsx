import { supabase } from './supabaseClient';

export async function traerOfertas() {
  const { data, error } = await supabase
    .from('ofertas')
    .select('url_banner, producto_id');

  if (error) {
    console.error('Error cargando ofertas:', error);
    return [];  // Siempre retornamos un array vacío si hay error
  }

  return data || [];  // Aseguramos que se retorna un array (vacío si no hay data)
}
