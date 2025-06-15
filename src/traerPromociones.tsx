import { supabase } from './supabaseClient';

/**
 * Trae todas las promociones, incluyendo los datos del contenido relacionado.
 */
export async function traerPromociones() {
  try {
    const { data, error } = await supabase
      .from('promociones')
      .select(`
        id_promocion,
        descripcion,
        fecha_ini,
        fecha_fin,
        porcentaje,
        id_admin,
        id_contenido,
        contenido: id_contenido (
          id_contenido,
          nombre,
          autor,
          archivo,
          formato
        )
      `);

    if (error) {
      console.error('Error cargando promociones:', error);
      return [];
    }

    // Devuelve todas las promociones, ahora el objeto 'contenido' vendrá anidado si existe relación
    return data || [];
  } catch (err) {
    console.error('Error inesperado cargando promociones:', err);
    return [];
  }
}

export default traerPromociones;