import { supabase } from './supabaseClient';

export async function agregarACarrito(productoId: number, usuarioId: number): Promise<string> {
  try {
    // 1. Verificar si ya existe ese producto en el carrito del usuario
    const { data: productoEnCarrito, error: errorBuscar } = await supabase
      .from('carrito')
      .select('id_carrito')
      .eq('id_user', usuarioId)
      .eq('id_contenido', productoId)
      .maybeSingle();

    if (errorBuscar) {
      console.error('❌ Error al buscar producto en carrito:', errorBuscar);
      throw errorBuscar;
    }

    if (productoEnCarrito) {
      return 'El producto ya está en el carrito.';
    }

    // 2. Insertar nuevo producto en el carrito
    const insertData = {
      id_user: usuarioId,
      id_contenido: productoId,
      monto_total: 0,
      monto_a_pagar: 0,
    };

    console.log('📦 Insertando:', insertData);

    const { data, error: errorInsertar } = await supabase
      .from('carrito')
      .insert([insertData])
      .select();

    if (errorInsertar) {
      console.error('❌ Error al insertar en carrito:', errorInsertar);
      throw errorInsertar;
    }

    console.log('✅ Producto insertado en carrito:', data);
    return 'Producto agregado al carrito con éxito.';
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    return 'Error al agregar al carrito. Por favor, intenta de nuevo.';
  }
}
