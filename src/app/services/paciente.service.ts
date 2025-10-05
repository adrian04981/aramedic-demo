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
  collectionData,
  docData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Paciente, HistorialMedico } from '../models/paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private pacientesCollection;
  private historialCollection;

  constructor(private firestore: Firestore) {
    this.pacientesCollection = collection(this.firestore, 'pacientes');
    this.historialCollection = collection(this.firestore, 'historial_medico');
  }

  // CRUD Pacientes
  async crearPaciente(paciente: Omit<Paciente, 'id'>): Promise<string> {
    const pacienteData = {
      ...paciente,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      estado: 'activo' as const
    };
    
    const docRef = await addDoc(this.pacientesCollection, pacienteData);
    return docRef.id;
  }

  obtenerPacientes(): Observable<Paciente[]> {
    return collectionData(
      query(this.pacientesCollection, orderBy('apellidos', 'asc')),
      { idField: 'id' }
    ) as Observable<Paciente[]>;
  }

  obtenerPacientePorId(id: string): Observable<Paciente | undefined> {
    const pacienteDoc = doc(this.firestore, `pacientes/${id}`);
    return docData(pacienteDoc, { idField: 'id' }) as Observable<Paciente | undefined>;
  }

  async actualizarPaciente(id: string, datos: Partial<Paciente>): Promise<void> {
    const pacienteDoc = doc(this.firestore, `pacientes/${id}`);
    await updateDoc(pacienteDoc, {
      ...datos,
      fechaActualizacion: new Date()
    });
  }

  async eliminarPaciente(id: string): Promise<void> {
    const pacienteDoc = doc(this.firestore, `pacientes/${id}`);
    await updateDoc(pacienteDoc, {
      estado: 'inactivo',
      fechaActualizacion: new Date()
    });
  }

  // Búsqueda de pacientes
  buscarPacientes(termino: string): Observable<Paciente[]> {
    // Buscar por nombre, apellido o documento
    const q = query(
      this.pacientesCollection,
      where('estado', '==', 'activo'),
      orderBy('apellidos')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Paciente[]>;
  }

  // Historial Médico
  async agregarHistorial(historial: Omit<HistorialMedico, 'id'>): Promise<string> {
    const historialData = {
      ...historial,
      fechaCreacion: new Date()
    };
    
    const docRef = await addDoc(this.historialCollection, historialData);
    return docRef.id;
  }

  obtenerHistorialPaciente(pacienteId: string): Observable<HistorialMedico[]> {
    const q = query(
      this.historialCollection,
      where('pacienteId', '==', pacienteId),
      orderBy('fecha', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<HistorialMedico[]>;
  }

  async actualizarHistorial(id: string, datos: Partial<HistorialMedico>): Promise<void> {
    const historialDoc = doc(this.firestore, `historial_medico/${id}`);
    await updateDoc(historialDoc, datos);
  }

  // Validaciones
  async validarDocumentoUnico(tipoDocumento: string, numeroDocumento: string, excludeId?: string): Promise<boolean> {
    const q = query(
      this.pacientesCollection,
      where('tipoDocumento', '==', tipoDocumento),
      where('numeroDocumento', '==', numeroDocumento),
      where('estado', '==', 'activo')
    );
    
    const snapshot = await getDocs(q);
    
    if (excludeId) {
      return snapshot.docs.filter(doc => doc.id !== excludeId).length === 0;
    }
    
    return snapshot.empty;
  }

  // Estadísticas
  async contarPacientesActivos(): Promise<number> {
    const q = query(
      this.pacientesCollection,
      where('estado', '==', 'activo')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}