import { supabase } from './supabaseClient';

export async function agregarACarrito(productoId: number, usuarioId: string): Promise<string> {
  try {
    // 1. Buscar si ya existe un carrito para este usuario
    let { data: carritoExistente, error: errorBuscar } = await supabase
      .from('carritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (errorBuscar) throw errorBuscar;

    // 2. Si no existe un carrito, crearlo
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

    // 3. Verificar si el producto ya está en el carrito
    const { data: detalleExistente, error: errorBuscarDetalle } = await supabase
      .from('detalle_carrito')
      .select('id')
      .eq('carrito_id', carritoId)
      .eq('producto_id', productoId)
      .maybeSingle();

    if (errorBuscarDetalle) throw errorBuscarDetalle;

    if (detalleExistente) {
      return 'El producto ya está en el carrito.';
    }

    // 4. Insertar en detalle_carrito
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