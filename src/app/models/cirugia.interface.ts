export interface TipoCirugia {
  id?: string;
  
  // Información básica
  nombre: string;
  descripcion: string;
  categoria: CategoriaCirugia;
  
  // Detalles del procedimiento
  duracionEstimada: number; // en minutos
  costoBase: number;
  nivelComplejidad: NivelComplejidad;
  
  // Requisitos y preparación
  checklistRequisitos: RequisitoMinimo[];
  preparacionPreoperatoria: string[];
  cuidadosPostoperatorios: string[];
  
  // Información técnica
  anestesia: TipoAnestesia;
  hospitalizacion: boolean;
  tiempoRecuperacion: number; // en días
  
  // Control de sistema
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  creadoPor: string;
}

export interface RequisitoMinimo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoRequisito;
  obligatorio: boolean;
  validezDias?: number; // para exámenes, cuántos días son válidos
  observaciones?: string;
}

export interface ChecklistCirugia {
  id?: string;
  
  // Relación con cita y paciente
  citaId: string;
  pacienteId: string;
  tipoCirugiaId: string;
  
  // Estado del checklist
  estado: EstadoChecklist;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Requisitos completados
  requisitosCompletados: RequisitoCompletado[];
  observaciones?: string;
  aprobadoPor?: string;
  fechaAprobacion?: Date;
}

export interface RequisitoCompletado {
  requisitoId: string;
  completado: boolean;
  fechaCompletado?: Date;
  resultado?: string;
  archivoUrl?: string;
  observaciones?: string;
  validadoPor?: string;
}

export enum CategoriaCirugia {
  FACIAL = 'facial',
  CORPORAL = 'corporal',
  MAMARIA = 'mamaria',
  INTIMA = 'intima',
  RECONSTRUCTIVA = 'reconstructiva'
}

export enum NivelComplejidad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  MUY_ALTA = 'muy-alta'
}

export enum TipoAnestesia {
  LOCAL = 'local',
  SEDACION = 'sedacion',
  REGIONAL = 'regional',
  GENERAL = 'general'
}

export enum TipoRequisito {
  EXAMEN_LABORATORIO = 'examen-laboratorio',
  EXAMEN_IMAGEN = 'examen-imagen',
  VALORACION_MEDICA = 'valoracion-medica',
  DOCUMENTO = 'documento',
  AUTORIZACION = 'autorizacion',
  OTRO = 'otro'
}

export enum EstadoChecklist {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en-proceso',
  COMPLETO = 'completo',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

// Tipos predefinidos de cirugías estéticas comunes
export const TIPOS_CIRUGIAS_PREDEFINIDOS = [
  {
    nombre: 'Liposucción',
    descripcion: 'Extracción de grasa localizada mediante técnicas de succión',
    categoria: CategoriaCirugia.CORPORAL,
    duracionEstimada: 120,
    costoBase: 3500000,
    nivelComplejidad: NivelComplejidad.MEDIA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: false,
    tiempoRecuperacion: 14
  },
  {
    nombre: 'Rinoplastia',
    descripcion: 'Cirugía estética y/o funcional de la nariz',
    categoria: CategoriaCirugia.FACIAL,
    duracionEstimada: 180,
    costoBase: 4500000,
    nivelComplejidad: NivelComplejidad.ALTA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: false,
    tiempoRecuperacion: 21
  },
  {
    nombre: 'Mamoplastia de Aumento',
    descripcion: 'Aumento del volumen mamario con implantes',
    categoria: CategoriaCirugia.MAMARIA,
    duracionEstimada: 90,
    costoBase: 5000000,
    nivelComplejidad: NivelComplejidad.MEDIA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: false,
    tiempoRecuperacion: 30
  },
  {
    nombre: 'Blefaroplastia',
    descripcion: 'Cirugía de párpados superiores e inferiores',
    categoria: CategoriaCirugia.FACIAL,
    duracionEstimada: 120,
    costoBase: 2800000,
    nivelComplejidad: NivelComplejidad.MEDIA,
    anestesia: TipoAnestesia.LOCAL,
    hospitalizacion: false,
    tiempoRecuperacion: 10
  },
  {
    nombre: 'Abdominoplastia',
    descripcion: 'Cirugía de abdomen con eliminación de exceso de piel y grasa',
    categoria: CategoriaCirugia.CORPORAL,
    duracionEstimada: 240,
    costoBase: 6000000,
    nivelComplejidad: NivelComplejidad.ALTA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: true,
    tiempoRecuperacion: 45
  },
  {
    nombre: 'Lifting Facial',
    descripcion: 'Estiramiento facial para rejuvenecimiento',
    categoria: CategoriaCirugia.FACIAL,
    duracionEstimada: 300,
    costoBase: 8000000,
    nivelComplejidad: NivelComplejidad.MUY_ALTA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: true,
    tiempoRecuperacion: 60
  },
  {
    nombre: 'Mamoplastia de Reducción',
    descripcion: 'Reducción del volumen mamario',
    categoria: CategoriaCirugia.MAMARIA,
    duracionEstimada: 180,
    costoBase: 4800000,
    nivelComplejidad: NivelComplejidad.ALTA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: false,
    tiempoRecuperacion: 35
  },
  {
    nombre: 'Otoplastia',
    descripcion: 'Cirugía correctiva de orejas prominentes',
    categoria: CategoriaCirugia.FACIAL,
    duracionEstimada: 90,
    costoBase: 2200000,
    nivelComplejidad: NivelComplejidad.BAJA,
    anestesia: TipoAnestesia.LOCAL,
    hospitalizacion: false,
    tiempoRecuperacion: 7
  },
  {
    nombre: 'Gluteoplastia',
    descripcion: 'Aumento y remodelación de glúteos',
    categoria: CategoriaCirugia.CORPORAL,
    duracionEstimada: 180,
    costoBase: 7000000,
    nivelComplejidad: NivelComplejidad.ALTA,
    anestesia: TipoAnestesia.GENERAL,
    hospitalizacion: false,
    tiempoRecuperacion: 30
  },
  {
    nombre: 'Mentoplastia',
    descripcion: 'Cirugía de mentón para mejorar el perfil facial',
    categoria: CategoriaCirugia.FACIAL,
    duracionEstimada: 60,
    costoBase: 2500000,
    nivelComplejidad: NivelComplejidad.BAJA,
    anestesia: TipoAnestesia.LOCAL,
    hospitalizacion: false,
    tiempoRecuperacion: 14
  }
];

// Requisitos mínimos comunes para cirugías estéticas
export const REQUISITOS_MINIMOS_COMUNES = [
  {
    id: 'hemograma-completo',
    nombre: 'Hemograma Completo',
    descripcion: 'Examen de sangre completo con recuento de células',
    tipo: TipoRequisito.EXAMEN_LABORATORIO,
    obligatorio: true,
    validezDias: 30
  },
  {
    id: 'tiempos-coagulacion',
    nombre: 'Tiempos de Coagulación (PT/PTT)',
    descripcion: 'Evaluación de la coagulación sanguínea',
    tipo: TipoRequisito.EXAMEN_LABORATORIO,
    obligatorio: true,
    validezDias: 30
  },
  {
    id: 'quimica-sanguinea',
    nombre: 'Química Sanguínea',
    descripcion: 'Glucosa, creatinina, BUN, electrolitos',
    tipo: TipoRequisito.EXAMEN_LABORATORIO,
    obligatorio: true,
    validezDias: 30
  },
  {
    id: 'electrocardiograma',
    nombre: 'Electrocardiograma',
    descripcion: 'ECG de 12 derivaciones',
    tipo: TipoRequisito.EXAMEN_IMAGEN,
    obligatorio: true,
    validezDias: 60
  },
  {
    id: 'radiografia-torax',
    nombre: 'Radiografía de Tórax',
    descripcion: 'Rx de tórax PA y lateral',
    tipo: TipoRequisito.EXAMEN_IMAGEN,
    obligatorio: true,
    validezDias: 90
  },
  {
    id: 'valoracion-anestesia',
    nombre: 'Valoración Preanestésica',
    descripcion: 'Evaluación por anestesiólogo',
    tipo: TipoRequisito.VALORACION_MEDICA,
    obligatorio: true,
    validezDias: 30
  },
  {
    id: 'consentimiento-informado',
    nombre: 'Consentimiento Informado',
    descripcion: 'Documento firmado de consentimiento',
    tipo: TipoRequisito.DOCUMENTO,
    obligatorio: true
  },
  {
    id: 'autorizacion-cirugia',
    nombre: 'Autorización de Cirugía',
    descripcion: 'Autorización firmada para el procedimiento',
    tipo: TipoRequisito.AUTORIZACION,
    obligatorio: true
  }
];