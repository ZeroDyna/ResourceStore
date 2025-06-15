import { supabase } from './supabaseClient';

export async function traerContenido() {
  const { data, error } = await supabase
    .from('contenido')
    .select('id_contenido, nombre, autor, archivo, formato');

  if (error) {
    console.error('Error cargando contenido:', error);
    return [];
  }

  return data || [];
}
export default traerContenido;