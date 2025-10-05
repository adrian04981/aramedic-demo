export interface Paciente {
  id?: string;
  // Datos personales básicos
  nombres: string;
  apellidos: string;
  tipoDocumento: 'CC' | 'CE' | 'PP' | 'TI';
  numeroDocumento: string;
  fechaNacimiento: Date;
  edad: number;
  genero: 'M' | 'F' | 'Otro';
  
  // Contacto
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  
  // Contacto de emergencia
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  
  // Datos médicos
  peso: number; // en kg
  altura: number; // en cm
  alergias: string[];
  medicamentosActuales: string[];
  antecedentesMedicos: string[];
  
  // Datos del sistema
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: 'activo' | 'inactivo';
  
  // Fotos para historial
  fotoPerfilUrl?: string;
}

export interface HistorialMedico {
  id?: string;
  pacienteId: string;
  fecha: Date;
  tipo: 'consulta' | 'cirugia' | 'postoperatorio' | 'otro';
  titulo: string;
  descripcion: string;
  medico: string;
  medicamentos?: string[];
  observaciones?: string;
  documentosUrls?: string[];
  fotosAntesUrls?: string[];
  fotosDespuesUrls?: string[];
  
  // Específico para cirugías
  tipoCirugia?: string;
  duracionEstimada?: number; // minutos
  duracionReal?: number; // minutos
  complicaciones?: string;
  
  fechaCreacion: Date;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion: string;
}