import { supabase } from './supabaseClient';

/*async function obtenerGrupoDeFavoritos(usuarioId: number) {
  try {
    let { data: favoritosExistente, error: errorBuscar } = await supabase
      .from('favoritos')
      .select('id_favoritos')
      .eq('id_user', usuarioId)
      .maybeSingle();

    if (errorBuscar) throw errorBuscar;

    if (!favoritosExistente) {
      const { data: nuevoFavorito, error: errorInsertar } = await supabase
        .from('favoritos')
        .insert({ id_user: usuarioId })
        .select('id_favoritos')
        .single();

      if (errorInsertar) throw errorInsertar;

      return nuevoFavorito.id_favoritos;
    }

    return favoritosExistente.id_favoritos;
  } catch (error) {
    console.error('❌ Error al obtener grupo de favoritos:', error);
    throw error;
  }
}*/


export async function agregarAFavoritos(productoId: number, usuarioId: number): Promise<string> {
  try {
    // Verificar si el producto ya está en favoritos para ese usuario
    const { data: favoritoExistente, error: errorBuscar } = await supabase
      .from('favoritos')
      .select('id_favoritos')
      .eq('id_user', usuarioId)
      .eq('id_contenido', productoId)
      .maybeSingle();

    if (errorBuscar) throw errorBuscar;

    if (favoritoExistente) {
      return 'El producto ya está en favoritos.';
    }

    // Insertar nuevo favorito
    const { error: errorInsertar } = await supabase
      .from('favoritos')
      .insert([{ id_user: usuarioId, id_contenido: productoId }]);

    if (errorInsertar) throw errorInsertar;

    return 'Producto agregado a favoritos con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar a favoritos:', error);
    return 'Error al agregar a favoritos. Por favor, intenta de nuevo.';
  }
}
