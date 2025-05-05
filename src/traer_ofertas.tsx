import { supabase } from './supabaseClient';

export async function traerOfertas() {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .select(`
        id,
        url_banner,
        producto_id,
        productos (
          id,
          nombre,
          descripcion,
          url_imagen,
          precio
        )
      `);

    if (error) {
      console.error('Error cargando ofertas:', error);
      return [];
    }

    // Filtramos las ofertas que no tienen producto_id o datos inválidos
    return data.filter(oferta => oferta && oferta.producto_id && oferta.productos);
  } catch (err) {
    console.error('Error inesperado cargando ofertas:', err);
    return [];
  }
}