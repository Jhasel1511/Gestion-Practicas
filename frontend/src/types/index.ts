export type Rol = 'estudiante' | 'empresa' | 'coordinador' | 'gestor';

export type EstadoVacante = 'pendiente' | 'activa' | 'rechazada' | 'cerrada';
export type EstadoPostulacion = 'postulada' | 'seleccionada' | 'descartada';
export type EstadoPractica = 'postulada' | 'aprobada' | 'en_curso' | 'rechazada' | 'cerrada';
export type EstadoHoras = 'pendiente' | 'confirmada' | 'rechazada';
export type EstadoIncidencia = 'abierta' | 'en_revision' | 'escalada' | 'cerrada';
export type GravedadIncidencia = 'baja' | 'media' | 'alta';
export type TipoEvaluacion = 'empresa_a_estudiante' | 'estudiante_a_empresa';

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
  nombre?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  rol: Rol;
  nombre?: string | null;
}

export interface Vacante {
  id: number;
  empresa_id: number;
  titulo: string;
  area: string;
  descripcion: string;
  duracion_semanas: number;
  horas_exigidas: number;
  creditos_minimos: number;
  promedio_minimo: number;
  perfil_requerido: string;
  estado: EstadoVacante;
  creada_en?: string;
}

export interface VacanteCreateInput {
  titulo: string;
  area: string;
  descripcion: string;
  duracion_semanas: number;
  horas_exigidas: number;
  creditos_minimos: number;
  promedio_minimo: number;
  perfil_requerido: string;
}

export interface Elegibilidad {
  elegible: boolean;
  motivos: string[];
}

export interface Postulacion {
  id: number;
  vacante_id: number;
  estudiante_id: number;
  fecha_postulacion?: string;
  estado: EstadoPostulacion;
}

export interface Postulante {
  postulacion_id: number;
  estado: EstadoPostulacion;
  fecha_postulacion?: string;
  estudiante_id: number;
  estudiante_nombre: string;
  creditos_cursados: number;
  promedio: number;
  semestre: number;
}

export interface Practica {
  id: number;
  postulacion_id: number;
  coordinador_id?: number | null;
  fecha_inicio?: string | null;
  horas_requeridas: number;
  estado: EstadoPractica;
  observaciones?: string;
}

export interface RegistroHoras {
  id: number;
  practica_id: number;
  fecha: string;
  horas: number;
  estado_confirmacion: EstadoHoras;
}

export interface ProgresoHoras {
  practica_id: number;
  horas_requeridas: number;
  horas_confirmadas: number;
  horas_pendientes: number;
  porcentaje: number;
  completada: boolean;
}

export interface Evidencia {
  id: number;
  nombre_archivo: string;
}

export interface Incidencia {
  id: number;
  practica_id: number;
  reportada_por_id: number;
  gestor_id?: number | null;
  descripcion: string;
  tipo?: string | null;
  gravedad?: GravedadIncidencia | null;
  estado: EstadoIncidencia;
  motivo_escalamiento?: string;
  resolucion?: string;
  creada_en?: string;
  evidencias: Evidencia[];
}

export interface Evaluacion {
  id: number;
  practica_id: number;
  tipo: TipoEvaluacion;
  calificacion: number;
  comentarios?: string;
}

export interface Certificado {
  id: number;
  practica_id: number;
  coordinador_id: number;
  fecha_emision: string;
  estudiante_nombre: string;
  empresa_nombre: string;
  vacante_titulo: string;
  horas_totales: number;
}

export interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  creada_en?: string;
}
