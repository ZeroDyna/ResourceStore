export interface Promocion {
  id_promocion: number;
  id_admin: string;
  porcentaje: number;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string;
  activa: boolean;
  url_banner: string;
  id_contenido?: number | null;
}