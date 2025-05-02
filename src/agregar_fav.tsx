// agregar_fav.tsx
import { supabase } from './supabaseClient';

export async function agregarAFavoritos(productoId: number, usuarioId: string) {
  try {
    // 1. Buscar si ya existe un grupo de favoritos para este usuario
    let { data: favoritosExistente, error: errorBuscar } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (errorBuscar) throw errorBuscar;

    // 2. Si no existe, crearlo
    if (!favoritosExistente) {
      const { data: nuevoFavorito, error: errorInsertarFavorito } = await supabase
        .from('favoritos')
        .insert({ usuario_id: usuarioId })
        .select()
        .single();

      if (errorInsertarFavorito) throw errorInsertarFavorito;

      favoritosExistente = nuevoFavorito;
    }

    const favoritoId = favoritosExistente.id;

    // 3. Insertar en detalle_favorito
    const { error: errorInsertarDetalle } = await supabase
      .from('detalle_favorito')
      .insert([{ favorito_id: favoritoId, producto_id: productoId }]);

    if (errorInsertarDetalle) throw errorInsertarDetalle;

    console.log('✅ Producto agregado a favoritos correctamente');
  } catch (error) {
    console.error('❌ Error al agregar favorito:', error);
  }
}

export default agregarAFavoritos;
