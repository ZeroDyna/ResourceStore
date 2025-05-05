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

    // Verificar si el producto ya está en favoritos
    const { data: detalleExistente, error: errorBuscarDetalle } = await supabase
      .from('detalle_favorito')
      .select('id')
      .eq('favorito_id', favoritoId)
      .eq('producto_id', productoId)
      .maybeSingle();

    if (errorBuscarDetalle) throw errorBuscarDetalle;

    if (detalleExistente) {
      return 'El producto ya está en favoritos.';
    }

    // Insertar en detalle_favorito
    const { error: errorInsertar } = await supabase
      .from('detalle_favorito')
      .insert([{ favorito_id: favoritoId, producto_id: productoId }]);

    if (errorInsertar) throw errorInsertar;

    return 'Producto agregado a favoritos con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar a favoritos:', error);
    return 'Error al agregar a favoritos. Por favor, intenta de nuevo.';
  }
}