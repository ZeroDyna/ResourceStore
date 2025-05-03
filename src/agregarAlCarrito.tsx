import { supabase } from './supabaseClient'; // Ajusta según tu proyecto

export async function agregarACarrito(productoId: number, usuarioId: string): Promise<string> {
  try {
    // 1. Buscar si ya existe un carrito para este usuario
    let { data: carritoExistente, error: errorBuscar } = await supabase
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

    // 3. Insertar en detalle_carrito
    const { error: errorInsertarDetalle } = await supabase
      .from('detalle_carrito')
      .insert([{ carrito_id: carritoId, producto_id: productoId }]);

    if (errorInsertarDetalle) throw errorInsertarDetalle;

    return 'Producto agregado al carrito con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    return 'Error al agregar al carrito. Por favor, intenta de nuevo.';
  }
}

export async function quitarDeCarrito(productoId: number, usuarioId: string): Promise<string> {
  try {
    const { data: detalleData, error: detalleError } = await supabase
      .from('detalle_carrito')
      .select('id')
      .eq('producto_id', productoId)
      .maybeSingle();

    if (detalleError || !detalleData) {
      throw new Error('No se encontró el detalle del carrito para el producto dado.');
    }

    const detalleCarritoId = detalleData.id;

    const { error: deleteError } = await supabase
      .from('detalle_carrito')
      .delete()
      .eq('id', detalleCarritoId);

    if (deleteError) throw deleteError;

    return 'Producto eliminado del carrito con éxito.';
  } catch (error) {
    console.error('❌ Error al quitar del carrito:', error);
    return 'Error al eliminar del carrito. Por favor, intenta de nuevo.';
  }
}