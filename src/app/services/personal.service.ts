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
  orderBy,
  where,
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { 
  Personal, 
  TipoPersonal, 
  EstadoPersonal,
  TipoDocumento,
  TurnoTrabajo,
  MEDICOS_PREDEFINIDOS,
  ENFERMERAS_PREDEFINIDAS,
  ANESTESIOLOGOS_PREDEFINIDOS,
  CERTIFICACIONES_MEDICOS,
  CERTIFICACIONES_ENFERMERAS,
  CERTIFICACIONES_ANESTESIOLOGOS
} from '../models/personal.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private personalCollection = 'personal_medico';

  constructor(private firestore: Firestore) {}

  // ============ CRUD BÁSICO ============

  // Crear nuevo personal
  async crearPersonal(personal: Omit<Personal, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<string> {
    const personalData = {
      ...personal,
      fechaCreacion: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
      activo: true
    };

    const docRef = await addDoc(collection(this.firestore, this.personalCollection), personalData);
    return docRef.id;
  }

  // Obtener todo el personal (sin ordenar - evita índices)
  async obtenerPersonalSimple(): Promise<Personal[]> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaNacimiento: doc.data()['fechaNacimiento'].toDate(),
      fechaIngreso: doc.data()['fechaIngreso'].toDate(),
      fechaCreacion: doc.data()['fechaCreacion'].toDate(),
      fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
    } as Personal));
  }

  // Obtener personal con Observable (ordenado - requiere índice)
  obtenerPersonal(): Observable<Personal[]> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('activo', '==', true),
      orderBy('apellidos', 'asc'),
      orderBy('nombres', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaNacimiento: doc.data()['fechaNacimiento'].toDate(),
          fechaIngreso: doc.data()['fechaIngreso'].toDate(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as Personal))
      )
    );
  }

  // Obtener personal por tipo
  async obtenerPersonalPorTipo(tipo: TipoPersonal): Promise<Personal[]> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('activo', '==', true),
      where('tipoPersonal', '==', tipo)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaNacimiento: doc.data()['fechaNacimiento'].toDate(),
      fechaIngreso: doc.data()['fechaIngreso'].toDate(),
      fechaCreacion: doc.data()['fechaCreacion'].toDate(),
      fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
    } as Personal));
  }

  // Obtener personal por ID
  async obtenerPersonalPorId(id: string): Promise<Personal | null> {
    const docRef = doc(this.firestore, this.personalCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fechaNacimiento: data['fechaNacimiento'].toDate(),
        fechaIngreso: data['fechaIngreso'].toDate(),
        fechaCreacion: data['fechaCreacion'].toDate(),
        fechaActualizacion: data['fechaActualizacion'].toDate()
      } as Personal;
    }
    return null;
  }

  // Actualizar personal
  async actualizarPersonal(id: string, personal: Partial<Personal>): Promise<void> {
    const docRef = doc(this.firestore, this.personalCollection, id);
    const updateData: any = {
      ...personal,
      fechaActualizacion: Timestamp.now()
    };
    
    // Convertir fechas a Timestamp si existen
    if (personal.fechaNacimiento) {
      updateData.fechaNacimiento = Timestamp.fromDate(personal.fechaNacimiento);
    }
    if (personal.fechaIngreso) {
      updateData.fechaIngreso = Timestamp.fromDate(personal.fechaIngreso);
    }
    
    await updateDoc(docRef, updateData);
  }

  // Eliminar personal (soft delete)
  async eliminarPersonal(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.personalCollection, id);
    await updateDoc(docRef, {
      activo: false,
      fechaActualizacion: Timestamp.now()
    });
  }

  // Buscar personal por documento
  async buscarPorDocumento(numeroDocumento: string): Promise<Personal | null> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('numeroDocumento', '==', numeroDocumento),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaNacimiento: data['fechaNacimiento'].toDate(),
        fechaIngreso: data['fechaIngreso'].toDate(),
        fechaCreacion: data['fechaCreacion'].toDate(),
        fechaActualizacion: data['fechaActualizacion'].toDate()
      } as Personal;
    }
    return null;
  }

  // ============ DATOS PREDEFINIDOS ============

  async inicializarPersonalPredefinido(): Promise<void> {
    console.log('Inicializando personal predefinido...');
    
    // Crear médicos
    for (const medico of MEDICOS_PREDEFINIDOS) {
      const existe = await this.buscarPorDocumento(medico.numeroDocumento);
      if (!existe) {
        await this.crearPersonal({
          ...medico,
          activo: true
        });
        console.log(`Médico creado: ${medico.nombres} ${medico.apellidos}`);
      }
    }
    
    // Crear enfermeras
    for (const enfermera of ENFERMERAS_PREDEFINIDAS) {
      const existe = await this.buscarPorDocumento(enfermera.numeroDocumento);
      if (!existe) {
        await this.crearPersonal({
          ...enfermera,
          activo: true
        });
        console.log(`Enfermera creada: ${enfermera.nombres} ${enfermera.apellidos}`);
      }
    }
    
    // Crear anestesiólogos
    for (const anestesiologo of ANESTESIOLOGOS_PREDEFINIDOS) {
      const existe = await this.buscarPorDocumento(anestesiologo.numeroDocumento);
      if (!existe) {
        await this.crearPersonal({
          ...anestesiologo,
          activo: true
        });
        console.log(`Anestesiólogo creado: ${anestesiologo.nombres} ${anestesiologo.apellidos}`);
      }
    }
    
    console.log('Personal predefinido inicializado exitosamente');
  }

  // Limpiar todo el personal
  async limpiarPersonal(): Promise<void> {
    const personal = await this.obtenerPersonalSimple();
    
    for (const persona of personal) {
      if (persona.id) {
        await this.eliminarPersonal(persona.id);
      }
    }
    
    console.log(`${personal.length} registros de personal eliminados`);
  }

  // ============ UTILIDADES ============

  // Obtener certificaciones disponibles por tipo
  getCertificacionesPorTipo(tipo: TipoPersonal): string[] {
    return tipo === TipoPersonal.ENFERMERA 
      ? CERTIFICACIONES_ENFERMERAS 
      : CERTIFICACIONES_ANESTESIOLOGOS;
  }

  // Validar documento único
  async validarDocumentoUnico(numeroDocumento: string, idExcluir?: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('numeroDocumento', '==', numeroDocumento),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (idExcluir) {
      // Si estamos editando, excluir el ID actual
      return snapshot.docs.every(doc => doc.id === idExcluir);
    }
    
    return snapshot.empty;
  }

  // Validar email único
  async validarEmailUnico(email: string, idExcluir?: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, this.personalCollection),
      where('email', '==', email),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (idExcluir) {
      return snapshot.docs.every(doc => doc.id === idExcluir);
    }
    
    return snapshot.empty;
  }

  // Obtener contador de personal
  async obtenerContadorPersonal(): Promise<number> {
    const personal = await this.obtenerPersonalSimple();
    return personal.length;
  }

  // ============ ESTADÍSTICAS ============

  async obtenerEstadisticasPersonal(): Promise<any> {
    try {
      const personal = await this.obtenerPersonalSimple();
      
      return {
        total: personal.length,
        porTipo: {
          enfermeras: personal.filter(p => p.tipoPersonal === TipoPersonal.ENFERMERA).length,
          anestesiologos: personal.filter(p => p.tipoPersonal === TipoPersonal.ANESTESIOLOGO).length
        },
        porEstado: {
          activos: personal.filter(p => p.estado === EstadoPersonal.ACTIVO).length,
          inactivos: personal.filter(p => p.estado === EstadoPersonal.INACTIVO).length,
          suspendidos: personal.filter(p => p.estado === EstadoPersonal.SUSPENDIDO).length,
          vacaciones: personal.filter(p => p.estado === EstadoPersonal.VACACIONES).length,
          licencia: personal.filter(p => p.estado === EstadoPersonal.LICENCIA).length
        },
        porTurno: {
          manana: personal.filter(p => p.turnoPreferido === TurnoTrabajo.MANANA).length,
          tarde: personal.filter(p => p.turnoPreferido === TurnoTrabajo.TARDE).length,
          noche: personal.filter(p => p.turnoPreferido === TurnoTrabajo.NOCHE).length,
          rotativo: personal.filter(p => p.turnoPreferido === TurnoTrabajo.ROTATIVO).length,
          disponibilidadCompleta: personal.filter(p => p.turnoPreferido === TurnoTrabajo.DISPONIBILIDAD_COMPLETA).length
        },
        promedioExperiencia: {
          enfermeras: this.calcularPromedioExperiencia(personal.filter(p => p.tipoPersonal === TipoPersonal.ENFERMERA)),
          anestesiologos: this.calcularPromedioExperiencia(personal.filter(p => p.tipoPersonal === TipoPersonal.ANESTESIOLOGO))
        },
        promedioSalario: {
          enfermeras: this.calcularPromedioSalario(personal.filter(p => p.tipoPersonal === TipoPersonal.ENFERMERA)),
          anestesiologos: this.calcularPromedioSalario(personal.filter(p => p.tipoPersonal === TipoPersonal.ANESTESIOLOGO))
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de personal:', error);
      return {
        total: 0,
        porTipo: { enfermeras: 0, anestesiologos: 0 },
        porEstado: { activos: 0, inactivos: 0, suspendidos: 0, vacaciones: 0, licencia: 0 },
        porTurno: { manana: 0, tarde: 0, noche: 0, rotativo: 0, disponibilidadCompleta: 0 },
        promedioExperiencia: { enfermeras: 0, anestesiologos: 0 },
        promedioSalario: { enfermeras: 0, anestesiologos: 0 }
      };
    }
  }

  private calcularPromedioExperiencia(personal: Personal[]): number {
    if (personal.length === 0) return 0;
    const suma = personal.reduce((acc, p) => acc + p.experienciaAnios, 0);
    return Math.round((suma / personal.length) * 10) / 10;
  }

  private calcularPromedioSalario(personal: Personal[]): number {
    if (personal.length === 0) return 0;
    const suma = personal.reduce((acc, p) => acc + p.salarioBase, 0);
    return Math.round(suma / personal.length);
  }
}