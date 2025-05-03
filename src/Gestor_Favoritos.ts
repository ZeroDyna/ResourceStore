import { supabase } from './supabaseClient';

async function obtenerGrupoDeFavoritos(usuarioId: string) {
  try {
    let { data: favoritosExistente, error: errorBuscar } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (errorBuscar) throw errorBuscar;

    if (!favoritosExistente) {
      const { data: nuevoFavorito, error: errorInsertar } = await supabase
        .from('favoritos')
        .insert({ usuario_id: usuarioId })
        .select()
        .single();

      if (errorInsertar) throw errorInsertar;

      return nuevoFavorito.id;
    }

    return favoritosExistente.id;
  } catch (error) {
    console.error('❌ Error al obtener grupo de favoritos:', error);
    throw error;
  }
}

export async function agregarAFavoritos(productoId: number, usuarioId: string): Promise<string> {
  try {
    const favoritoId = await obtenerGrupoDeFavoritos(usuarioId);

    const { error } = await supabase
      .from('detalle_favorito')
      .insert([{ favorito_id: favoritoId, producto_id: productoId }]);

    if (error) throw error;

    return 'Producto agregado a favoritos con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar a favoritos:', error);
    return 'Error al agregar a favoritos. Por favor, intenta de nuevo.';
  }
}

export async function quitarDeFavoritos(productoId: number, usuarioId: string): Promise<string> {
  try {
    const { data: detalleData, error: detalleError } = await supabase
      .from('detalle_favorito')
      .select('id')
      .eq('producto_id', productoId)
      .maybeSingle();

    if (detalleError || !detalleData) {
      throw new Error('No se encontró el detalle favorito para el producto dado.');
    }

    const detalleFavoritoId = detalleData.id;

    const { error: deleteError } = await supabase
      .from('detalle_favorito')
      .delete()
      .eq('id', detalleFavoritoId);

    if (deleteError) throw deleteError;

    return 'Producto eliminado de favoritos con éxito.';
  } catch (error) {
    console.error('❌ Error al quitar favorito:', error);
    return 'Error al eliminar de favoritos. Por favor, intenta de nuevo.';
  }
}