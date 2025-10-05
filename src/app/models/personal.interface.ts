export interface Personal {
  id?: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  email: string;
  tipoPersonal: TipoPersonal;
  estado: EstadoPersonal;
  fechaNacimiento: Date;
  direccion: string;
  experienciaAnios: number;
  certificaciones: string[];
  turnoPreferido: TurnoTrabajo;
  salarioBase: number;
  fechaIngreso: Date;
  observaciones?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export enum TipoPersonal {
  ENFERMERA = 'enfermera',
  ANESTESIOLOGO = 'anestesiologo'
}

export enum TipoDocumento {
  CEDULA = 'cedula',
  PASAPORTE = 'pasaporte',
  CEDULA_EXTRANJERIA = 'cedula_extranjeria'
}

export enum EstadoPersonal {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
  VACACIONES = 'vacaciones',
  LICENCIA = 'licencia'
}

export enum TurnoTrabajo {
  MANANA = 'manana',
  TARDE = 'tarde',
  NOCHE = 'noche',
  ROTATIVO = 'rotativo',
  DISPONIBILIDAD_COMPLETA = 'disponibilidad_completa'
}

// Datos predefinidos para enfermeras
export const ENFERMERAS_PREDEFINIDAS = [
  {
    nombres: 'María Elena',
    apellidos: 'García Rodríguez',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '1234567890',
    telefono: '+57 300 123 4567',
    email: 'maria.garcia@aramedic.com',
    tipoPersonal: TipoPersonal.ENFERMERA,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1985-03-15'),
    direccion: 'Calle 123 #45-67, Bogotá',
    experienciaAnios: 8,
    certificaciones: ['Enfermería Quirúrgica', 'Cuidados Intensivos', 'RCP Avanzado'],
    turnoPreferido: TurnoTrabajo.MANANA,
    salarioBase: 2500000,
    fechaIngreso: new Date('2020-01-15'),
    observaciones: 'Especialista en cirugías estéticas, excelente desempeño'
  },
  {
    nombres: 'Carmen Lucía',
    apellidos: 'Martínez López',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '2345678901',
    telefono: '+57 301 234 5678',
    email: 'carmen.martinez@aramedic.com',
    tipoPersonal: TipoPersonal.ENFERMERA,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1990-07-22'),
    direccion: 'Carrera 45 #12-34, Medellín',
    experienciaAnios: 5,
    certificaciones: ['Enfermería General', 'Administración de Medicamentos', 'Primeros Auxilios'],
    turnoPreferido: TurnoTrabajo.TARDE,
    salarioBase: 2200000,
    fechaIngreso: new Date('2021-06-01'),
    observaciones: 'Muy responsable y dedicada con los pacientes'
  },
  {
    nombres: 'Patricia',
    apellidos: 'Hernández Silva',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '3456789012',
    telefono: '+57 302 345 6789',
    email: 'patricia.hernandez@aramedic.com',
    tipoPersonal: TipoPersonal.ENFERMERA,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1987-11-08'),
    direccion: 'Avenida 80 #25-45, Cali',
    experienciaAnios: 7,
    certificaciones: ['Enfermería Quirúrgica', 'Esterilización', 'Manejo de Instrumentos'],
    turnoPreferido: TurnoTrabajo.ROTATIVO,
    salarioBase: 2400000,
    fechaIngreso: new Date('2019-09-12'),
    observaciones: 'Experta en preparación de quirófanos'
  }
];

// Datos predefinidos para anestesiólogos
export const ANESTESIOLOGOS_PREDEFINIDOS = [
  {
    nombres: 'Dr. Carlos Alberto',
    apellidos: 'Vásquez Montenegro',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '4567890123',
    telefono: '+57 303 456 7890',
    email: 'carlos.vasquez@aramedic.com',
    tipoPersonal: TipoPersonal.ANESTESIOLOGO,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1975-05-14'),
    direccion: 'Calle 85 #15-23, Bogotá',
    experienciaAnios: 15,
    certificaciones: ['Anestesiología General', 'Anestesia Regional', 'Cuidados Intensivos', 'Dolor'],
    turnoPreferido: TurnoTrabajo.DISPONIBILIDAD_COMPLETA,
    salarioBase: 8500000,
    fechaIngreso: new Date('2018-03-01'),
    observaciones: 'Especialista en anestesia para cirugías estéticas complejas'
  },
  {
    nombres: 'Dra. Andrea',
    apellidos: 'Morales Gutiérrez',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '5678901234',
    telefono: '+57 304 567 8901',
    email: 'andrea.morales@aramedic.com',
    tipoPersonal: TipoPersonal.ANESTESIOLOGO,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1982-09-28'),
    direccion: 'Carrera 70 #45-12, Medellín',
    experienciaAnios: 10,
    certificaciones: ['Anestesiología', 'Sedación Consciente', 'Anestesia Pediátrica', 'RCP Avanzado'],
    turnoPreferido: TurnoTrabajo.MANANA,
    salarioBase: 7800000,
    fechaIngreso: new Date('2020-08-15'),
    observaciones: 'Excelente en procedimientos ambulatorios y sedación'
  },
  {
    nombres: 'Dr. Fernando',
    apellidos: 'Ramírez Castillo',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '6789012345',
    telefono: '+57 305 678 9012',
    email: 'fernando.ramirez@aramedic.com',
    tipoPersonal: TipoPersonal.ANESTESIOLOGO,
    estado: EstadoPersonal.ACTIVO,
    fechaNacimiento: new Date('1978-12-03'),
    direccion: 'Calle 100 #50-25, Barranquilla',
    experienciaAnios: 12,
    certificaciones: ['Anestesiología', 'Anestesia Cardiovascular', 'Manejo del Dolor', 'Medicina Crítica'],
    turnoPreferido: TurnoTrabajo.TARDE,
    salarioBase: 8200000,
    fechaIngreso: new Date('2019-01-20'),
    observaciones: 'Amplia experiencia en cirugías reconstructivas'
  }
];

// Certificaciones comunes por tipo de personal
export const CERTIFICACIONES_ENFERMERAS = [
  'Enfermería General',
  'Enfermería Quirúrgica',
  'Cuidados Intensivos',
  'RCP Básico',
  'RCP Avanzado',
  'Administración de Medicamentos',
  'Primeros Auxilios',
  'Esterilización',
  'Manejo de Instrumentos Quirúrgicos',
  'Cuidados Postoperatorios',
  'Enfermería Estética',
  'Control de Infecciones'
];

export const CERTIFICACIONES_ANESTESIOLOGOS = [
  'Anestesiología General',
  'Anestesia Regional',
  'Anestesia Local',
  'Sedación Consciente',
  'Anestesia Pediátrica',
  'Anestesia Cardiovascular',
  'Anestesia Neurológica',
  'Cuidados Intensivos',
  'Manejo del Dolor',
  'Medicina Crítica',
  'RCP Avanzado',
  'Intubación Difícil',
  'Ultrasonido en Anestesia',
  'Anestesia Ambulatoria'
];