export type TipoSolicitudCodigo = 'REGISTRO_ASIGNATURAS' | 'HOMOLOGACION' | 'CANCELACION' | 'SOLICITUD_CUPO' | 'CONSULTA_ACADEMICA' | 'OTRO';
export type EstadoSolicitud = 'REGISTRADA' | 'CLASIFICADA' | 'EN_ATENCION' | 'ATENDIDA' | 'CERRADA';
export type PrioridadNivel = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type CanalOrigen = 'CSU' | 'CORREO' | 'SAC' | 'TELEFONICO' | 'PRESENCIAL' | 'OTRO';

export interface Prioridad {
  nivel?: PrioridadNivel;
  justificacion?: string;
  fechaLimite?: string;
}

export interface RefUsuario {
  id: string;
  nombre: string;
  rol?: string;
}

export interface Solicitud {
  id: string;
  tipo: TipoSolicitudCodigo;
  descripcion: string;
  canalOrigen: CanalOrigen;
  fechaCreacion: string;
  solicitante: RefUsuario;
  responsable?: RefUsuario | null;
  estado: EstadoSolicitud;
  prioridad?: Prioridad | null;
  observacion?: string;
  observacionCierre?: string;
  respuesta?: string;
  fechaLimite?: string | null;
  tipoSugerenciaIa?: TipoSolicitudCodigo | null;
  prioridadSugerenciaIa?: PrioridadNivel | null;
  valorConfianzaIa?: number | null;
}

export interface CrearSolicitudRequest {
  tipo: TipoSolicitudCodigo;
  descripcion: string;
  canalOrigen: CanalOrigen;
  solicitanteId?: string;
  fechaLimite?: string;
}

export interface ClasificarSolicitudRequest {
  tipo: TipoSolicitudCodigo;
  observacion?: string;
}

export interface PriorizarSolicitudRequest {
  prioridad: PrioridadNivel;
  justificacion: string;
}

export interface AsignarSolicitudRequest {
  responsableId: string;
  observacion?: string;
}

export interface ResolverSolicitudRequest {
  respuesta: string;
}

export interface CerrarSolicitudRequest {
  observacionCierre: string;
}

export interface HistorialAccion {
  id: string;
  solicitudId: string;
  accion: string;
  usuario?: RefUsuario | null;
  timestamp: string;
  observacion?: string;
}

export interface PagedResponse<T> {
  total: number;
  items: T[];
}

export interface ActualizarSolicitudRequest {
  descripcion?: string;
  fechaLimite?: string;
}

export interface SugerenciaResponse {
  suggestedType: TipoSolicitudCodigo;
  suggestedPriority: PrioridadNivel;
  confidence: number;
}

export interface SolicitudApiResponse {
  id: string;
  tipo: TipoSolicitudCodigo;
  descripcion: string;
  canalOrigen: CanalOrigen;
  timestamp: string;
  solicitante: RefUsuario;
  estado: EstadoSolicitud;
  prioridad?: PrioridadNivel | null;
  justificacionPrioridad?: string | null;
  responsable?: RefUsuario | null;
  fechaLimite?: string | null;
  observacion?: string | null;
  observacionCierre?: string | null;
  respuesta?: string | null;
  tipoSugerenciaIa?: TipoSolicitudCodigo | null;
  prioridadSugerenciaIa?: PrioridadNivel | null;
  valorConfianzaIa?: number | null;
}

export interface HistorialAccionApiResponse {
  id: string;
  solicitudId: string;
  accion: string;
  usuario?: RefUsuario | null;
  timestamp: string;
  observacion?: string | null;
}
