import { Timestamp } from '@angular/fire/firestore';

// ============ ENUMS ============

export enum EstadoCirugiaProgramada {
  PENDIENTE_APROBACION = 'pendiente_aprobacion',
  APROBADA = 'aprobada',
  AGENDADA = 'agendada',
  EN_PROCESO = 'en_proceso',
  PENDIENTE_OBSERVACIONES = 'pendiente_observaciones',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada'
}

export enum EstadoItemChecklist {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  NO_APLICA = 'no_aplica'
}

export enum TipoArchivoChecklist {
  LABORATORIO = 'laboratorio',
  RADIOGRAFIA = 'radiografia',
  ELECTROCARDIOGRAMA = 'electrocardiograma',
  ECOGRAFIA = 'ecografia',
  RESONANCIA = 'resonancia',
  TOMOGRAFIA = 'tomografia',
  INTERCONSULTA = 'interconsulta',
  DOCUMENTO_IDENTIDAD = 'documento_identidad',
  CONSENTIMIENTO = 'consentimiento',
  OTRO = 'otro'
}

export enum PrioridadCirugia {
  BAJA = 'baja',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente'
}

export enum TipoComplicacion {
  NINGUNA = 'ninguna',
  LEVE = 'leve',
  MODERADA = 'moderada',
  GRAVE = 'grave'
}

// ============ INTERFACES ============

export interface ItemChecklistCirugia {
  id?: string;
  nombre: string;
  descripcion: string;
  esObligatorio: boolean;
  tipoArchivo: TipoArchivoChecklist;
  estado: EstadoItemChecklist;
  archivoUrl?: string;
  nombreArchivo?: string;
  fechaSubida?: Date;
  observaciones?: string;
  fechaVencimiento?: Date; // Para exámenes que tienen fecha de validez
}

export interface PersonalAsignado {
  idPersonal: string;
  nombre: string;
  apellido: string;
  tipoPersonal: 'medico' | 'anestesiologo' | 'enfermera';
  rol: 'principal' | 'asistente'; // Para casos donde hay múltiples del mismo tipo
}

export interface AgendaCirugia {
  fechaInicio: Date;
  fechaFin: Date;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  duracionEstimadaMinutos: number;
  quirofano: string;
  observacionesAgenda?: string;
}

export interface ObservacionesCirugia {
  complicaciones: TipoComplicacion;
  detalleComplicaciones?: string;
  citasPostoperatorias: number; // Número mínimo de citas postoperatorias
  medicacionPrescrita: MedicacionPrescrita[];
  observacionesFinales: string;
  recomendaciones?: string;
  fechaObservaciones: Date;
  medicoObservaciones: string; // ID del médico que registra las observaciones
}

export interface MedicacionPrescrita {
  medicamento: string;
  dosis: string;
  frecuencia: string; // Ej: "Cada 8 horas", "Dos veces al día"
  duracionDias: number;
  viaAdministracion: string; // Oral, Tópica, Intramuscular, etc.
  indicaciones?: string;
}

export interface TiemposCirugia {
  inicioReal?: Date;
  finReal?: Date;
  duracionRealMinutos?: number;
  tiempoAnestesia?: number; // minutos
  tiempoRecuperacion?: number; // minutos
}

export interface CirugiaProgramada {
  id?: string;
  
  // Información básica
  idPaciente: string;
  nombrePaciente: string;
  apellidoPaciente: string;
  documentoPaciente: string;
  
  idTipoCirugia: string;
  nombreCirugia: string;
  descripcionCirugia: string;
  
  // Estado y flujo
  estado: EstadoCirugiaProgramada;
  prioridad: PrioridadCirugia;
  
  // Personal médico asignado
  personalAsignado: PersonalAsignado[];
  
  // Checklist dinámico
  checklist: ItemChecklistCirugia[];
  
  // Información de agenda
  agenda?: AgendaCirugia;
  
  // Tiempos reales
  tiempos?: TiemposCirugia;
  
  // Observaciones finales
  observaciones?: ObservacionesCirugia;
  
  // Costos y presupuesto
  costoEstimado: number;
  costoReal?: number;
  moneda: string;
  
  // Historial de cambios
  historialCambios: CambioEstadoCirugia[];
  
  // Metadatos
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string; // ID del usuario que creó la cirugía
  modificadoPor: string; // ID del último usuario que modificó
}

export interface CambioEstadoCirugia {
  estadoAnterior: EstadoCirugiaProgramada;
  estadoNuevo: EstadoCirugiaProgramada;
  fecha: Date;
  usuario: string; // ID del usuario que hizo el cambio
  motivo?: string;
  observaciones?: string;
}

// ============ INTERFACES PARA FILTROS Y BÚSQUEDAS ============

export interface FiltrosCirugia {
  estado?: EstadoCirugiaProgramada[];
  fechaInicio?: Date;
  fechaFin?: Date;
  idMedico?: string;
  idPaciente?: string;
  prioridad?: PrioridadCirugia[];
  quirofano?: string;
  textoBusqueda?: string;
}

export interface DisponibilidadPersonal {
  idPersonal: string;
  nombre: string;
  tipo: 'medico' | 'anestesiologo' | 'enfermera';
  disponible: boolean;
  motivoNoDisponible?: string;
  horariosOcupados: { inicio: Date; fin: Date; motivo: string; }[];
}

export interface DisponibilidadQuirofano {
  quirofano: string;
  disponible: boolean;
  horariosOcupados: { inicio: Date; fin: Date; cirugiaId: string; }[];
}

// ============ TIPOS DE CHECKLIST PREDEFINIDOS ============

export const CHECKLIST_BASICO: Omit<ItemChecklistCirugia, 'id' | 'estado' | 'fechaSubida'>[] = [
  {
    nombre: 'Documento de Identidad',
    descripcion: 'Cédula o documento de identificación vigente',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.DOCUMENTO_IDENTIDAD
  },
  {
    nombre: 'Consentimiento Informado',
    descripcion: 'Consentimiento informado firmado por el paciente',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.CONSENTIMIENTO
  },
  {
    nombre: 'Hemograma Completo',
    descripcion: 'Hemograma completo con máximo 30 días de antigüedad',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.LABORATORIO,
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  },
  {
    nombre: 'Química Sanguínea',
    descripcion: 'Glucosa, creatinina, urea, electrolitos',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.LABORATORIO,
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
];

export const CHECKLIST_CARDIOVASCULAR: Omit<ItemChecklistCirugia, 'id' | 'estado' | 'fechaSubida'>[] = [
  {
    nombre: 'Electrocardiograma',
    descripcion: 'ECG de 12 derivaciones en reposo',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.ELECTROCARDIOGRAMA,
    fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 días
  },
  {
    nombre: 'Evaluación Cardiológica',
    descripcion: 'Interconsulta con cardiología',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.INTERCONSULTA
  }
];

export const CHECKLIST_ANESTESIA_GENERAL: Omit<ItemChecklistCirugia, 'id' | 'estado' | 'fechaSubida'>[] = [
  {
    nombre: 'Radiografía de Tórax',
    descripcion: 'Rx de tórax PA y lateral',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.RADIOGRAFIA,
    fechaVencimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
  },
  {
    nombre: 'Evaluación Anestesiológica',
    descripcion: 'Valoración preanestésica completa',
    esObligatorio: true,
    tipoArchivo: TipoArchivoChecklist.INTERCONSULTA
  }
];

// ============ QUIRÓFANOS DISPONIBLES ============

export const QUIROFANOS_DISPONIBLES = [
  'Quirófano 1 - Principal',
  'Quirófano 2 - Ambulatorio',
  'Quirófano 3 - Urgencias',
  'Quirófano 4 - Especializado'
];

// ============ MEDICAMENTOS COMUNES ============

export const MEDICAMENTOS_COMUNES = [
  'Ibuprofeno 600mg',
  'Acetaminofén 500mg',
  'Amoxicilina 500mg',
  'Cefadroxilo 500mg',
  'Tramadol 50mg',
  'Ketorolaco 10mg',
  'Diclofenaco gel tópico',
  'Prednisona 5mg',
  'Omeprazol 20mg',
  'Loratadina 10mg'
];

export const VIAS_ADMINISTRACION = [
  'Oral',
  'Tópica',
  'Intramuscular',
  'Intravenosa',
  'Subcutánea',
  'Sublingual',
  'Oftálmica',
  'Ótica',
  'Nasal',
  'Rectal'
];

export const FRECUENCIAS_MEDICACION = [
  'Una vez al día',
  'Dos veces al día',
  'Tres veces al día',
  'Cada 4 horas',
  'Cada 6 horas',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  'Según necesidad',
  'Solo por la noche',
  'Solo por la mañana'
];