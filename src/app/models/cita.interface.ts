export interface Cita {
  id?: string;
  
  // Información básica de la cita
  fecha: Date;
  horaInicio: string; // Formato HH:mm
  horaFin: string; // Formato HH:mm
  estado: EstadoCita; // Solo confirmada, completada o cancelada
  
  // Participantes
  pacienteId: string;
  pacienteNombre: string; // Para evitar joins constantes
  medicoId: string;
  medicoNombre: string; // Para evitar joins constantes
  
  // Detalles de la cita
  tipo: TipoCita; // Solo consulta inicial, cirugía o post-operatorio
  motivo: string;
  descripcion?: string;
  observaciones?: string;
  
  // Datos del procedimiento/consulta
  procedimiento?: string;
  duracionEstimada: number; // en minutos
  costo?: number;
  
  // Control de sistema
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string; // ID del usuario que creó la cita
  
  // Recordatorios y notificaciones
  recordatorioEnviado: boolean;
  notificacionesActivas: boolean;
  
  // Para reprogramación
  citaOriginalId?: string; // Si es una reprogramación
  // motivoReprogramacion?: string; // ❌ ELIMINADO - No reprogramaciones
}

export enum EstadoCita {
  CONFIRMADA = 'confirmada',
  EN_CURSO = 'en-curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no-asistio',
  REPROGRAMADA = 'reprogramada'
}

export enum TipoCita {
  CONSULTA_INICIAL = 'consulta-inicial',
  CIRUGIA = 'cirugia',
  POST_OPERATORIO = 'post-operatorio'
}