import { Injectable } from '@angular/core';
import { CitaService } from './cita.service';
import { PacienteService } from './paciente.service';
import { AuthService } from './auth.service';
import { Cita, EstadoCita, TipoCita } from '../models/cita.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaSetupService {

  constructor(
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private authService: AuthService
  ) {}

  async crearCitasDePrueba(): Promise<void> {
    try {
      console.log('Iniciando creación de citas de prueba...');

      // Obtener pacientes y médicos existentes
      const pacientes = await this.pacienteService.obtenerPacientes().toPromise();
      const usuarios = await this.authService.getAllUsers();
      const medicos = usuarios.filter(u => u.role === 'medico' || u.role === 'administrador_medico');

      if (!pacientes || pacientes.length === 0) {
        console.warn('No hay pacientes disponibles para crear citas');
        return;
      }

      if (medicos.length === 0) {
        console.warn('No hay médicos disponibles para crear citas');
        return;
      }

      const citasDePrueba: Omit<Cita, 'id'>[] = [
        // Citas para hoy
        {
          fecha: new Date(),
          horaInicio: '09:00',
          horaFin: '09:45',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[0].id!,
          pacienteNombre: `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.CONSULTA_INICIAL,
          motivo: 'Consulta inicial para rinoplastia',
          descripcion: 'Primera consulta para evaluar posibilidad de rinoplastia',
          procedimiento: 'Rinoplastia',
          duracionEstimada: 45,
          costo: 150000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: true,
          notificacionesActivas: true
        },
        {
          fecha: new Date(),
          horaInicio: '10:30',
          horaFin: '11:00',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[1]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[1] ? `${pacientes[1].nombres} ${pacientes[1].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.POST_OPERATORIO,
          motivo: 'Control post-operatorio',
          descripcion: 'Revisión a los 15 días de la cirugía',
          procedimiento: 'Control post-operatorio',
          duracionEstimada: 30,
          costo: 80000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: false,
          notificacionesActivas: true
        },
        {
          fecha: new Date(),
          horaInicio: '14:00',
          horaFin: '15:30',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[2]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[2] ? `${pacientes[2].nombres} ${pacientes[2].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.CIRUGIA,
          motivo: 'Aplicación de botox',
          descripcion: 'Aplicación de toxina botulínica en frente y entrecejo',
          procedimiento: 'Aplicación de Botox',
          duracionEstimada: 90,
          costo: 450000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: true,
          notificacionesActivas: true
        },

        // Citas para mañana
        {
          fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
          horaInicio: '08:30',
          horaFin: '09:15',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[3]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[3] ? `${pacientes[3].nombres} ${pacientes[3].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.CONSULTA_INICIAL,
          motivo: 'Valoración para aumento de senos',
          descripcion: 'Evaluación para mamoplastia de aumento',
          procedimiento: 'Mamoplastia de aumento',
          duracionEstimada: 45,
          costo: 200000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: false,
          notificacionesActivas: true
        },
        {
          fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
          horaInicio: '11:00',
          horaFin: '14:00',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[4]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[4] ? `${pacientes[4].nombres} ${pacientes[4].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.CIRUGIA,
          motivo: 'Blefaroplastia superior',
          descripcion: 'Cirugía de párpados superiores',
          procedimiento: 'Blefaroplastia',
          duracionEstimada: 180,
          costo: 2500000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: true,
          notificacionesActivas: true
        },

        // Citas para la próxima semana
        {
          fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          horaInicio: '09:00',
          horaFin: '09:30',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[5]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[5] ? `${pacientes[5].nombres} ${pacientes[5].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.POST_OPERATORIO,
          motivo: 'Control de cicatrización',
          descripcion: 'Revisión de cicatriz post-quirúrgica',
          procedimiento: 'Control post-operatorio',
          duracionEstimada: 30,
          costo: 60000,
          
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: false,
          notificacionesActivas: true
        },

        // Teleconsulta
        {
          fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          horaInicio: '16:00',
          horaFin: '16:30',
          estado: EstadoCita.CONFIRMADA,
          pacienteId: pacientes[6]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[6] ? `${pacientes[6].nombres} ${pacientes[6].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.POST_OPERATORIO,
          motivo: 'Seguimiento virtual',
          descripcion: 'Consulta de seguimiento virtual',
          procedimiento: 'Teleconsulta',
          duracionEstimada: 30,
          costo: 50000,
          
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: false,
          notificacionesActivas: true
        },

        // Cita cancelada (ejemplo)
        {
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
          horaInicio: '15:00',
          horaFin: '15:45',
          estado: EstadoCita.CANCELADA,
          pacienteId: pacientes[7]?.id || pacientes[0].id!,
          pacienteNombre: pacientes[7] ? `${pacientes[7].nombres} ${pacientes[7].apellidos}` : `${pacientes[0].nombres} ${pacientes[0].apellidos}`,
          medicoId: medicos[0].uid,
          medicoNombre: `${medicos[0].firstName} ${medicos[0].lastName}`,
          tipo: TipoCita.CONSULTA_INICIAL,
          motivo: 'Consulta para liposucción',
          descripcion: 'Evaluación para procedimiento de liposucción',
          procedimiento: 'Liposucción',
          duracionEstimada: 45,
          costo: 180000,
          
          
          fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          fechaActualizacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
          creadoPor: medicos[0].uid,
          recordatorioEnviado: true,
          notificacionesActivas: false
        }
      ];

      // Crear las citas una por una
      for (const cita of citasDePrueba) {
        try {
          await this.citaService.crearCita(cita as Cita);
          console.log(`Cita creada: ${cita.pacienteNombre} - ${cita.motivo}`);
        } catch (error) {
          console.error(`Error creando cita para ${cita.pacienteNombre}:`, error);
        }
      }

      console.log('Citas de prueba creadas exitosamente');
    } catch (error) {
      console.error('Error creando citas de prueba:', error);
      throw error;
    }
  }

  async limpiarCitas(): Promise<void> {
    try {
      console.log('Limpiando citas existentes...');
      await this.citaService.limpiarTodasLasCitas();
      console.log('✅ Todas las citas han sido eliminadas');
    } catch (error) {
      console.error('❌ Error limpiando citas:', error);
      throw error;
    }
  }
}
