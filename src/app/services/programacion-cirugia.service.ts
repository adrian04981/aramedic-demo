import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch 
} from '@angular/fire/firestore';
import { Observable, from, map, combineLatest } from 'rxjs';
import { 
  CirugiaProgramada,
  EstadoCirugiaProgramada,
  ItemChecklistCirugia,
  EstadoItemChecklist,
  PersonalAsignado,
  AgendaCirugia,
  ObservacionesCirugia,
  CambioEstadoCirugia,
  FiltrosCirugia,
  DisponibilidadPersonal,
  DisponibilidadQuirofano,
  PrioridadCirugia,
  TipoComplicacion,
  CHECKLIST_BASICO,
  CHECKLIST_CARDIOVASCULAR,
  CHECKLIST_ANESTESIA_GENERAL,
  QUIROFANOS_DISPONIBLES
} from '../models/programacion-cirugia.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgramacionCirugiaService {
  private cirugiasProgramadasCollection = 'cirugias_programadas';

  constructor(private firestore: Firestore) {}

  // Método utilitario para limpiar objetos de valores undefined
  private cleanUndefinedValues(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          cleaned[key] = this.cleanUndefinedValues(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  // ============ CRUD BÁSICO ============

  async crearCirugiaProgramada(cirugia: Omit<CirugiaProgramada, 'id'>): Promise<string> {
    const cirugiaData = {
      ...cirugia,
      fechaCreacion: Timestamp.fromDate(new Date()),
      fechaActualizacion: Timestamp.fromDate(new Date()),
      historialCambios: cirugia.historialCambios.map(cambio => ({
        ...cambio,
        fecha: Timestamp.fromDate(cambio.fecha)
      }))
    };

    const docRef = await addDoc(collection(this.firestore, this.cirugiasProgramadasCollection), cirugiaData);
    return docRef.id;
  }

  async actualizarCirugiaProgramada(id: string, updates: Partial<CirugiaProgramada>): Promise<void> {
    const docRef = doc(this.firestore, this.cirugiasProgramadasCollection, id);
    
    // Limpiar valores undefined
    const cleanedUpdates = this.cleanUndefinedValues(updates);
    
    const updateData = {
      ...cleanedUpdates,
      fechaActualizacion: Timestamp.fromDate(new Date())
    };

    if (updates.historialCambios) {
      updateData.historialCambios = updates.historialCambios.map(cambio => {
        const cleanedCambio = this.cleanUndefinedValues(cambio);
        return {
          ...cleanedCambio,
          fecha: Timestamp.fromDate(cambio.fecha)
        };
      });
    }

    await updateDoc(docRef, updateData);
  }

  async eliminarCirugiaProgramada(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.cirugiasProgramadasCollection, id);
    await deleteDoc(docRef);
  }

  async obtenerCirugiaProgramada(id: string): Promise<CirugiaProgramada | null> {
    const docRef = doc(this.firestore, this.cirugiasProgramadasCollection, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      fechaCreacion: data['fechaCreacion'].toDate(),
      fechaActualizacion: data['fechaActualizacion'].toDate(),
      historialCambios: data['historialCambios']?.map((cambio: any) => ({
        ...cambio,
        fecha: cambio.fecha.toDate()
      })) || []
    } as CirugiaProgramada;
  }

  // ============ CONSULTAS Y FILTROS ============

  obtenerCirugiasProgramadas(filtros?: FiltrosCirugia): Observable<CirugiaProgramada[]> {
    let q = query(collection(this.firestore, this.cirugiasProgramadasCollection));

    if (filtros?.estado && filtros.estado.length > 0) {
      q = query(q, where('estado', 'in', filtros.estado));
    }

    if (filtros?.idMedico) {
      q = query(q, where('personalAsignado', 'array-contains', { 
        idPersonal: filtros.idMedico, 
        tipoPersonal: 'medico' 
      }));
    }

    if (filtros?.prioridad && filtros.prioridad.length > 0) {
      q = query(q, where('prioridad', 'in', filtros.prioridad));
    }

    q = query(q, orderBy('fechaCreacion', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data['fechaCreacion'].toDate(),
            fechaActualizacion: data['fechaActualizacion'].toDate(),
            historialCambios: data['historialCambios']?.map((cambio: any) => ({
              ...cambio,
              fecha: cambio.fecha.toDate()
            })) || []
          } as CirugiaProgramada;
        })
      )
    );
  }

  async obtenerCirugiasPorPaciente(idPaciente: string): Promise<CirugiaProgramada[]> {
    const q = query(
      collection(this.firestore, this.cirugiasProgramadasCollection),
      where('idPaciente', '==', idPaciente),
      orderBy('fechaCreacion', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data['fechaCreacion'].toDate(),
        fechaActualizacion: data['fechaActualizacion'].toDate(),
        historialCambios: data['historialCambios']?.map((cambio: any) => ({
          ...cambio,
          fecha: cambio.fecha.toDate()
        })) || []
      } as CirugiaProgramada;
    });
  }

  async obtenerCirugiasPorFecha(fecha: Date): Promise<CirugiaProgramada[]> {
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);

    const q = query(
      collection(this.firestore, this.cirugiasProgramadasCollection),
      where('agenda.fechaInicio', '>=', Timestamp.fromDate(inicioDelDia)),
      where('agenda.fechaInicio', '<=', Timestamp.fromDate(finDelDia)),
      orderBy('agenda.fechaInicio', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data['fechaCreacion'].toDate(),
        fechaActualizacion: data['fechaActualizacion'].toDate(),
        historialCambios: data['historialCambios']?.map((cambio: any) => ({
          ...cambio,
          fecha: cambio.fecha.toDate()
        })) || []
      } as CirugiaProgramada;
    });
  }

  // ============ GESTIÓN DE ESTADOS ============

  async cambiarEstadoCirugia(
    id: string, 
    nuevoEstado: EstadoCirugiaProgramada, 
    usuario: string, 
    motivo?: string,
    observaciones?: string
  ): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(id);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    const cambio: CambioEstadoCirugia = {
      estadoAnterior: cirugia.estado,
      estadoNuevo: nuevoEstado,
      fecha: new Date(),
      usuario
    };

    // Solo agregar motivo y observaciones si no son undefined
    if (motivo !== undefined) {
      cambio.motivo = motivo;
    }
    if (observaciones !== undefined) {
      cambio.observaciones = observaciones;
    }

    const historialActualizado = [...cirugia.historialCambios, cambio];

    await this.actualizarCirugiaProgramada(id, {
      estado: nuevoEstado,
      historialCambios: historialActualizado,
      modificadoPor: usuario
    });
  }

  async aprobarCirugia(id: string, usuario: string): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(id);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    // Verificar que todos los items obligatorios del checklist estén completados
    const itemsObligatoriosPendientes = cirugia.checklist.filter(
      item => item.esObligatorio && item.estado !== EstadoItemChecklist.COMPLETADO
    );

    if (itemsObligatoriosPendientes.length > 0) {
      throw new Error(`Faltan items obligatorios del checklist: ${itemsObligatoriosPendientes.map(i => i.nombre).join(', ')}`);
    }

    await this.cambiarEstadoCirugia(
      id, 
      EstadoCirugiaProgramada.APROBADA, 
      usuario, 
      'Checklist completado - Cirugía aprobada'
    );
  }

  async agendarCirugia(id: string, agenda: AgendaCirugia, usuario: string): Promise<void> {
    // Verificar disponibilidad antes de agendar
    const disponibilidad = await this.verificarDisponibilidad(
      agenda.fechaInicio,
      agenda.fechaFin,
      agenda.quirofano
    );

    if (!disponibilidad.quirofanoDisponible) {
      throw new Error('El quirófano no está disponible en el horario seleccionado');
    }

    if (disponibilidad.personalNoDisponible.length > 0) {
      throw new Error(`Personal no disponible: ${disponibilidad.personalNoDisponible.map(p => p.nombre).join(', ')}`);
    }

    await this.actualizarCirugiaProgramada(id, {
      agenda,
      estado: EstadoCirugiaProgramada.AGENDADA,
      modificadoPor: usuario
    });

    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.AGENDADA,
      usuario,
      `Cirugía agendada para ${agenda.fechaInicio.toLocaleDateString()} - ${agenda.quirofano}`
    );
  }

  async iniciarCirugia(id: string, usuario: string): Promise<void> {
    const tiempos = {
      inicioReal: new Date()
    };

    await this.actualizarCirugiaProgramada(id, {
      tiempos,
      estado: EstadoCirugiaProgramada.EN_PROCESO,
      modificadoPor: usuario
    });

    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.EN_PROCESO,
      usuario,
      'Cirugía iniciada'
    );
  }

  async finalizarCirugia(id: string, usuario: string): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(id);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    const tiemposActualizados = {
      ...cirugia.tiempos,
      finReal: new Date()
    };

    // Calcular duración real
    if (tiemposActualizados.inicioReal) {
      // Convertir a Date si es necesario
      const inicioReal = tiemposActualizados.inicioReal instanceof Date 
        ? tiemposActualizados.inicioReal 
        : (tiemposActualizados.inicioReal as any).toDate();
      
      const finReal = tiemposActualizados.finReal!;
      
      tiemposActualizados.duracionRealMinutos = Math.round(
        (finReal.getTime() - inicioReal.getTime()) / (1000 * 60)
      );
    }

    await this.actualizarCirugiaProgramada(id, {
      tiempos: tiemposActualizados,
      estado: EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES,
      modificadoPor: usuario
    });

    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES,
      usuario,
      'Cirugía finalizada - Pendiente observaciones del médico'
    );
  }

  async completarObservaciones(
    id: string, 
    observaciones: ObservacionesCirugia, 
    usuario: string
  ): Promise<void> {
    await this.actualizarCirugiaProgramada(id, {
      observaciones,
      estado: EstadoCirugiaProgramada.FINALIZADA,
      modificadoPor: usuario
    });

    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.FINALIZADA,
      usuario,
      'Observaciones médicas completadas'
    );
  }

  async cancelarCirugia(id: string, usuario: string, motivo: string): Promise<void> {
    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.CANCELADA,
      usuario,
      motivo
    );
  }

  async reprogramarCirugia(
    id: string, 
    nuevaAgenda: AgendaCirugia, 
    usuario: string, 
    motivo: string
  ): Promise<void> {
    // Verificar disponibilidad para la nueva fecha
    const disponibilidad = await this.verificarDisponibilidad(
      nuevaAgenda.fechaInicio,
      nuevaAgenda.fechaFin,
      nuevaAgenda.quirofano
    );

    if (!disponibilidad.quirofanoDisponible) {
      throw new Error('El quirófano no está disponible para la nueva fecha');
    }

    await this.actualizarCirugiaProgramada(id, {
      agenda: nuevaAgenda,
      estado: EstadoCirugiaProgramada.AGENDADA,
      modificadoPor: usuario
    });

    await this.cambiarEstadoCirugia(
      id,
      EstadoCirugiaProgramada.REPROGRAMADA,
      usuario,
      motivo
    );
  }

  // ============ GESTIÓN DE CHECKLIST ============

  async actualizarItemChecklist(
    cirugiaId: string, 
    itemId: string, 
    updates: Partial<ItemChecklistCirugia>
  ): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(cirugiaId);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    const checklistActualizado = cirugia.checklist.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );

    await this.actualizarCirugiaProgramada(cirugiaId, {
      checklist: checklistActualizado
    });
  }

  async agregarItemChecklist(cirugiaId: string, item: Omit<ItemChecklistCirugia, 'id'>): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(cirugiaId);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    const nuevoItem: ItemChecklistCirugia = {
      ...item,
      id: Date.now().toString(), // ID temporal
      estado: EstadoItemChecklist.PENDIENTE
    };

    const checklistActualizado = [...cirugia.checklist, nuevoItem];

    await this.actualizarCirugiaProgramada(cirugiaId, {
      checklist: checklistActualizado
    });
  }

  async eliminarItemChecklist(cirugiaId: string, itemId: string): Promise<void> {
    const cirugia = await this.obtenerCirugiaProgramada(cirugiaId);
    if (!cirugia) {
      throw new Error('Cirugía no encontrada');
    }

    const checklistActualizado = cirugia.checklist.filter(item => item.id !== itemId);

    await this.actualizarCirugiaProgramada(cirugiaId, {
      checklist: checklistActualizado
    });
  }

  // ============ DISPONIBILIDAD Y AGENDA ============

  async verificarDisponibilidad(
    fechaInicio: Date,
    fechaFin: Date,
    quirofano: string,
    personalRequerido?: PersonalAsignado[]
  ): Promise<{
    quirofanoDisponible: boolean;
    personalNoDisponible: DisponibilidadPersonal[];
  }> {
    // Verificar disponibilidad del quirófano
    const cirugiasMismoDia = await this.obtenerCirugiasPorFecha(fechaInicio);
    const quirofanoOcupado = cirugiasMismoDia.some(c => 
      c.agenda?.quirofano === quirofano &&
      c.estado !== EstadoCirugiaProgramada.CANCELADA &&
      this.hayConflictoHorario(
        fechaInicio, fechaFin,
        c.agenda.fechaInicio, c.agenda.fechaFin
      )
    );

    // Si no se especifica personal, retornar solo disponibilidad de quirófano
    if (!personalRequerido) {
      return {
        quirofanoDisponible: !quirofanoOcupado,
        personalNoDisponible: []
      };
    }

    // Verificar disponibilidad del personal
    const personalNoDisponible: DisponibilidadPersonal[] = [];
    
    for (const persona of personalRequerido) {
      const ocupado = cirugiasMismoDia.some(c => 
        c.personalAsignado.some(p => p.idPersonal === persona.idPersonal) &&
        c.estado !== EstadoCirugiaProgramada.CANCELADA &&
        this.hayConflictoHorario(
          fechaInicio, fechaFin,
          c.agenda!.fechaInicio, c.agenda!.fechaFin
        )
      );

      if (ocupado) {
        personalNoDisponible.push({
          idPersonal: persona.idPersonal,
          nombre: persona.nombre,
          tipo: persona.tipoPersonal as 'medico' | 'anestesiologo' | 'enfermera',
          disponible: false,
          motivoNoDisponible: 'Tiene otra cirugía programada',
          horariosOcupados: []
        });
      }
    }

    return {
      quirofanoDisponible: !quirofanoOcupado,
      personalNoDisponible
    };
  }

  private hayConflictoHorario(
    inicio1: Date, fin1: Date,
    inicio2: Date, fin2: Date
  ): boolean {
    return inicio1 < fin2 && fin1 > inicio2;
  }

  async obtenerDisponibilidadQuirofanos(fecha: Date): Promise<DisponibilidadQuirofano[]> {
    const cirugiasDia = await this.obtenerCirugiasPorFecha(fecha);
    
    return QUIROFANOS_DISPONIBLES.map(quirofano => {
      const cirugiasProgramadas = cirugiasDia.filter(c => 
        c.agenda?.quirofano === quirofano && 
        c.estado !== EstadoCirugiaProgramada.CANCELADA
      );

      return {
        quirofano,
        disponible: cirugiasProgramadas.length === 0,
        horariosOcupados: cirugiasProgramadas.map(c => ({
          inicio: c.agenda!.fechaInicio,
          fin: c.agenda!.fechaFin,
          cirugiaId: c.id!
        }))
      };
    });
  }

  // ============ CHECKLIST AUTOMÁTICO ============

  generarChecklistPorTipoCirugia(
    tipoCirugia: string,
    condicionesPaciente: string[] = []
  ): ItemChecklistCirugia[] {
    let checklist: ItemChecklistCirugia[] = [];

    // Checklist básico para todas las cirugías
    checklist = [...CHECKLIST_BASICO.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random(),
      estado: EstadoItemChecklist.PENDIENTE
    }))];

    // Agregar checklist específico según condiciones del paciente
    if (condicionesPaciente.includes('problemas_cardiovasculares')) {
      checklist.push(...CHECKLIST_CARDIOVASCULAR.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        estado: EstadoItemChecklist.PENDIENTE
      })));
    }

    // Agregar checklist para anestesia general
    if (condicionesPaciente.includes('anestesia_general')) {
      checklist.push(...CHECKLIST_ANESTESIA_GENERAL.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        estado: EstadoItemChecklist.PENDIENTE
      })));
    }

    return checklist;
  }

  // ============ ESTADÍSTICAS ============

  async obtenerEstadisticasCirugias(): Promise<any> {
    const q = query(collection(this.firestore, this.cirugiasProgramadasCollection));
    const snapshot = await getDocs(q);
    const cirugias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    return {
      total: cirugias.length,
      porEstado: {
        pendienteAprobacion: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.PENDIENTE_APROBACION).length,
        aprobadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.APROBADA).length,
        agendadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.AGENDADA).length,
        enProceso: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.EN_PROCESO).length,
        pendienteObservaciones: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES).length,
        finalizadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.FINALIZADA).length,
        canceladas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.CANCELADA).length
      },
      porPrioridad: {
        baja: cirugias.filter(c => c.prioridad === PrioridadCirugia.BAJA).length,
        normal: cirugias.filter(c => c.prioridad === PrioridadCirugia.NORMAL).length,
        alta: cirugias.filter(c => c.prioridad === PrioridadCirugia.ALTA).length,
        urgente: cirugias.filter(c => c.prioridad === PrioridadCirugia.URGENTE).length
      }
    };
  }

  // ============ UTILIDADES ============

  calcularTiempoEstimado(tipoCirugia: string): number {
    // Tiempos estimados en minutos según tipo de cirugía
    const tiemposEstimados: { [key: string]: number } = {
      'liposuccion': 180,
      'rinoplastia': 120,
      'mamoplastia': 150,
      'abdominoplastia': 240,
      'blefaroplastia': 90,
      'otoplastia': 60,
      'lifting_facial': 200,
      'implantes_mamarios': 120,
      'lipotransferencia': 180,
      'cirugia_intima': 90
    };

    return tiemposEstimados[tipoCirugia] || 120; // 2 horas por defecto
  }

  validarCamposCirugia(cirugia: Partial<CirugiaProgramada>): string[] {
    const errores: string[] = [];

    if (!cirugia.idPaciente) errores.push('Paciente es requerido');
    if (!cirugia.idTipoCirugia) errores.push('Tipo de cirugía es requerido');
    if (!cirugia.personalAsignado || cirugia.personalAsignado.length === 0) {
      errores.push('Debe asignar al menos un médico');
    }

    // Verificar que haya al menos un médico
    const tienesMedico = cirugia.personalAsignado?.some(p => p.tipoPersonal === 'medico');
    if (!tienesMedico) errores.push('Debe asignar al menos un médico');

    return errores;
  }
}