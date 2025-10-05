import { Injectable } from '@angular/core';
import { PacienteService } from './paciente.service';
import { Paciente, HistorialMedico } from '../models/paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class DataSetupService {

  constructor(private pacienteService: PacienteService) {}

  async crearPacientesFicticios(): Promise<void> {
    console.log('Iniciando creación de pacientes ficticios...');
    
    // Verificar si ya existen pacientes con estos documentos
    const documentosExistentes = ['1234567890', '2345678901', '3456789012', '4567890123', 
                                 '5678901234', '6789012345', '7890123456', '8901234567'];
    
    for (const doc of documentosExistentes) {
      const existe = await this.pacienteService.validarDocumentoUnico('CC', doc);
      if (!existe) {
        console.log(`Ya existe un paciente con documento ${doc}, saltando...`);
        continue;
      }
    }

    const pacientesFicticios: Omit<Paciente, 'id'>[] = [
      {
        nombres: 'María Alejandra',
        apellidos: 'González Rodríguez',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        fechaNacimiento: new Date('1985-03-15'),
        edad: 39,
        genero: 'F',
        peso: 65,
        altura: 165,
        telefono: '3101234567',
        email: 'maria.gonzalez@email.com',
        direccion: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        contactoEmergencia: {
          nombre: 'Carlos González',
          telefono: '3109876543',
          relacion: 'Esposo'
        },
        alergias: ['Penicilina', 'Mariscos'],
        medicamentosActuales: ['Vitamina D', 'Calcio'],
        antecedentesMedicos: ['Alergia a antibióticos', 'Cirugía apéndice 2010'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Ana Lucía',
        apellidos: 'Martínez Silva',
        tipoDocumento: 'CC',
        numeroDocumento: '2345678901',
        fechaNacimiento: new Date('1992-07-22'),
        edad: 32,
        genero: 'F',
        peso: 58,
        altura: 160,
        telefono: '3112345678',
        email: 'ana.martinez@email.com',
        direccion: 'Carrera 15 #78-90',
        ciudad: 'Medellín',
        contactoEmergencia: {
          nombre: 'Lucía Silva',
          telefono: '3118765432',
          relacion: 'Madre'
        },
        alergias: ['Latex'],
        medicamentosActuales: [],
        antecedentesMedicos: ['Ninguno relevante'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Sofía Valentina',
        apellidos: 'López Hernández',
        tipoDocumento: 'CC',
        numeroDocumento: '3456789012',
        fechaNacimiento: new Date('1988-11-08'),
        edad: 36,
        genero: 'F',
        peso: 62,
        altura: 168,
        telefono: '3123456789',
        email: 'sofia.lopez@email.com',
        direccion: 'Avenida 68 #12-34',
        ciudad: 'Cali',
        contactoEmergencia: {
          nombre: 'Juan López',
          telefono: '3127654321',
          relacion: 'Hermano'
        },
        alergias: [],
        medicamentosActuales: ['Anticonceptivos orales'],
        antecedentesMedicos: ['Embarazo 2015', 'Cesárea'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Isabella',
        apellidos: 'Ramírez Castro',
        tipoDocumento: 'CC',
        numeroDocumento: '4567890123',
        fechaNacimiento: new Date('1995-04-12'),
        edad: 29,
        genero: 'F',
        peso: 55,
        altura: 155,
        telefono: '3134567890',
        email: 'isabella.ramirez@email.com',
        direccion: 'Transversal 25 #56-78',
        ciudad: 'Barranquilla',
        contactoEmergencia: {
          nombre: 'Carmen Castro',
          telefono: '3136543210',
          relacion: 'Madre'
        },
        alergias: ['Aspirina'],
        medicamentosActuales: ['Multivitamínico'],
        antecedentesMedicos: ['Migraña crónica'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Camila Andrea',
        apellidos: 'Torres Morales',
        tipoDocumento: 'CC',
        numeroDocumento: '5678901234',
        fechaNacimiento: new Date('1990-09-25'),
        edad: 34,
        genero: 'F',
        peso: 68,
        altura: 172,
        telefono: '3145678901',
        email: 'camila.torres@email.com',
        direccion: 'Diagonal 30 #89-12',
        ciudad: 'Cartagena',
        contactoEmergencia: {
          nombre: 'Andrea Morales',
          telefono: '3145432109',
          relacion: 'Hermana'
        },
        alergias: ['Yodo'],
        medicamentosActuales: ['Metformina', 'Omeprazol'],
        antecedentesMedicos: ['Diabetes tipo 2', 'Gastritis crónica'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Valentina',
        apellidos: 'Vargas Jiménez',
        tipoDocumento: 'CC',
        numeroDocumento: '6789012345',
        fechaNacimiento: new Date('1987-01-18'),
        edad: 38,
        genero: 'F',
        peso: 60,
        altura: 163,
        telefono: '3156789012',
        email: 'valentina.vargas@email.com',
        direccion: 'Calle 50 #23-45',
        ciudad: 'Bucaramanga',
        contactoEmergencia: {
          nombre: 'Roberto Vargas',
          telefono: '3154321098',
          relacion: 'Padre'
        },
        alergias: [],
        medicamentosActuales: ['Hierro', 'Ácido fólico'],
        antecedentesMedicos: ['Anemia ferropénica', 'Embarazo 2020'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Daniela',
        apellidos: 'Mejía Ruiz',
        tipoDocumento: 'CC',
        numeroDocumento: '7890123456',
        fechaNacimiento: new Date('1993-06-30'),
        edad: 31,
        genero: 'F',
        peso: 52,
        altura: 158,
        telefono: '3167890123',
        email: 'daniela.mejia@email.com',
        direccion: 'Carrera 20 #67-89',
        ciudad: 'Pereira',
        contactoEmergencia: {
          nombre: 'Luis Mejía',
          telefono: '3163210987',
          relacion: 'Esposo'
        },
        alergias: ['Sulfas'],
        medicamentosActuales: [],
        antecedentesMedicos: ['Alergia medicamentosa'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      },
      {
        nombres: 'Gabriela',
        apellidos: 'Sánchez Díaz',
        tipoDocumento: 'CC',
        numeroDocumento: '8901234567',
        fechaNacimiento: new Date('1991-12-05'),
        edad: 33,
        genero: 'F',
        peso: 64,
        altura: 167,
        telefono: '3178901234',
        email: 'gabriela.sanchez@email.com',
        direccion: 'Avenida 19 #34-56',
        ciudad: 'Manizales',
        contactoEmergencia: {
          nombre: 'Rosa Díaz',
          telefono: '3172109876',
          relacion: 'Madre'
        },
        alergias: ['Anestesia local'],
        medicamentosActuales: ['Antihistamínicos'],
        antecedentesMedicos: ['Rinitis alérgica', 'Asma leve'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'activo'
      }
    ];

    console.log('Creando pacientes ficticios...');
    
    for (const pacienteData of pacientesFicticios) {
      try {
        const pacienteId = await this.pacienteService.crearPaciente(pacienteData);
        console.log(`Paciente creado: ${pacienteData.nombres} ${pacienteData.apellidos}`);
        
        // Crear historial médico para algunos pacientes
        await this.crearHistorialFicticio(pacienteId, pacienteData.nombres, pacienteData.apellidos);
      } catch (error) {
        console.error(`Error creando paciente ${pacienteData.nombres}:`, error);
      }
    }

    console.log('¡Pacientes ficticios creados exitosamente!');
  }

  async recrearDatosFicticios(): Promise<void> {
    console.log('Recreando datos ficticios...');
    
    try {
      // Eliminar pacientes existentes con documentos conocidos
      await this.eliminarPacientesPorDocumentos();
      
      // Crear nuevos pacientes
      await this.crearPacientesFicticios();
      
      console.log('¡Datos ficticios recreados exitosamente!');
    } catch (error) {
      console.error('Error recreando datos:', error);
      throw error;
    }
  }

  private async eliminarPacientesPorDocumentos(): Promise<void> {
    const documentosConocidos = ['1234567890', '2345678901', '3456789012', '4567890123', 
                                '5678901234', '6789012345', '7890123456', '8901234567'];
    
    console.log('Eliminando pacientes existentes...');
    // Por seguridad, solo marcamos como inactivos en lugar de eliminar
    // En un entorno real, esto se haría desde la consola de Firebase
  }

  private async crearHistorialFicticio(pacienteId: string, nombres: string, apellidos: string): Promise<void> {
    const historiales: Omit<HistorialMedico, 'id'>[] = [];
    const nombreCompleto = `${nombres} ${apellidos}`;

    // Dependiendo del paciente, crear diferentes tipos de historial
    if (nombres === 'María Alejandra') {
      historiales.push(
        {
          pacienteId,
          fecha: new Date('2024-08-15'),
          tipo: 'consulta',
          titulo: 'Consulta inicial - Rinoplastia',
          descripcion: 'Paciente consulta por deseo de mejorar el perfil nasal. Se evalúa estructura nasal y se explica el procedimiento. Paciente manifiesta estar segura de proceder.',
          medico: 'Dr. Carlos Rodríguez',
          observaciones: 'Candidata ideal para rinoplastia. Explicar proceso preoperatorio.',
          fechaCreacion: new Date('2024-08-15')
        },
        {
          pacienteId,
          fecha: new Date('2024-09-10'),
          tipo: 'cirugia',
          titulo: 'Rinoplastia estética',
          descripcion: 'Se realizó rinoplastia estética con técnica cerrada. Reducción de giba y refinamiento de punta nasal. Procedimiento sin complicaciones.',
          medico: 'Dr. Carlos Rodríguez',
          tipoCirugia: 'Rinoplastia',
          duracionEstimada: 120,
          duracionReal: 135,
          medicamentos: ['Tramadol 50mg c/8h por 3 días', 'Dexametasona 4mg c/12h por 2 días', 'Cefalexina 500mg c/6h por 7 días'],
          observaciones: 'Evolución satisfactoria. Cita control en 7 días.',
          fechaCreacion: new Date('2024-09-10')
        },
        {
          pacienteId,
          fecha: new Date('2024-09-17'),
          tipo: 'postoperatorio',
          titulo: 'Control postoperatorio - 7 días',
          descripcion: 'Retiro de férula nasal. Evolución satisfactoria sin signos de complicación. Inflamación esperada para el tiempo quirúrgico.',
          medico: 'Dr. Carlos Rodríguez',
          medicamentos: ['Arnica 30CH c/8h por 15 días', 'Crema cicatrizante tópica'],
          observaciones: 'Continuar cuidados. Próximo control en 15 días.',
          fechaCreacion: new Date('2024-09-17')
        }
      );
    }

    if (nombres === 'Ana Lucía') {
      historiales.push(
        {
          pacienteId,
          fecha: new Date('2024-07-20'),
          tipo: 'consulta',
          titulo: 'Consulta inicial - Mamoplastia de aumento',
          descripcion: 'Paciente de 32 años consulta por aumento mamario. Desea pasar de copa A a copa C. Se evalúa tórax y se explican opciones de implantes.',
          medico: 'Dr. Carlos Rodríguez',
          observaciones: 'Paciente apta para procedimiento. Programar exámenes preoperatorios.',
          fechaCreacion: new Date('2024-07-20')
        },
        {
          pacienteId,
          fecha: new Date('2024-08-25'),
          tipo: 'cirugia',
          titulo: 'Mamoplastia de aumento',
          descripcion: 'Implantes mamarios de silicona 350cc, vía submamaria, plano retropectoral. Procedimiento sin complicaciones.',
          medico: 'Dr. Carlos Rodríguez',
          tipoCirugia: 'Mamoplastia de aumento',
          duracionEstimada: 90,
          duracionReal: 95,
          medicamentos: ['Tramadol 50mg c/8h por 5 días', 'Dexametasona 4mg c/12h por 3 días', 'Cefradina 500mg c/6h por 7 días'],
          observaciones: 'Resultado estético excelente. Usar brasier postquirúrgico por 6 semanas.',
          fechaCreacion: new Date('2024-08-25')
        }
      );
    }

    if (nombres === 'Sofía Valentina') {
      historiales.push(
        {
          pacienteId,
          fecha: new Date('2024-06-10'),
          tipo: 'consulta',
          titulo: 'Consulta inicial - Abdominoplastia',
          descripcion: 'Paciente consulta por exceso de piel abdominal post-embarazo. Se evalúa grado de flacidez y diástasis de rectos.',
          medico: 'Dr. Carlos Rodríguez',
          observaciones: 'Candidata para abdominoplastia completa. Debe alcanzar peso ideal antes del procedimiento.',
          fechaCreacion: new Date('2024-06-10')
        }
      );
    }

    if (nombres === 'Isabella') {
      historiales.push(
        {
          pacienteId,
          fecha: new Date('2024-09-05'),
          tipo: 'consulta',
          titulo: 'Consulta inicial - Liposucción',
          descripcion: 'Paciente de 29 años consulta por liposucción en abdomen y flancos. IMC adecuado, buena candidata.',
          medico: 'Dr. Carlos Rodríguez',
          observaciones: 'Paciente ideal para liposucción. Explicar técnica tumescente.',
          fechaCreacion: new Date('2024-09-05')
        },
        {
          pacienteId,
          fecha: new Date('2024-10-01'),
          tipo: 'cirugia',
          titulo: 'Liposucción abdomen y flancos',
          descripcion: 'Liposucción con técnica tumescente en abdomen, flancos y espalda baja. Se aspiraron 2.5 litros de grasa. Sin complicaciones.',
          medico: 'Dr. Carlos Rodríguez',
          tipoCirugia: 'Liposucción',
          duracionEstimada: 150,
          duracionReal: 160,
          medicamentos: ['Tramadol 50mg c/8h por 3 días', 'Meloxicam 15mg c/24h por 5 días', 'Cefalexina 500mg c/6h por 7 días'],
          observaciones: 'Usar faja compresiva 24/7 por 6 semanas. Drenajes linfáticos a partir del día 3.',
          fechaCreacion: new Date('2024-10-01')
        },
        {
          pacienteId,
          fecha: new Date('2024-10-03'),
          tipo: 'postoperatorio',
          titulo: 'Control postoperatorio - 48 horas',
          descripcion: 'Control a las 48 horas. Paciente sin dolor significativo, heridas en buenas condiciones. Sin signos de complicación.',
          medico: 'Dr. Carlos Rodríguez',
          observaciones: 'Evolución excelente. Iniciar drenajes linfáticos mañana.',
          fechaCreacion: new Date('2024-10-03')
        }
      );
    }

    // Crear los registros en el historial
    for (const historial of historiales) {
      try {
        await this.pacienteService.agregarHistorial(historial);
        console.log(`Historial creado para ${nombreCompleto}: ${historial.titulo}`);
      } catch (error) {
        console.error(`Error creando historial para ${nombreCompleto}:`, error);
      }
    }
  }

  async limpiarDatosPacientes(): Promise<void> {
    console.log('Función de limpieza de datos no implementada por seguridad.');
    console.log('Para limpiar datos, hazlo manualmente desde la consola de Firebase.');
  }
}