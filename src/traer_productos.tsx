import { supabase } from './supabaseClient';

export async function traer_Productos() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, categoria_id, subcategoria_id, url_imagen, descripcion');

  if (error) {
    console.error('Error cargando productos:', error);
    return []; // Siempre retornamos un array vacío si hay error
  }

  return data || []; // Aseguramos que se retorna un array (vacío si no hay data)
}