export class Categoria {
  id: number;
  nombre: string;
  categoria_padre?: number | null; // id de la categoría padre

  constructor(id: number, nombre: string, categoria_padre?: number | null) {
    this.id = id;
    this.nombre = nombre;
    this.categoria_padre = categoria_padre ?? null;
  }
}