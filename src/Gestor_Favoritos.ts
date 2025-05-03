import { supabase } from './supabaseClient';

// Función para crear o recuperar un grupo de favoritos de un usuario
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

// Agregar un producto a favoritos
export async function agregarAFavoritos(productoId: number, usuarioId: string) {
  try {
    const favoritoId = await obtenerGrupoDeFavoritos(usuarioId);

    const { error } = await supabase
      .from('detalle_favorito')
      .insert([{ favorito_id: favoritoId, producto_id: productoId }]);

    if (error) throw error;

    return 'Producto agregado a favoritos con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar favorito:', error);
    throw error;
  }
}

// Quitar un producto de favoritos
export async function quitarDeFavoritos(productoId: number, usuarioId: string) {
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
    throw error;
  }
}

// Obtener lista de productos favoritos
export async function obtenerFavoritos(usuarioId: string) {
  try {
    const { data: favoritosData, error: favoritosError } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', usuarioId);

    if (favoritosError || !favoritosData || favoritosData.length === 0) {
      return [];
    }

    const favoritoIds = favoritosData.map((fav) => fav.id);

    const { data: detalleFavoritosData, error: detalleFavoritosError } = await supabase
      .from('detalle_favorito')
      .select('producto_id')
      .in('favorito_id', favoritoIds);

    if (detalleFavoritosError || !detalleFavoritosData || detalleFavoritosData.length === 0) {
      return [];
    }

    const productosPromises = detalleFavoritosData.map(async (detalle) => {
      const { data: productoData, error: productoError } = await supabase
        .from('productos')
        .select('id, nombre, descripcion, autor, precio, calificacion, url_imagen')
        .eq('id', detalle.producto_id)
        .single();

      if (productoError) {
        console.warn(`⚠️ Error al obtener producto ${detalle.producto_id}:`, productoError);
        return null;
      }

      return productoData;
    });

    return (await Promise.all(productosPromises)).filter(Boolean);
  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error);
    throw error;
  }
}