import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Cita, EstadoCita, TipoCita } from '../models/cita.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private citasCollection = 'citas';

  constructor(private firestore: Firestore) {}

  // CRUD básico de Citas
  async crearCita(cita: Cita): Promise<string> {
    try {
      const citaData = {
        ...cita,
        fecha: Timestamp.fromDate(cita.fecha),
        fechaCreacion: Timestamp.fromDate(cita.fechaCreacion),
        fechaActualizacion: Timestamp.fromDate(cita.fechaActualizacion),
        estado: EstadoCita.CONFIRMADA // Todas las citas se crean confirmadas
      };
      
      delete (citaData as any).id;
      const docRef = await addDoc(collection(this.firestore, this.citasCollection), citaData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando cita:', error);
      throw error;
    }
  }

  async actualizarCita(id: string, datos: Partial<Cita>): Promise<void> {
    try {
      const citaRef = doc(this.firestore, this.citasCollection, id);
      const updateData: any = { ...datos };
      
      if (updateData.fecha) {
        updateData.fecha = Timestamp.fromDate(updateData.fecha);
      }
      if (updateData.fechaCreacion) {
        updateData.fechaCreacion = Timestamp.fromDate(updateData.fechaCreacion);
      }
      if (updateData.fechaActualizacion) {
        updateData.fechaActualizacion = Timestamp.fromDate(updateData.fechaActualizacion);
      }
      
      await updateDoc(citaRef, updateData);
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  async eliminarCita(id: string): Promise<void> {
    try {
      const citaRef = doc(this.firestore, this.citasCollection, id);
      await deleteDoc(citaRef);
    } catch (error) {
      console.error('Error eliminando cita:', error);
      throw error;
    }
  }

  obtenerCitas(): Observable<Cita[]> {
    const q = query(
      collection(this.firestore, this.citasCollection),
      orderBy('fecha', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data()['fecha'].toDate(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as Cita))
      )
    );
  }

  async obtenerContadorCitas(): Promise<number> {
    try {
      const q = query(collection(this.firestore, this.citasCollection));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error obteniendo contador de citas:', error);
      return 0;
    }
  }

  async obtenerCitaPorId(id: string): Promise<Cita | null> {
    try {
      const citaRef = doc(this.firestore, this.citasCollection, id);
      const docSnap = await getDoc(citaRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fecha: data['fecha'].toDate(),
          fechaCreacion: data['fechaCreacion'].toDate(),
          fechaActualizacion: data['fechaActualizacion'].toDate()
        } as Cita;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo cita:', error);
      return null;
    }
  }

  obtenerCitasPorFecha(fecha: Date): Observable<Cita[]> {
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);

    const q = query(
      collection(this.firestore, this.citasCollection),
      where('fecha', '>=', Timestamp.fromDate(inicioDelDia)),
      where('fecha', '<=', Timestamp.fromDate(finDelDia)),
      orderBy('fecha', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data()['fecha'].toDate(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as Cita))
      )
    );
  }

  obtenerCitasPorPaciente(pacienteId: string): Observable<Cita[]> {
    const q = query(
      collection(this.firestore, this.citasCollection),
      where('pacienteId', '==', pacienteId),
      orderBy('fecha', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data()['fecha'].toDate(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as Cita))
      )
    );
  }

  obtenerCitasPorMedico(medicoId: string): Observable<Cita[]> {
    const q = query(
      collection(this.firestore, this.citasCollection),
      where('medicoId', '==', medicoId),
      orderBy('fecha', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data()['fecha'].toDate(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as Cita))
      )
    );
  }

  // Gestión de estados completa
  async iniciarCita(id: string): Promise<void> {
    await this.actualizarCita(id, { 
      estado: EstadoCita.EN_CURSO,
      fechaActualizacion: new Date()
    });
  }

  async completarCita(id: string, observaciones?: string): Promise<void> {
    await this.actualizarCita(id, { 
      estado: EstadoCita.COMPLETADA,
      observaciones: observaciones || undefined,
      fechaActualizacion: new Date()
    });
  }

  async cancelarCita(id: string, motivo?: string): Promise<void> {
    await this.actualizarCita(id, { 
      estado: EstadoCita.CANCELADA,
      observaciones: motivo || 'Cita cancelada',
      fechaActualizacion: new Date()
    });
  }

  async marcarNoAsistio(id: string): Promise<void> {
    await this.actualizarCita(id, { 
      estado: EstadoCita.NO_ASISTIO,
      fechaActualizacion: new Date()
    });
  }

  async reprogramarCita(id: string, nuevaFecha: Date, nuevaHora: string): Promise<string> {
    const citaOriginal = await this.obtenerCitaPorId(id);
    if (!citaOriginal) {
      throw new Error('Cita no encontrada');
    }

    // Marcar como reprogramada
    await this.actualizarCita(id, { 
      estado: EstadoCita.REPROGRAMADA,
      fechaActualizacion: new Date()
    });

    // Crear nueva cita
    const nuevaCita: Cita = {
      ...citaOriginal,
      fecha: nuevaFecha,
      horaInicio: nuevaHora,
      estado: EstadoCita.CONFIRMADA,
      citaOriginalId: id,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    return await this.crearCita(nuevaCita);
  }

  // Estadísticas completas
  async obtenerEstadisticasCitas(): Promise<any> {
    const citas = await this.obtenerCitas().toPromise() || [];
    
    return {
      total: citas.length,
      confirmadas: citas.filter(c => c.estado === EstadoCita.CONFIRMADA).length,
      enCurso: citas.filter(c => c.estado === EstadoCita.EN_CURSO).length,
      completadas: citas.filter(c => c.estado === EstadoCita.COMPLETADA).length,
      canceladas: citas.filter(c => c.estado === EstadoCita.CANCELADA).length,
      noAsistio: citas.filter(c => c.estado === EstadoCita.NO_ASISTIO).length,
      reprogramadas: citas.filter(c => c.estado === EstadoCita.REPROGRAMADA).length,
      porTipo: {
        consultaInicial: citas.filter(c => c.tipo === TipoCita.CONSULTA_INICIAL).length,
        cirugia: citas.filter(c => c.tipo === TipoCita.CIRUGIA).length,
        postOperatorio: citas.filter(c => c.tipo === TipoCita.POST_OPERATORIO).length
      }
    };
  }

  // Método para limpiar todas las citas (útil para el setup)
  async limpiarTodasLasCitas(): Promise<void> {
    try {
      const q = query(collection(this.firestore, this.citasCollection));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Todas las citas han sido eliminadas');
    } catch (error) {
      console.error('Error limpiando citas:', error);
      throw error;
    }
  }

  // Método para validar disponibilidad de horario
  async validarDisponibilidadHorario(
    fecha: Date, 
    horaInicio: string, 
    horaFin: string, 
    medicoId: string, 
    citaIdExcluir?: string
  ): Promise<boolean> {
    try {
      const citasQuery = query(
        collection(this.firestore, this.citasCollection),
        where('medicoId', '==', medicoId),
        where('fecha', '==', fecha),
        where('estado', 'in', [EstadoCita.CONFIRMADA, EstadoCita.EN_CURSO])
      );

      const citasSnap = await getDocs(citasQuery);
      const citasExistentes = citasSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Cita))
        .filter(cita => cita.id !== citaIdExcluir);

      // Verificar si hay conflicto de horarios
      for (const cita of citasExistentes) {
        const inicioExistente = this.convertirHoraAMinutos(cita.horaInicio);
        const finExistente = this.convertirHoraAMinutos(cita.horaFin);
        const inicioNuevo = this.convertirHoraAMinutos(horaInicio);
        const finNuevo = this.convertirHoraAMinutos(horaFin);

        // Verificar solapamiento
        if (
          (inicioNuevo >= inicioExistente && inicioNuevo < finExistente) ||
          (finNuevo > inicioExistente && finNuevo <= finExistente) ||
          (inicioNuevo <= inicioExistente && finNuevo >= finExistente)
        ) {
          return false; // Hay conflicto
        }
      }

      return true; // No hay conflicto
    } catch (error) {
      console.error('Error validando disponibilidad:', error);
      return false;
    }
  }

  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  // Método para confirmar cita (aunque ya no se use)
  async confirmarCita(citaId: string): Promise<void> {
    try {
      const citaRef = doc(this.firestore, this.citasCollection, citaId);
      await updateDoc(citaRef, {
        estado: EstadoCita.CONFIRMADA,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error confirmando cita:', error);
      throw error;
    }
  }
}