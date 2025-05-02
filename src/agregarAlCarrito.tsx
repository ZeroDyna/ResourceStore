import { supabase } from '../supabaseClient'; // Ajusta según tu proyecto

async function agregarAlCarrito(productoId, usuarioId) {
  // 1. Verificar si ya hay un carrito activo
  const { data: carrito, error: errorCarrito } = await supabase
    .from('carritos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha_actualizacion', { ascending: false })
    .limit(1)
    .maybeSingle();

  let carritoId = carrito?.id;

  // 2. Si no hay carrito, crear uno nuevo
  if (!carritoId) {
    const { data: nuevoCarrito, error: errorNuevo } = await supabase
      .from('carritos')
      .insert([
        {
          usuario_id: usuarioId,
          fecha_actualizacion: new Date(),
        },
      ])
      .select()
      .single();

    if (errorNuevo) {
      console.error('Error al crear carrito', errorNuevo);
      return;
    }

    carritoId = nuevoCarrito.id;
  }

  // 3. Agregar producto al detalle_carrito
  const { error: errorDetalle } = await supabase
    .from('detalle_carrito')
    .insert([
      {
        carrito_id: carritoId,
        producto_id: productoId,
      },
    ]);

  if (errorDetalle) {
    console.error('Error al agregar producto al carrito', errorDetalle);
    return;
  }

  alert('Producto agregado al carrito');
}
