import { supabase } from './supabaseClient'; // Ajusta según tu proyecto

export async function agregarACarrito(productoId: number, usuarioId: string) {
  try {
    // 1. Buscar si ya existe un grupo de favoritos para este usuario
    let {data: carritoExistente, error: errorBuscar } = await supabase
      .from('carritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();
    if (errorBuscar) throw errorBuscar;
    
    // 2. Si no existe, crearlo
    if (!carritoExistente) {
      const { data: nuevoCarrito, error: errorInsertarCarrito } = await supabase
        .from('carritos')
        .insert({ usuario_id: usuarioId })
        .select()
        .single();

      if (errorInsertarCarrito) throw errorInsertarCarrito;

      carritoExistente = nuevoCarrito;
    }
    const carritoId = carritoExistente.id;

    // 3. Insertar en detalle_favorito
    const { error: errorInsertarDetalle } = await supabase
      .from('detalle_carrito')
      .insert([{ carrito_id: carritoId, producto_id: productoId }]);

    if (errorInsertarDetalle) throw errorInsertarDetalle;

    console.log('✅ Producto agregado a carrito correctamente');
  } catch (error) {
    console.error('❌ Error al agregar carrito:', error);
  }
}
