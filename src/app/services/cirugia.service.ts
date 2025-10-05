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
  TipoCirugia, 
  ChecklistCirugia, 
  RequisitoMinimo,
  CategoriaCirugia,
  NivelComplejidad,
  TipoAnestesia,
  TipoRequisito,
  EstadoChecklist,
  TIPOS_CIRUGIAS_PREDEFINIDOS,
  REQUISITOS_MINIMOS_COMUNES
} from '../models/cirugia.interface';

@Injectable({
  providedIn: 'root'
})
export class CirugiaService {
  private tiposCirugiaCollection = 'tipos_cirugia';
  private checklistCollection = 'checklist_cirugias';

  constructor(private firestore: Firestore) {}

  // ============ CRUD TIPOS DE CIRUGÍA ============

  async crearTipoCirugia(tipoCirugia: Omit<TipoCirugia, 'id'>): Promise<string> {
    try {
      const data = {
        ...tipoCirugia,
        fechaCreacion: Timestamp.fromDate(tipoCirugia.fechaCreacion),
        fechaActualizacion: Timestamp.fromDate(tipoCirugia.fechaActualizacion)
      };
      
      const docRef = await addDoc(collection(this.firestore, this.tiposCirugiaCollection), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creando tipo de cirugía:', error);
      throw error;
    }
  }

  async actualizarTipoCirugia(id: string, datos: Partial<TipoCirugia>): Promise<void> {
    try {
      const tipoRef = doc(this.firestore, this.tiposCirugiaCollection, id);
      const updateData: any = { ...datos };
      
      if (updateData.fechaCreacion) {
        updateData.fechaCreacion = Timestamp.fromDate(updateData.fechaCreacion);
      }
      if (updateData.fechaActualizacion) {
        updateData.fechaActualizacion = Timestamp.fromDate(updateData.fechaActualizacion);
      }
      
      await updateDoc(tipoRef, updateData);
    } catch (error) {
      console.error('Error actualizando tipo de cirugía:', error);
      throw error;
    }
  }

  async eliminarTipoCirugia(id: string): Promise<void> {
    try {
      // En lugar de eliminar físicamente, marcamos como inactivo
      await this.actualizarTipoCirugia(id, { 
        activo: false,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error eliminando tipo de cirugía:', error);
      throw error;
    }
  }

  // Método simple para obtener tipos de cirugía sin ordenar (para evitar índices)
  async obtenerTiposCirugiaSimple(): Promise<TipoCirugia[]> {
    const q = query(
      collection(this.firestore, this.tiposCirugiaCollection),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data()['fechaCreacion'].toDate(),
      fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
    } as TipoCirugia));
  }

  // Método Observable simple que no requiere índice
  obtenerTiposCirugiaObservable(): Observable<TipoCirugia[]> {
    return from(this.obtenerTiposCirugiaSimple());
  }

  // Método con Observable que requiere índice compuesto (solo usar si se crea el índice)
  obtenerTiposCirugia(): Observable<TipoCirugia[]> {
    const q = query(
      collection(this.firestore, this.tiposCirugiaCollection),
      where('activo', '==', true),
      orderBy('nombre', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as TipoCirugia))
      )
    );
  }

  async obtenerTipoCirugiaPorId(id: string): Promise<TipoCirugia | null> {
    try {
      const tipoRef = doc(this.firestore, this.tiposCirugiaCollection, id);
      const docSnap = await getDoc(tipoRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fechaCreacion: data['fechaCreacion'].toDate(),
          fechaActualizacion: data['fechaActualizacion'].toDate()
        } as TipoCirugia;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo tipo de cirugía:', error);
      return null;
    }
  }

  obtenerTiposCirugiaPorCategoria(categoria: CategoriaCirugia): Observable<TipoCirugia[]> {
    const q = query(
      collection(this.firestore, this.tiposCirugiaCollection),
      where('activo', '==', true),
      where('categoria', '==', categoria),
      orderBy('nombre', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data()['fechaCreacion'].toDate(),
          fechaActualizacion: doc.data()['fechaActualizacion'].toDate()
        } as TipoCirugia))
      )
    );
  }

  // ============ CRUD CHECKLIST CIRUGÍAS ============

  async crearChecklistCirugia(checklist: Omit<ChecklistCirugia, 'id'>): Promise<string> {
    try {
      const data = {
        ...checklist,
        fechaCreacion: Timestamp.fromDate(checklist.fechaCreacion),
        fechaActualizacion: Timestamp.fromDate(checklist.fechaActualizacion),
        fechaAprobacion: checklist.fechaAprobacion ? Timestamp.fromDate(checklist.fechaAprobacion) : null
      };
      
      const docRef = await addDoc(collection(this.firestore, this.checklistCollection), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creando checklist:', error);
      throw error;
    }
  }

  async actualizarChecklistCirugia(id: string, datos: Partial<ChecklistCirugia>): Promise<void> {
    try {
      const checklistRef = doc(this.firestore, this.checklistCollection, id);
      const updateData: any = { ...datos };
      
      if (updateData.fechaCreacion) {
        updateData.fechaCreacion = Timestamp.fromDate(updateData.fechaCreacion);
      }
      if (updateData.fechaActualizacion) {
        updateData.fechaActualizacion = Timestamp.fromDate(updateData.fechaActualizacion);
      }
      if (updateData.fechaAprobacion) {
        updateData.fechaAprobacion = Timestamp.fromDate(updateData.fechaAprobacion);
      }
      
      await updateDoc(checklistRef, updateData);
    } catch (error) {
      console.error('Error actualizando checklist:', error);
      throw error;
    }
  }

  obtenerChecklistPorCita(citaId: string): Observable<ChecklistCirugia | null> {
    const q = query(
      collection(this.firestore, this.checklistCollection),
      where('citaId', '==', citaId)
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.docs.length > 0) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data['fechaCreacion'].toDate(),
            fechaActualizacion: data['fechaActualizacion'].toDate(),
            fechaAprobacion: data['fechaAprobacion'] ? data['fechaAprobacion'].toDate() : undefined
          } as ChecklistCirugia;
        }
        return null;
      })
    );
  }

  obtenerChecklistPorPaciente(pacienteId: string): Observable<ChecklistCirugia[]> {
    const q = query(
      collection(this.firestore, this.checklistCollection),
      where('pacienteId', '==', pacienteId),
      orderBy('fechaCreacion', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data['fechaCreacion'].toDate(),
            fechaActualizacion: data['fechaActualizacion'].toDate(),
            fechaAprobacion: data['fechaAprobacion'] ? data['fechaAprobacion'].toDate() : undefined
          } as ChecklistCirugia;
        })
      )
    );
  }

  // ============ MÉTODOS DE UTILIDAD ============

  async inicializarTiposCirugiasPredefinidos(): Promise<void> {
    try {
      console.log('Inicializando tipos de cirugías predefinidos...');
      
      for (const tipoCirugiaData of TIPOS_CIRUGIAS_PREDEFINIDOS) {
        const tipoCirugia: Omit<TipoCirugia, 'id'> = {
          ...tipoCirugiaData,
          checklistRequisitos: [...REQUISITOS_MINIMOS_COMUNES],
          preparacionPreoperatoria: this.obtenerPreparacionPorTipo(tipoCirugiaData.nombre),
          cuidadosPostoperatorios: this.obtenerCuidadosPorTipo(tipoCirugiaData.nombre),
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          activo: true,
          creadoPor: 'sistema'
        };
        
        await this.crearTipoCirugia(tipoCirugia);
      }
      
      console.log('Tipos de cirugías inicializados exitosamente');
    } catch (error) {
      console.error('Error inicializando tipos de cirugías:', error);
      throw error;
    }
  }

  async limpiarTiposCirugias(): Promise<void> {
    try {
      const q = query(collection(this.firestore, this.tiposCirugiaCollection));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Tipos de cirugías eliminados');
    } catch (error) {
      console.error('Error limpiando tipos de cirugías:', error);
      throw error;
    }
  }

  async generarChecklistParaCita(citaId: string, pacienteId: string, tipoCirugiaId: string): Promise<string> {
    try {
      // Obtener el tipo de cirugía para usar sus requisitos
      const tipoCirugia = await this.obtenerTipoCirugiaPorId(tipoCirugiaId);
      if (!tipoCirugia) {
        throw new Error('Tipo de cirugía no encontrado');
      }

      // Crear requisitos completados basados en el checklist del tipo de cirugía
      const requisitosCompletados = tipoCirugia.checklistRequisitos.map(req => ({
        requisitoId: req.id,
        completado: false
      }));

      const checklist: Omit<ChecklistCirugia, 'id'> = {
        citaId,
        pacienteId,
        tipoCirugiaId,
        estado: EstadoChecklist.PENDIENTE,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        requisitosCompletados
      };

      return await this.crearChecklistCirugia(checklist);
    } catch (error) {
      console.error('Error generando checklist:', error);
      throw error;
    }
  }

  async aprobarChecklist(checklistId: string, aprobadoPor: string): Promise<void> {
    try {
      await this.actualizarChecklistCirugia(checklistId, {
        estado: EstadoChecklist.APROBADO,
        aprobadoPor,
        fechaAprobacion: new Date(),
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error aprobando checklist:', error);
      throw error;
    }
  }

  async rechazarChecklist(checklistId: string, observaciones: string): Promise<void> {
    try {
      await this.actualizarChecklistCirugia(checklistId, {
        estado: EstadoChecklist.RECHAZADO,
        observaciones,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error rechazando checklist:', error);
      throw error;
    }
  }

  calcularProgresoChecklist(checklist: ChecklistCirugia): { porcentaje: number; completados: number; total: number } {
    const total = checklist.requisitosCompletados.length;
    const completados = checklist.requisitosCompletados.filter(req => req.completado).length;
    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
    
    return { porcentaje, completados, total };
  }

  // ============ MÉTODOS PRIVADOS ============

  private obtenerPreparacionPorTipo(tipoCirugia: string): string[] {
    const preparacionesComunes = [
      'Ayuno de 8 horas antes de la cirugía',
      'Suspender medicamentos anticoagulantes 7 días antes',
      'No fumar al menos 2 semanas antes',
      'Realizar exámenes preoperatorios',
      'Confirmar acompañante para el día de la cirugía'
    ];

    const preparacionesEspecificas: { [key: string]: string[] } = {
      'Liposucción': [
        ...preparacionesComunes,
        'Usar faja compresiva el día de la cirugía',
        'Tener prendas postoperatorias disponibles'
      ],
      'Rinoplastia': [
        ...preparacionesComunes,
        'Lavar cabello la noche anterior',
        'No usar maquillaje el día de la cirugía'
      ],
      'Mamoplastia de Aumento': [
        ...preparacionesComunes,
        'Tener brasier postquirúrgico',
        'Organizar ayuda en casa por 48 horas'
      ],
      'Abdominoplastia': [
        ...preparacionesComunes,
        'Usar faja abdominal el día de la cirugía',
        'Organizar ayuda en casa por 1 semana',
        'Preparar área de descanso elevada'
      ]
    };

    return preparacionesEspecificas[tipoCirugia] || preparacionesComunes;
  }

  private obtenerCuidadosPorTipo(tipoCirugia: string): string[] {
    const cuidadosComunes = [
      'Tomar medicamentos según indicación médica',
      'Mantener heridas limpias y secas',
      'Asistir a todos los controles postoperatorios',
      'No realizar esfuerzos físicos por 2 semanas',
      'Reportar cualquier signo de alarma inmediatamente'
    ];

    const cuidadosEspecificos: { [key: string]: string[] } = {
      'Liposucción': [
        ...cuidadosComunes,
        'Usar faja compresiva 24/7 por 6 semanas',
        'Realizar drenajes linfáticos según indicación',
        'Evitar exposición solar en zonas tratadas'
      ],
      'Rinoplastia': [
        ...cuidadosComunes,
        'Mantener férula nasal por 7 días',
        'Dormir con cabecera elevada por 2 semanas',
        'No usar gafas por 6 semanas',
        'Evitar sonarse la nariz por 2 semanas'
      ],
      'Mamoplastia de Aumento': [
        ...cuidadosComunes,
        'Usar brasier postquirúrgico por 6 semanas',
        'No levantar brazos por encima de la cabeza por 2 semanas',
        'Realizar ejercicios de movilización según indicación'
      ],
      'Abdominoplastia': [
        ...cuidadosComunes,
        'Usar faja abdominal por 8 semanas',
        'Caminar desde el primer día para evitar trombosis',
        'Evitar conducir por 2 semanas',
        'No levantar objetos pesados por 6 semanas'
      ]
    };

    return cuidadosEspecificos[tipoCirugia] || cuidadosComunes;
  }

  // ============ UTILIDADES PARA ÍNDICES ============
  
  async verificarIndicesRequeridos(): Promise<{
    tiposOrdenados: boolean;
    checklistPorTipo: boolean;
    checklistPorCategoria: boolean;
  }> {
    const resultados = {
      tiposOrdenados: false,
      checklistPorTipo: false,
      checklistPorCategoria: false
    };

    try {
      // Probar consulta que requiere índice de tipos ordenados
      const qTipos = query(
        collection(this.firestore, this.tiposCirugiaCollection),
        where('activo', '==', true),
        orderBy('nombre', 'asc')
      );
      await getDocs(qTipos);
      resultados.tiposOrdenados = true;
    } catch (error) {
      console.log('Índice tipos_cirugia no disponible:', error);
    }

    try {
      // Probar consulta de checklist por tipo
      const qChecklistTipo = query(
        collection(this.firestore, this.checklistCollection),
        where('idTipoCirugia', '==', 'test'),
        where('activo', '==', true)
      );
      await getDocs(qChecklistTipo);
      resultados.checklistPorTipo = true;
    } catch (error) {
      console.log('Índice checklist por tipo no disponible:', error);
    }

    return resultados;
  }

  generarEnlacesIndices(): Array<{nombre: string, url: string, descripcion: string}> {
    const projectId = 'aramedic-3993b';
    
    return [
      {
        nombre: 'Índice tipos_cirugia (activo + nombre)',
        url: `https://console.firebase.google.com/v1/r/project/${projectId}/firestore/indexes?create_composite=ClRwcm9qZWN0cy9hcmFtZWRpYy0zOTkzYi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGlwb3NfY2lydWdpYS9pbmRleGVzL18QARoKCgZhY3Rpdm8QARoKCgZub21icmUQARoMCghfX25hbWVfXxAB`,
        descripcion: 'Permite ordenar tipos de cirugía por nombre con filtro activo'
      },
      {
        nombre: 'Consola de índices de Firestore',
        url: `https://console.firebase.google.com/project/${projectId}/firestore/indexes`,
        descripcion: 'Gestión general de todos los índices del proyecto'
      },
      {
        nombre: 'Documentación oficial',
        url: 'https://firebase.google.com/docs/firestore/query-data/indexing',
        descripcion: 'Guía completa sobre índices de Firestore'
      }
    ];
  }

  // ============ ESTADÍSTICAS ============

  async obtenerEstadisticasCirugias(): Promise<any> {
    try {
      const tipos = await this.obtenerTiposCirugiaSimple();
      const q = query(collection(this.firestore, this.checklistCollection));
      const checklistSnapshot = await getDocs(q);
      const checklists = checklistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      return {
        totalTipos: tipos.length,
        porCategoria: {
          facial: tipos.filter(t => t.categoria === CategoriaCirugia.FACIAL).length,
          corporal: tipos.filter(t => t.categoria === CategoriaCirugia.CORPORAL).length,
          mamaria: tipos.filter(t => t.categoria === CategoriaCirugia.MAMARIA).length,
          intima: tipos.filter(t => t.categoria === CategoriaCirugia.INTIMA).length,
          reconstructiva: tipos.filter(t => t.categoria === CategoriaCirugia.RECONSTRUCTIVA).length
        },
        porComplejidad: {
          baja: tipos.filter(t => t.nivelComplejidad === NivelComplejidad.BAJA).length,
          media: tipos.filter(t => t.nivelComplejidad === NivelComplejidad.MEDIA).length,
          alta: tipos.filter(t => t.nivelComplejidad === NivelComplejidad.ALTA).length,
          muyAlta: tipos.filter(t => t.nivelComplejidad === NivelComplejidad.MUY_ALTA).length
        },
        checklistsEstado: {
          pendientes: checklists.filter(c => c.estado === EstadoChecklist.PENDIENTE).length,
          enProceso: checklists.filter(c => c.estado === EstadoChecklist.EN_PROCESO).length,
          completos: checklists.filter(c => c.estado === EstadoChecklist.COMPLETO).length,
          aprobados: checklists.filter(c => c.estado === EstadoChecklist.APROBADO).length,
          rechazados: checklists.filter(c => c.estado === EstadoChecklist.RECHAZADO).length
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalTipos: 0,
        porCategoria: {},
        porComplejidad: {},
        checklistsEstado: {}
      };
    }
  }
}