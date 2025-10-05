import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProgramacionCirugiaService } from '../../services/programacion-cirugia.service';
import { PacienteService } from '../../services/paciente.service';
import { CirugiaService } from '../../services/cirugia.service';
import { PersonalService } from '../../services/personal.service';
import { AuthService, UserRole } from '../../services/auth.service';
import { 
  CirugiaProgramada,
  EstadoCirugiaProgramada,
  ItemChecklistCirugia,
  EstadoItemChecklist,
  TipoArchivoChecklist,
  PersonalAsignado,
  AgendaCirugia,
  ObservacionesCirugia,
  PrioridadCirugia,
  TipoComplicacion,
  MedicacionPrescrita,
  QUIROFANOS_DISPONIBLES,
  MEDICAMENTOS_COMUNES,
  VIAS_ADMINISTRACION,
  FRECUENCIAS_MEDICACION
} from '../../models/programacion-cirugia.interface';
import { Paciente } from '../../models/paciente.interface';
import { TipoCirugia } from '../../models/cirugia.interface';
import { Personal } from '../../models/personal.interface';

@Component({
  selector: 'app-programacion-cirugia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="programacion-container">
      <div class="programacion-header">
        <h1>🏥 Programación de Cirugías</h1>
        <p>Gestiona el ciclo completo de cirugías: creación, aprobación, agenda y seguimiento</p>
        
        <div class="header-actions">
          <button class="btn btn-primary" (click)="abrirModal('crear')">
            ➕ Nueva Cirugía
          </button>
          <div class="filtros-rapidos">
            <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="select-filtro">
              <option value="">Todos los estados</option>
              <option value="pendiente_aprobacion">Pendiente Aprobación</option>
              <option value="aprobada">Aprobada</option>
              <option value="agendada">Agendada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="pendiente_observaciones">Pendiente Observaciones</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-grid">
        <div class="stat-card pendiente">
          <h3>{{estadisticas().porEstado.pendienteAprobacion || 0}}</h3>
          <p>Pendiente Aprobación</p>
        </div>
        <div class="stat-card aprobada">
          <h3>{{estadisticas().porEstado.aprobadas || 0}}</h3>
          <p>Aprobadas</p>
        </div>
        <div class="stat-card agendada">
          <h3>{{estadisticas().porEstado.agendadas || 0}}</h3>
          <p>Agendadas</p>
        </div>
        <div class="stat-card proceso">
          <h3>{{estadisticas().porEstado.enProceso || 0}}</h3>
          <p>En Proceso</p>
        </div>
        <div class="stat-card observaciones">
          <h3>{{estadisticas().porEstado.pendienteObservaciones || 0}}</h3>
          <p>Pendiente Observaciones</p>
        </div>
        <div class="stat-card finalizada">
          <h3>{{estadisticas().porEstado.finalizadas || 0}}</h3>
          <p>Finalizadas</p>
        </div>
      </div>

      <!-- Lista de cirugías -->
      <div class="cirugias-grid">
        @for (cirugia of cirugiasFiltradas(); track cirugia.id) {
          <div class="cirugia-card" [class]="cirugia.estado">
            <div class="cirugia-header">
              <div class="cirugia-info">
                <h3>{{cirugia.nombreCirugia}}</h3>
                <p class="paciente">{{cirugia.nombrePaciente}} {{cirugia.apellidoPaciente}}</p>
                <span class="documento">{{cirugia.documentoPaciente}}</span>
              </div>
              <div class="cirugia-badges">
                <span class="estado-badge" [class]="cirugia.estado">
                  {{getEstadoLabel(cirugia.estado)}}
                </span>
                <span class="prioridad-badge" [class]="cirugia.prioridad">
                  {{getPrioridadLabel(cirugia.prioridad)}}
                </span>
              </div>
            </div>

            <div class="cirugia-details">
              @if (cirugia.agenda) {
                <div class="agenda-info">
                  <p><strong>📅 Fecha:</strong> {{formatearFecha(cirugia.agenda.fechaInicio)}}</p>
                  <p><strong>⏰ Hora:</strong> {{cirugia.agenda.horaInicio}} - {{cirugia.agenda.horaFin}}</p>
                  <p><strong>🏥 Quirófano:</strong> {{cirugia.agenda.quirofano}}</p>
                </div>
              }
              
              <div class="personal-asignado">
                <p><strong>👨‍⚕️ Personal:</strong></p>
                @for (persona of cirugia.personalAsignado; track persona.idPersonal) {
                  <span class="personal-badge" [class]="persona.tipoPersonal">
                    {{persona.nombre}} {{persona.apellido}} ({{getTipoPersonalLabel(persona.tipoPersonal)}})
                  </span>
                }
              </div>

              @if (cirugia.checklist && cirugia.checklist.length > 0) {
                <div class="checklist-progress">
                  <p><strong>📋 Checklist:</strong></p>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                         [style.width.%]="getProgresoChecklist(cirugia.checklist)">
                    </div>
                  </div>
                  <span class="progress-text">
                    {{getItemsCompletados(cirugia.checklist)}}/{{cirugia.checklist.length}} completados
                  </span>
                </div>
              }
            </div>

            <div class="cirugia-actions">
              <button class="btn-action btn-view" (click)="verDetalleCirugia(cirugia)" title="Ver detalles">
                👁️
              </button>
              
              @if (cirugia.estado === EstadoCirugiaProgramada.PENDIENTE_APROBACION) {
                <button class="btn-action btn-edit" (click)="editarChecklist(cirugia)" title="Editar checklist">
                  📝
                </button>
                <button class="btn-action btn-approve" (click)="aprobarCirugia(cirugia)" title="Aprobar">
                  ✅
                </button>
              }
              
              @if (cirugia.estado === EstadoCirugiaProgramada.APROBADA) {
                <button class="btn-action btn-calendar" (click)="agendarCirugia(cirugia)" title="Agendar">
                  📅
                </button>
              }
              
              @if (cirugia.estado === EstadoCirugiaProgramada.AGENDADA) {
                <button class="btn-action btn-start" (click)="iniciarCirugia(cirugia)" title="Iniciar">
                  ▶️
                </button>
                <button class="btn-action btn-edit" (click)="reprogramarCirugia(cirugia)" title="Reprogramar">
                  🔄
                </button>
              }
              
              @if (cirugia.estado === EstadoCirugiaProgramada.EN_PROCESO) {
                <button class="btn-action btn-finish" (click)="finalizarCirugia(cirugia)" title="Finalizar Procedimiento">
                  🏁 Finalizar
                </button>
              }
              
              @if (cirugia.estado === EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES) {
                <button class="btn-action btn-edit" (click)="finalizarCirugia(cirugia)" title="Completar Observaciones">
                  📝 Observaciones
                </button>
              }

              @if (cirugia.estado === EstadoCirugiaProgramada.FINALIZADA) {
                <button class="btn-action btn-download" (click)="descargarReceta(cirugia)" title="Descargar receta">
                  📄
                </button>
              }

              @if (cirugia.estado !== EstadoCirugiaProgramada.CANCELADA && cirugia.estado !== EstadoCirugiaProgramada.FINALIZADA) {
                <button class="btn-action btn-cancel" (click)="cancelarCirugia(cirugia)" title="Cancelar">
                  ❌
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (mostrarModal()) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>
                @switch (modoModal()) {
                  @case ('crear') { ➕ Nueva Cirugía }
                  @case ('checklist') { 📋 Gestión de Checklist }
                  @case ('agendar') { 📅 Agendar Cirugía }
                  @case ('observaciones') { 📝 Observaciones Finales }
                  @case ('detalle') { 👁️ Detalle de Cirugía }
                  @default { Cirugía }
                }
              </h2>
              <button class="btn-close" (click)="cerrarModal()">✕</button>
            </div>
            
            <div class="modal-body">
              <!-- Formulario para crear cirugía -->
              @if (modoModal() === 'crear') {
                <form [formGroup]="cirugiaForm" (ngSubmit)="crearCirugia()">
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Paciente *</label>
                      <div class="input-with-button">
                        <select formControlName="idPaciente" required>
                          <option value="">
                            @if (cargando()) {
                              Cargando pacientes...
                            } @else if (pacientes().length === 0) {
                              No hay pacientes disponibles
                            } @else {
                              Seleccionar paciente ({{pacientes().length}} disponibles)
                            }
                          </option>
                          @for (paciente of pacientes(); track paciente.id) {
                            <option [value]="paciente.id">
                              {{paciente.nombres}} {{paciente.apellidos}} - {{paciente.numeroDocumento}}
                            </option>
                          }
                        </select>
                        <button type="button" class="btn btn-sm btn-secondary" (click)="abrirModalPaciente()">
                          ➕ Nuevo
                        </button>
                      </div>
                      @if (pacientes().length === 0 && !cargando()) {
                        <small class="text-info">
                          No hay pacientes registrados. Crea uno nuevo usando el botón "Nuevo".
                        </small>
                      }
                    </div>

                    <div class="form-group">
                      <label>Tipo de Cirugía *</label>
                      <select formControlName="idTipoCirugia" required>
                        <option value="">
                          @if (cargando()) {
                            Cargando tipos de cirugía...
                          } @else if (tiposCirugia().length === 0) {
                            No hay tipos de cirugía disponibles
                          } @else {
                            Seleccionar cirugía ({{tiposCirugia().length}} disponibles)
                          }
                        </option>
                        @for (tipo of tiposCirugia(); track tipo.id) {
                          <option [value]="tipo.id">{{tipo.nombre}}</option>
                        }
                      </select>
                      @if (tiposCirugia().length === 0 && !cargando()) {
                        <small class="text-info">
                          No hay tipos de cirugía disponibles. Configúralos desde el módulo de Cirugías.
                        </small>
                      }
                    </div>

                    <div class="form-group">
                      <label>Prioridad *</label>
                      <select formControlName="prioridad" required>
                        <option value="normal">Normal</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Médico Principal *</label>
                      <select formControlName="idMedico" required>
                        <option value="">
                          @if (cargando()) {
                            Cargando médicos...
                          } @else if (medicos().length === 0) {
                            No hay médicos disponibles
                          } @else {
                            Seleccionar médico ({{medicos().length}} disponibles)
                          }
                        </option>
                        @for (medico of medicos(); track medico.uid) {
                          <option [value]="medico.uid">
                            Dr. {{medico.firstName}} {{medico.lastName}}
                            @if (medico.specialty) {
                              - {{medico.specialty}}
                            }
                          </option>
                        }
                      </select>
                      @if (medicos().length === 0 && !cargando()) {
                        <small class="text-info">
                          No hay médicos registrados. Configúralos desde el módulo de Personal.
                        </small>
                      }
                    </div>

                    <div class="form-group full-width">
                      <label>Condiciones Especiales del Paciente</label>
                      <div class="checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" formControlName="problemasCardiovasculares">
                          Problemas cardiovasculares
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" formControlName="anestesiaGeneral">
                          Requiere anestesia general
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" formControlName="diabetico">
                          Diabético
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" formControlName="hipertenso">
                          Hipertenso
                        </label>
                      </div>
                    </div>

                    <div class="form-group full-width">
                      <label>Observaciones</label>
                      <textarea formControlName="observaciones" rows="3" 
                                placeholder="Observaciones adicionales..."></textarea>
                    </div>
                  </div>
                </form>
              }

              <!-- Gestión de checklist -->
              @if (modoModal() === 'checklist' && cirugiaSeleccionada()) {
                <div class="checklist-container">
                  <div class="checklist-header">
                    <h3>Checklist - {{cirugiaSeleccionada()?.nombreCirugia}}</h3>
                    <p>Paciente: {{cirugiaSeleccionada()?.nombrePaciente}} {{cirugiaSeleccionada()?.apellidoPaciente}}</p>
                  </div>

                  <div class="checklist-items">
                    @for (item of cirugiaSeleccionada()?.checklist || []; track item.id; let i = $index) {
                      <div class="checklist-item" [class]="item.estado">
                        <div class="item-header">
                          <h4>{{item.nombre}}</h4>
                          @if (item.esObligatorio) {
                            <span class="obligatorio-badge">Obligatorio</span>
                          }
                          <select [(ngModel)]="item.estado" (change)="actualizarItemChecklist(item)">
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="completado">Completado</option>
                            <option value="no_aplica">No Aplica</option>
                          </select>
                        </div>
                        
                        <p class="item-description">{{item.descripcion}}</p>
                        
                        @if (item.fechaVencimiento) {
                          <p class="fecha-vencimiento">
                            Válido hasta: {{formatearFecha(item.fechaVencimiento)}}
                          </p>
                        }

                        @if (item.estado === 'completado') {
                          <div class="archivo-section">
                            @if (item.archivoUrl) {
                              <div class="archivo-actual">
                                <span>📎 {{item.nombreArchivo}}</span>
                                <a [href]="item.archivoUrl" target="_blank" class="btn-link">Ver archivo</a>
                              </div>
                            } @else {
                              <div class="upload-section">
                                <input type="file" #fileInput (change)="subirArchivo(item, fileInput)" 
                                       accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                                <button type="button" class="btn btn-sm" (click)="fileInput.click()">
                                  📎 Subir archivo
                                </button>
                              </div>
                            }
                          </div>
                        }

                        <div class="observaciones-item">
                          <textarea [(ngModel)]="item.observaciones" 
                                    placeholder="Observaciones del item..."
                                    (blur)="actualizarItemChecklist(item)"></textarea>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="checklist-actions">
                    <button class="btn btn-secondary" (click)="agregarItemPersonalizado()">
                      ➕ Agregar Item Personalizado
                    </button>
                  </div>
                </div>
              }

              <!-- Agendar cirugía -->
              @if (modoModal() === 'agendar' && cirugiaSeleccionada()) {
                <form [formGroup]="agendaForm" (ngSubmit)="confirmarAgenda()">
                  <div class="agenda-form">
                    <h3>Agendar Cirugía: {{cirugiaSeleccionada()?.nombreCirugia}}</h3>
                    
                    <div class="form-grid">
                      <div class="form-group">
                        <label>Fecha *</label>
                        <input type="date" formControlName="fecha" required>
                      </div>

                      <div class="form-group">
                        <label>Hora de Inicio *</label>
                        <input type="time" formControlName="horaInicio" required>
                      </div>

                      <div class="form-group">
                        <label>Duración (minutos) *</label>
                        <input type="number" formControlName="duracion" min="30" max="480" required>
                      </div>

                      <div class="form-group">
                        <label>Quirófano *</label>
                        <select formControlName="quirofano" required>
                          <option value="">Seleccionar quirófano</option>
                          @for (quirofano of quirofanosDisponibles; track quirofano) {
                            <option [value]="quirofano">{{quirofano}}</option>
                          }
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Anestesiólogo *</label>
                        <select formControlName="idAnestesiologo" required>
                          <option value="">Seleccionar anestesiólogo</option>
                          @for (anest of anestesiologos(); track anest.id) {
                            <option [value]="anest.id">
                              {{anest.nombres}} {{anest.apellidos}}
                            </option>
                          }
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Enfermera *</label>
                        <select formControlName="idEnfermera" required>
                          <option value="">Seleccionar enfermera</option>
                          @for (enf of enfermeras(); track enf.id) {
                            <option [value]="enf.id">
                              {{enf.nombres}} {{enf.apellidos}}
                            </option>
                          }
                        </select>
                      </div>

                      <div class="form-group full-width">
                        <label>Observaciones de la Agenda</label>
                        <textarea formControlName="observacionesAgenda" rows="3" 
                                  placeholder="Observaciones adicionales para la agenda..."></textarea>
                      </div>
                    </div>

                    <!-- Verificación de disponibilidad -->
                    @if (verificandoDisponibilidad()) {
                      <div class="verificacion-loading">
                        Verificando disponibilidad...
                      </div>
                    }

                    @if (resultadoDisponibilidad()) {
                      <div class="disponibilidad-resultado" [class]="resultadoDisponibilidad()?.disponible ? 'disponible' : 'no-disponible'">
                        @if (resultadoDisponibilidad()?.disponible) {
                          <p class="success">✅ Horario disponible para programar la cirugía</p>
                        } @else {
                          <p class="error">❌ Conflictos encontrados:</p>
                          <ul>
                            @for (conflicto of resultadoDisponibilidad()?.conflictos || []; track conflicto) {
                              <li>{{conflicto}}</li>
                            }
                          </ul>
                        }
                      </div>
                    }
                  </div>
                </form>
              }

              <!-- Observaciones finales -->
              @if (modoModal() === 'observaciones' && cirugiaSeleccionada()) {
                <form [formGroup]="observacionesForm" (ngSubmit)="guardarObservaciones()">
                  <div class="observaciones-form">
                    <h3>Observaciones Finales - {{cirugiaSeleccionada()?.nombreCirugia}}</h3>
                    
                    <div class="form-section">
                      <h4>Complicaciones</h4>
                      <div class="form-group">
                        <label>Tipo de Complicaciones *</label>
                        <select formControlName="complicaciones" required>
                          <option value="ninguna">Ninguna</option>
                          <option value="leve">Leve</option>
                          <option value="moderada">Moderada</option>
                          <option value="grave">Grave</option>
                        </select>
                      </div>

                      @if (observacionesForm.get('complicaciones')?.value !== 'ninguna') {
                        <div class="form-group">
                          <label>Detalle de Complicaciones *</label>
                          <textarea formControlName="detalleComplicaciones" rows="3" required
                                    placeholder="Describa las complicaciones encontradas..."></textarea>
                        </div>
                      }
                    </div>

                    <div class="form-section">
                      <h4>Seguimiento</h4>
                      <div class="form-group">
                        <label>Citas Postoperatorias Mínimas *</label>
                        <input type="number" formControlName="citasPostoperatorias" min="1" max="10" required>
                      </div>

                      <div class="form-group">
                        <label>Observaciones Finales *</label>
                        <textarea formControlName="observacionesFinales" rows="4" required
                                  placeholder="Observaciones sobre el procedimiento, recuperación, etc..."></textarea>
                      </div>

                      <div class="form-group">
                        <label>Recomendaciones</label>
                        <textarea formControlName="recomendaciones" rows="3"
                                  placeholder="Recomendaciones adicionales para el paciente..."></textarea>
                      </div>
                    </div>

                    <div class="form-section">
                      <h4>Medicación Prescrita</h4>
                      <div formArrayName="medicacion">
                        @for (medicamento of getMedicacion().controls; track $index; let i = $index) {
                          <div [formGroupName]="i" class="medicamento-item">
                            <div class="medicamento-grid">
                              <div class="form-group">
                                <label>Medicamento</label>
                                <select formControlName="medicamento">
                                  <option value="">Seleccionar o escribir</option>
                                  @for (med of medicamentosComunes; track med) {
                                    <option [value]="med">{{med}}</option>
                                  }
                                </select>
                              </div>

                              <div class="form-group">
                                <label>Dosis</label>
                                <input type="text" formControlName="dosis" placeholder="Ej: 1 tableta">
                              </div>

                              <div class="form-group">
                                <label>Frecuencia</label>
                                <select formControlName="frecuencia">
                                  @for (freq of frecuenciasMedicacion; track freq) {
                                    <option [value]="freq">{{freq}}</option>
                                  }
                                </select>
                              </div>

                              <div class="form-group">
                                <label>Duración (días)</label>
                                <input type="number" formControlName="duracionDias" min="1" max="30">
                              </div>

                              <div class="form-group">
                                <label>Vía</label>
                                <select formControlName="viaAdministracion">
                                  @for (via of viasAdministracion; track via) {
                                    <option [value]="via">{{via}}</option>
                                  }
                                </select>
                              </div>

                              <div class="form-group full-width">
                                <label>Indicaciones</label>
                                <input type="text" formControlName="indicaciones" 
                                       placeholder="Indicaciones especiales...">
                              </div>

                              <button type="button" class="btn-remove" (click)="eliminarMedicamento(i)">
                                🗑️
                              </button>
                            </div>
                          </div>
                        }
                      </div>

                      <button type="button" class="btn btn-secondary" (click)="agregarMedicamento()">
                        ➕ Agregar Medicamento
                      </button>
                    </div>
                  </div>
                </form>
              }

              <!-- Detalle de cirugía -->
              @if (modoModal() === 'detalle' && cirugiaSeleccionada()) {
                <div class="cirugia-detalle">
                  <div class="detalle-header">
                    <h3>{{cirugiaSeleccionada()?.nombreCirugia}}</h3>
                    <span class="estado-badge" [class]="cirugiaSeleccionada()?.estado">
                      {{getEstadoLabel(cirugiaSeleccionada()?.estado!)}}
                    </span>
                  </div>

                  <div class="detalle-sections">
                    <div class="detalle-section">
                      <h4>Información del Paciente</h4>
                      <p><strong>Nombre:</strong> {{cirugiaSeleccionada()?.nombrePaciente}} {{cirugiaSeleccionada()?.apellidoPaciente}}</p>
                      <p><strong>Documento:</strong> {{cirugiaSeleccionada()?.documentoPaciente}}</p>
                    </div>

                    <div class="detalle-section">
                      <h4>Información de la Cirugía</h4>
                      <p><strong>Tipo:</strong> {{cirugiaSeleccionada()?.nombreCirugia}}</p>
                      <p><strong>Prioridad:</strong> {{getPrioridadLabel(cirugiaSeleccionada()?.prioridad!)}}</p>
                      <p><strong>Costo Estimado:</strong> {{formatearMoneda(cirugiaSeleccionada()?.costoEstimado!)}}</p>
                      @if (cirugiaSeleccionada()?.costoReal) {
                        <p><strong>Costo Real:</strong> {{formatearMoneda(cirugiaSeleccionada()?.costoReal!)}}</p>
                      }
                    </div>

                    @if (cirugiaSeleccionada()?.agenda) {
                      <div class="detalle-section">
                        <h4>Información de Agenda</h4>
                        <p><strong>Fecha:</strong> {{formatearFecha(cirugiaSeleccionada()?.agenda?.fechaInicio!)}}</p>
                        <p><strong>Horario:</strong> {{cirugiaSeleccionada()?.agenda?.horaInicio}} - {{cirugiaSeleccionada()?.agenda?.horaFin}}</p>
                        <p><strong>Quirófano:</strong> {{cirugiaSeleccionada()?.agenda?.quirofano}}</p>
                        <p><strong>Duración Estimada:</strong> {{cirugiaSeleccionada()?.agenda?.duracionEstimadaMinutos}} minutos</p>
                      </div>
                    }

                    @if (cirugiaSeleccionada()?.tiempos) {
                      <div class="detalle-section">
                        <h4>Tiempos Reales</h4>
                        @if (cirugiaSeleccionada()?.tiempos?.inicioReal) {
                          <p><strong>Inicio:</strong> {{formatearFechaHora(cirugiaSeleccionada()?.tiempos?.inicioReal!)}}</p>
                        }
                        @if (cirugiaSeleccionada()?.tiempos?.finReal) {
                          <p><strong>Fin:</strong> {{formatearFechaHora(cirugiaSeleccionada()?.tiempos?.finReal!)}}</p>
                          <p><strong>Duración Real:</strong> {{cirugiaSeleccionada()?.tiempos?.duracionRealMinutos}} minutos</p>
                        }
                      </div>
                    }

                    @if (cirugiaSeleccionada()?.observaciones) {
                      <div class="detalle-section">
                        <h4>Observaciones Finales</h4>
                        <p><strong>Complicaciones:</strong> {{getTipoComplicacionLabel(cirugiaSeleccionada()?.observaciones?.complicaciones!)}}</p>
                        @if (cirugiaSeleccionada()?.observaciones?.detalleComplicaciones) {
                          <p><strong>Detalle:</strong> {{cirugiaSeleccionada()?.observaciones?.detalleComplicaciones}}</p>
                        }
                        <p><strong>Citas Postoperatorias:</strong> {{cirugiaSeleccionada()?.observaciones?.citasPostoperatorias}}</p>
                        <p><strong>Observaciones:</strong> {{cirugiaSeleccionada()?.observaciones?.observacionesFinales}}</p>
                        
                        @if (cirugiaSeleccionada()?.observaciones?.medicacionPrescrita && (cirugiaSeleccionada()?.observaciones?.medicacionPrescrita?.length || 0) > 0) {
                          <div class="medicacion-prescrita">
                            <h5>Medicación Prescrita</h5>
                            @for (med of cirugiaSeleccionada()?.observaciones?.medicacionPrescrita; track med?.medicamento || $index) {
                              <div class="medicamento-detalle">
                                <p><strong>{{med?.medicamento}}</strong> - {{med?.dosis}}</p>
                                <p>{{med?.frecuencia}} por {{med?.duracionDias}} días ({{med?.viaAdministracion}})</p>
                                @if (med?.indicaciones) {
                                  <p class="indicaciones">{{med.indicaciones}}</p>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }

                    <div class="detalle-section">
                      <h4>Historial de Cambios</h4>
                      @for (cambio of cirugiaSeleccionada()?.historialCambios || []; track $index) {
                        <div class="historial-item">
                          <p><strong>{{formatearFechaHora(cambio.fecha)}}:</strong> 
                             {{getEstadoLabel(cambio.estadoAnterior)}} → {{getEstadoLabel(cambio.estadoNuevo)}}</p>
                          @if (cambio.motivo) {
                            <p class="motivo">{{cambio.motivo}}</p>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
            
            <div class="modal-footer">
              @switch (modoModal()) {
                @case ('crear') {
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                  <button type="submit" class="btn btn-primary" (click)="crearCirugia()" 
                          [disabled]="cirugiaForm.invalid">
                    Crear Cirugía
                  </button>
                }
                @case ('checklist') {
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cerrar</button>
                  <button type="button" class="btn btn-primary" (click)="guardarChecklist()">
                    Guardar Checklist
                  </button>
                }
                @case ('agendar') {
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                  <button type="button" class="btn btn-info" (click)="verificarDisponibilidad()">
                    Verificar Disponibilidad
                  </button>
                  <button type="submit" class="btn btn-primary" (click)="confirmarAgenda()" 
                          [disabled]="agendaForm.invalid || !resultadoDisponibilidad()?.disponible">
                    Confirmar Agenda
                  </button>
                }
                @case ('observaciones') {
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                  <button type="submit" class="btn btn-primary" (click)="guardarObservaciones()" 
                          [disabled]="observacionesForm.invalid">
                    Finalizar Cirugía
                  </button>
                }
                @default {
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cerrar</button>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Modal Crear Paciente -->
    @if (mostrarModalPaciente()) {
      <div class="modal-overlay" (click)="cerrarModalPaciente()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>➕ Crear Nuevo Paciente</h2>
            <button class="modal-close" (click)="cerrarModalPaciente()">✕</button>
          </div>
          
          <div class="modal-body">
            <form [formGroup]="pacienteForm" (ngSubmit)="crearPaciente()">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombres *</label>
                  <input formControlName="nombres" type="text" required>
                </div>

                <div class="form-group">
                  <label>Apellidos *</label>
                  <input formControlName="apellidos" type="text" required>
                </div>

                <div class="form-group">
                  <label>Tipo de Documento *</label>
                  <select formControlName="tipoDocumento" required>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                    <option value="RC">Registro Civil</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Número de Documento *</label>
                  <input formControlName="numeroDocumento" type="text" required>
                </div>

                <div class="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input formControlName="fechaNacimiento" type="date" required>
                </div>

                <div class="form-group">
                  <label>Género *</label>
                  <select formControlName="genero" required>
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Teléfono *</label>
                  <input formControlName="telefono" type="tel" required>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input formControlName="email" type="email">
                </div>

                <div class="form-group full-width">
                  <label>Dirección</label>
                  <input formControlName="direccion" type="text">
                </div>

                <div class="form-group">
                  <label>EPS</label>
                  <input formControlName="eps" type="text" placeholder="Entidad Promotora de Salud">
                </div>

                <div class="form-group">
                  <label>Contacto de Emergencia</label>
                  <input formControlName="contactoEmergencia" type="text">
                </div>

                <div class="form-group">
                  <label>Teléfono de Emergencia</label>
                  <input formControlName="telefonoEmergencia" type="tel">
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarModalPaciente()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" 
                    [disabled]="!pacienteForm.valid || cargando()"
                    (click)="crearPaciente()">
              @if (cargando()) {
                <span class="spinner"></span>
                Creando...
              } @else {
                Crear Paciente
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Estilos base */
    .programacion-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .programacion-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
    }

    .programacion-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: bold;
    }

    .programacion-header p {
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filtros-rapidos {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .select-filtro {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 500;
    }

    .select-filtro option {
      background: #2d3748;
      color: white;
    }

    /* Estadísticas */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }

    .stat-card.pendiente { border-left-color: #f59e0b; }
    .stat-card.aprobada { border-left-color: #10b981; }
    .stat-card.agendada { border-left-color: #3b82f6; }
    .stat-card.proceso { border-left-color: #8b5cf6; }
    .stat-card.observaciones { border-left-color: #f97316; }
    .stat-card.finalizada { border-left-color: #06b6d4; }

    .stat-card h3 {
      font-size: 2rem;
      font-weight: bold;
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .stat-card p {
      margin: 0;
      color: #6b7280;
      font-weight: 500;
    }

    /* Grid de cirugías */
    .cirugias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .cirugia-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .cirugia-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    /* Estados de cirugías */
    .cirugia-card.pendiente_aprobacion { border-left-color: #f59e0b; }
    .cirugia-card.aprobada { border-left-color: #10b981; }
    .cirugia-card.agendada { border-left-color: #3b82f6; }
    .cirugia-card.en_proceso { border-left-color: #8b5cf6; }
    .cirugia-card.pendiente_observaciones { border-left-color: #f97316; }
    .cirugia-card.finalizada { border-left-color: #06b6d4; }
    .cirugia-card.cancelada { border-left-color: #ef4444; }

    .cirugia-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .cirugia-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-weight: bold;
    }

    .cirugia-info .paciente {
      margin: 0 0 0.25rem 0;
      font-weight: 500;
      color: #374151;
    }

    .cirugia-info .documento {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .cirugia-badges {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
    }

    /* Badges */
    .estado-badge, .prioridad-badge, .personal-badge, .obligatorio-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.pendiente_aprobacion { background: #fef3c7; color: #92400e; }
    .estado-badge.aprobada { background: #d1fae5; color: #065f46; }
    .estado-badge.agendada { background: #dbeafe; color: #1e40af; }
    .estado-badge.en_proceso { background: #e0e7ff; color: #5b21b6; }
    .estado-badge.pendiente_observaciones { background: #fed7aa; color: #9a3412; }
    .estado-badge.finalizada { background: #cffafe; color: #155e63; }
    .estado-badge.cancelada { background: #fecaca; color: #991b1b; }

    .prioridad-badge.baja { background: #f3f4f6; color: #374151; }
    .prioridad-badge.normal { background: #dbeafe; color: #1e40af; }
    .prioridad-badge.alta { background: #fed7aa; color: #9a3412; }
    .prioridad-badge.urgente { background: #fecaca; color: #991b1b; }

    .personal-badge.medico { background: #e0f2fe; color: #0277bd; }
    .personal-badge.anestesiologo { background: #f3e5f5; color: #7b1fa2; }
    .personal-badge.enfermera { background: #e8f5e8; color: #2e7d32; }

    .obligatorio-badge { background: #fecaca; color: #991b1b; }

    /* Detalles de cirugía */
    .cirugia-details {
      margin: 1rem 0;
      font-size: 0.9rem;
    }

    .agenda-info, .personal-asignado {
      margin-bottom: 1rem;
    }

    .agenda-info p, .personal-asignado p {
      margin: 0.25rem 0;
      color: #374151;
    }

    .personal-asignado {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    /* Progress bar */
    .checklist-progress {
      margin-top: 1rem;
    }

    .progress-bar {
      background: #e5e7eb;
      border-radius: 1rem;
      height: 8px;
      overflow: hidden;
      margin: 0.5rem 0;
    }

    .progress-fill {
      background: linear-gradient(90deg, #10b981, #059669);
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: #6b7280;
    }

    /* Acciones */
    .cirugia-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 0.5rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s;
      background: #f3f4f6;
    }

    .btn-action:hover { transform: scale(1.1); }

    .btn-view { background: #e0f2fe; }
    .btn-edit { background: #fff3cd; }
    .btn-approve { background: #d1fae5; }
    .btn-calendar { background: #dbeafe; }
    .btn-start { background: #e0e7ff; }
    .btn-finish { background: #fed7aa; }
    .btn-cancel { background: #fecaca; }
    .btn-download { background: #cffafe; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.5rem;
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem 2rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    /* Formularios */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .input-with-button {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .input-with-button select {
      flex: 1;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
    }

    .text-info {
      color: #0891b2;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    /* Checklist */
    .checklist-container {
      max-height: 500px;
      overflow-y: auto;
    }

    .checklist-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .checklist-header h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .checklist-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .checklist-item.completado {
      background: #f0fdf4;
      border-color: #22c55e;
    }

    .checklist-item.en_proceso {
      background: #fffbeb;
      border-color: #f59e0b;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .item-header h4 {
      margin: 0;
      color: #1f2937;
    }

    .item-description {
      margin: 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .fecha-vencimiento {
      font-size: 0.8rem;
      color: #dc2626;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .archivo-section {
      margin: 1rem 0;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
    }

    .archivo-actual {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .upload-section {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .upload-section input[type="file"] {
      display: none;
    }

    .observaciones-item textarea {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      resize: vertical;
    }

    /* Medicación */
    .medicamento-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      position: relative;
    }

    .medicamento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .btn-remove {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #fecaca;
      color: #991b1b;
      border: none;
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      font-size: 0.8rem;
    }

    /* Disponibilidad */
    .verificacion-loading {
      text-align: center;
      padding: 1rem;
      color: #6b7280;
      font-style: italic;
    }

    .disponibilidad-resultado {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    .disponibilidad-resultado.disponible {
      background: #f0fdf4;
      border: 1px solid #22c55e;
    }

    .disponibilidad-resultado.no-disponible {
      background: #fef2f2;
      border: 1px solid #ef4444;
    }

    .disponibilidad-resultado .success {
      color: #15803d;
      margin: 0;
    }

    .disponibilidad-resultado .error {
      color: #dc2626;
      margin: 0 0 0.5rem 0;
    }

    .disponibilidad-resultado ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #dc2626;
    }

    /* Detalle de cirugía */
    .cirugia-detalle {
      max-height: 600px;
      overflow-y: auto;
    }

    .detalle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .detalle-header h3 {
      margin: 0;
      color: #1f2937;
    }

    .detalle-sections {
      display: grid;
      gap: 1.5rem;
    }

    .detalle-section {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #3b82f6;
    }

    .detalle-section h4, .detalle-section h5 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }

    .detalle-section p {
      margin: 0.5rem 0;
      color: #374151;
    }

    .medicacion-prescrita {
      margin-top: 1rem;
    }

    .medicamento-detalle {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      border-left: 3px solid #10b981;
    }

    .medicamento-detalle p {
      margin: 0.25rem 0;
    }

    .indicaciones {
      font-style: italic;
      color: #6b7280;
    }

    .historial-item {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      border-left: 3px solid #6b7280;
    }

    .historial-item p {
      margin: 0.25rem 0;
    }

    .motivo {
      color: #6b7280;
      font-style: italic;
    }

    /* Botones */
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-info {
      background: #06b6d4;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #0891b2;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    .btn-link {
      background: none;
      color: #3b82f6;
      padding: 0.25rem;
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .programacion-container {
        padding: 1rem;
      }

      .programacion-header {
        padding: 1.5rem;
      }

      .programacion-header h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .cirugias-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
        max-width: calc(100vw - 2rem);
      }

      .modal-body {
        padding: 1rem;
      }

      .medicamento-grid {
        grid-template-columns: 1fr;
      }

      .cirugia-actions {
        justify-content: center;
      }
    }
  `]
})
export class ProgramacionCirugiaComponent implements OnInit {
  // Datos reactivos
  cirugias = signal<CirugiaProgramada[]>([]);
  pacientes = signal<Paciente[]>([]);
  tiposCirugia = signal<TipoCirugia[]>([]);
  personal = signal<Personal[]>([]);
  medicos = signal<UserRole[]>([]);
  anestesiologos = signal<Personal[]>([]);
  enfermeras = signal<Personal[]>([]);

  // Estado del componente
  mostrarModal = signal(false);
  modoModal = signal<'crear' | 'checklist' | 'agendar' | 'observaciones' | 'detalle'>('crear');
  cirugiaSeleccionada = signal<CirugiaProgramada | null>(null);
  cargando = signal(false);
  verificandoDisponibilidad = signal(false);
  resultadoDisponibilidad = signal<{ disponible: boolean; conflictos: string[] } | null>(null);

  // Filtros
  filtroEstado = '';
  cirugiasFiltradas = signal<CirugiaProgramada[]>([]);

  // Formularios
  cirugiaForm!: FormGroup;
  agendaForm!: FormGroup;
  observacionesForm!: FormGroup;
  pacienteForm!: FormGroup;

  // Estado para modal de paciente
  mostrarModalPaciente = signal(false);

  // Constantes
  quirofanosDisponibles = QUIROFANOS_DISPONIBLES;
  medicamentosComunes = MEDICAMENTOS_COMUNES;
  viasAdministracion = VIAS_ADMINISTRACION;
  frecuenciasMedicacion = FRECUENCIAS_MEDICACION;
  EstadoCirugiaProgramada = EstadoCirugiaProgramada;

  // Estadísticas
  estadisticas = signal({
    total: 0,
    porEstado: {
      pendienteAprobacion: 0,
      aprobadas: 0,
      agendadas: 0,
      enProceso: 0,
      pendienteObservaciones: 0,
      finalizadas: 0,
      canceladas: 0
    }
  });

  constructor(
    private programacionService: ProgramacionCirugiaService,
    private pacienteService: PacienteService,
    private cirugiaService: CirugiaService,
    private personalService: PersonalService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.inicializarFormularios();
  }

  async ngOnInit() {
    this.inicializarFormularios();
    await this.cargarDatos();
  }

  private inicializarFormularios() {
    this.cirugiaForm = this.fb.group({
      idPaciente: ['', Validators.required],
      idTipoCirugia: ['', Validators.required],
      idMedico: ['', Validators.required],
      prioridad: ['normal', Validators.required],
      problemasCardiovasculares: [false],
      anestesiaGeneral: [false],
      diabetico: [false],
      hipertenso: [false],
      observaciones: ['']
    });

    this.agendaForm = this.fb.group({
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      duracion: [120, [Validators.required, Validators.min(30), Validators.max(480)]],
      quirofano: ['', Validators.required],
      idAnestesiologo: ['', Validators.required],
      idEnfermera: ['', Validators.required],
      observacionesAgenda: ['']
    });

    this.observacionesForm = this.fb.group({
      complicaciones: ['ninguna', Validators.required],
      detalleComplicaciones: [''],
      citasPostoperatorias: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      observacionesFinales: ['', Validators.required],
      recomendaciones: [''],
      medicacion: this.fb.array([])
    });

    this.pacienteForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      tipoDocumento: ['CC', Validators.required],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.email]],
      direccion: [''],
      eps: [''],
      contactoEmergencia: [''],
      telefonoEmergencia: ['']
    });

    // Validación condicional para complicaciones
    this.observacionesForm.get('complicaciones')?.valueChanges.subscribe(value => {
      const detalleControl = this.observacionesForm.get('detalleComplicaciones');
      if (value !== 'ninguna') {
        detalleControl?.setValidators([Validators.required]);
      } else {
        detalleControl?.clearValidators();
      }
      detalleControl?.updateValueAndValidity();
    });
  }

  private async cargarDatos() {
    this.cargando.set(true);
    try {
      console.log('Cargando datos...');
      
      // Cargar datos de forma individual para mejor debugging
      console.log('Cargando cirugías programadas...');
      const cirugias = await firstValueFrom(this.programacionService.obtenerCirugiasProgramadas());
      console.log('Cirugías cargadas:', cirugias?.length || 0);
      
      console.log('Cargando pacientes...');
      const pacientes = await firstValueFrom(this.pacienteService.obtenerPacientes());
      console.log('Pacientes cargados:', pacientes?.length || 0, pacientes);
      
      console.log('Cargando tipos de cirugía...');
      const tipos = await firstValueFrom(this.cirugiaService.obtenerTiposCirugia());
      console.log('Tipos de cirugía cargados:', tipos?.length || 0, tipos);
      
      console.log('Cargando personal médico...');
      const personal = await firstValueFrom(this.personalService.obtenerPersonal());
      console.log('Personal cargado:', personal?.length || 0);
      
      console.log('Cargando médicos del sistema de usuarios...');
      const medicos = await this.authService.getMedicos();
      console.log('Médicos cargados:', medicos?.length || 0, medicos);

      console.log('Datos finales cargados:', {
        cirugias: cirugias?.length || 0,
        pacientes: pacientes?.length || 0,
        tipos: tipos?.length || 0,
        personal: personal?.length || 0,
        medicos: medicos?.length || 0
      });

      this.cirugias.set(cirugias || []);
      this.pacientes.set(pacientes || []);
      this.tiposCirugia.set(tipos || []);
      this.personal.set(personal || []);
      
      // Filtrar personal por tipo y cargar médicos del sistema de usuarios
      this.medicos.set(medicos || []);
      this.anestesiologos.set((personal || []).filter((p: Personal) => p.tipoPersonal === 'anestesiologo'));
      this.enfermeras.set((personal || []).filter((p: Personal) => p.tipoPersonal === 'enfermera'));

      this.aplicarFiltros();
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  aplicarFiltros() {
    const cirugias = this.cirugias();
    let filtradas = cirugias;

    if (this.filtroEstado) {
      filtradas = filtradas.filter(c => c.estado === this.filtroEstado);
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtradas.sort((a, b) => {
      const fechaA = (a.fechaCreacion as any)?.toDate?.() || new Date(a.fechaCreacion as any);
      const fechaB = (b.fechaCreacion as any)?.toDate?.() || new Date(b.fechaCreacion as any);
      return fechaB.getTime() - fechaA.getTime();
    });

    this.cirugiasFiltradas.set(filtradas);
  }

  private calcularEstadisticas() {
    const cirugias = this.cirugias();
    const stats = {
      total: cirugias.length,
      porEstado: {
        pendienteAprobacion: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.PENDIENTE_APROBACION).length,
        aprobadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.APROBADA).length,
        agendadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.AGENDADA).length,
        enProceso: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.EN_PROCESO).length,
        pendienteObservaciones: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES).length,
        finalizadas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.FINALIZADA).length,
        canceladas: cirugias.filter(c => c.estado === EstadoCirugiaProgramada.CANCELADA).length
      }
    };
    this.estadisticas.set(stats);
  }

  // Modal management
  abrirModal(modo: 'crear' | 'checklist' | 'agendar' | 'observaciones' | 'detalle', cirugia?: CirugiaProgramada) {
    this.modoModal.set(modo);
    this.mostrarModal.set(true);
    
    if (cirugia) {
      this.cirugiaSeleccionada.set(cirugia);
      
      if (modo === 'agendar') {
        this.prepararFormularioAgenda(cirugia);
      } else if (modo === 'observaciones') {
        this.prepararFormularioObservaciones();
      }
    } else {
      this.cirugiaSeleccionada.set(null);
      this.cirugiaForm.reset();
    }
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.modoModal.set('crear');
    this.cirugiaSeleccionada.set(null);
    this.resultadoDisponibilidad.set(null);
    this.verificandoDisponibilidad.set(false);
  }

  // Modal de pacientes
  abrirModalPaciente() {
    this.mostrarModalPaciente.set(true);
    this.pacienteForm.reset({
      tipoDocumento: 'CC',
      genero: ''
    });
  }

  cerrarModalPaciente() {
    this.mostrarModalPaciente.set(false);
    this.pacienteForm.reset();
  }

  async crearPaciente() {
    if (this.pacienteForm.invalid) return;

    this.cargando.set(true);
    try {
      const pacienteData = {
        ...this.pacienteForm.value,
        fechaNacimiento: new Date(this.pacienteForm.value.fechaNacimiento),
        fechaRegistro: new Date(),
        activo: true
      };

      const pacienteId = await this.pacienteService.crearPaciente(pacienteData);
      
      // Recargar lista de pacientes
      const pacientes = await this.pacienteService.obtenerPacientes().toPromise();
      this.pacientes.set(pacientes || []);
      
      // Seleccionar el paciente recién creado en el formulario de cirugía
      this.cirugiaForm.patchValue({ idPaciente: pacienteId });
      
      this.cerrarModalPaciente();
      
      // Mostrar mensaje de éxito (puedes implementar un servicio de notificaciones)
      console.log('Paciente creado exitosamente');
      
    } catch (error) {
      console.error('Error al crear paciente:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // CRUD Operations
  async crearCirugia() {
    if (this.cirugiaForm.invalid) return;

    this.cargando.set(true);
    try {
      const formData = this.cirugiaForm.value;
      const paciente = this.pacientes().find(p => p.id === formData.idPaciente);
      const tipoCirugia = this.tiposCirugia().find(t => t.id === formData.idTipoCirugia);
      const medico = this.medicos().find(m => m.uid === formData.idMedico);

      if (!paciente || !tipoCirugia || !medico) {
        throw new Error('Datos incompletos');
      }

      const nuevaCirugia: Omit<CirugiaProgramada, 'id'> = {
        idPaciente: formData.idPaciente,
        nombrePaciente: paciente.nombres,
        apellidoPaciente: paciente.apellidos,
        documentoPaciente: paciente.numeroDocumento,
        idTipoCirugia: formData.idTipoCirugia,
        nombreCirugia: tipoCirugia.nombre,
        descripcionCirugia: tipoCirugia.descripcion,
        estado: EstadoCirugiaProgramada.PENDIENTE_APROBACION,
        prioridad: formData.prioridad as PrioridadCirugia,
        costoEstimado: tipoCirugia.costoBase || 0,
        moneda: 'COP',
        personalAsignado: [{
          idPersonal: medico.uid,
          tipoPersonal: 'medico',
          nombre: medico.firstName,
          apellido: medico.lastName,
          rol: 'principal'
        }],
        checklist: [],
        historialCambios: [],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: 'current-user', // TODO: obtener usuario actual
        modificadoPor: 'current-user'
      };

      // Generar checklist basado en condiciones del paciente
      const checklist = this.generarChecklistBasico({
        problemasCardiovasculares: formData.problemasCardiovasculares,
        anestesiaGeneral: formData.anestesiaGeneral,
        diabetico: formData.diabetico,
        hipertenso: formData.hipertenso
      });

      nuevaCirugia.checklist = checklist;

      const id = await this.programacionService.crearCirugiaProgramada(nuevaCirugia);
      
      // Recargar datos
      await this.cargarDatos();
      this.cerrarModal();
      
      console.log('Cirugía creada con ID:', id);
    } catch (error) {
      console.error('Error al crear cirugía:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async aprobarCirugia(cirugia: CirugiaProgramada) {
    if (!confirm('¿Está seguro de aprobar esta cirugía?')) return;

    try {
      await this.programacionService.aprobarCirugia(cirugia.id!, 'Aprobada por el sistema');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al aprobar cirugía:', error);
    }
  }

  async cancelarCirugia(cirugia: CirugiaProgramada) {
    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (!motivo) return;

    try {
      await this.programacionService.cancelarCirugia(cirugia.id!, 'current-user', motivo);
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al cancelar cirugía:', error);
    }
  }

  // Agenda management
  agendarCirugia(cirugia: CirugiaProgramada) {
    this.abrirModal('agendar', cirugia);
  }

  reprogramarCirugia(cirugia: CirugiaProgramada) {
    this.abrirModal('agendar', cirugia);
    if (cirugia.agenda) {
      const fecha = (cirugia.agenda.fechaInicio as any)?.toDate?.() || new Date(cirugia.agenda.fechaInicio as any);
      this.agendaForm.patchValue({
        fecha: fecha.toISOString().split('T')[0],
        horaInicio: cirugia.agenda.horaInicio,
        duracion: cirugia.agenda.duracionEstimadaMinutos,
        quirofano: cirugia.agenda.quirofano,
        idAnestesiologo: cirugia.personalAsignado.find(p => p.tipoPersonal === 'anestesiologo')?.idPersonal,
        idEnfermera: cirugia.personalAsignado.find(p => p.tipoPersonal === 'enfermera')?.idPersonal,
        observacionesAgenda: cirugia.agenda.observacionesAgenda
      });
    }
  }

  private prepararFormularioAgenda(cirugia: CirugiaProgramada) {
    // Sugerir fecha y hora por defecto (mañana a las 8:00 AM)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    
    this.agendaForm.patchValue({
      fecha: mañana.toISOString().split('T')[0],
      horaInicio: '08:00',
      duracion: 120 // 2 horas por defecto
    });
  }

  async verificarDisponibilidad() {
    if (this.agendaForm.invalid) return;

    const formData = this.agendaForm.value;
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia) return;

    this.verificandoDisponibilidad.set(true);
    this.resultadoDisponibilidad.set(null);

    try {
      const fechaInicio = new Date(`${formData.fecha}T${formData.horaInicio}`);
      const fechaFin = new Date(fechaInicio.getTime() + (formData.duracion * 60000));

      const agenda: AgendaCirugia = {
        fechaInicio,
        fechaFin,
        horaInicio: formData.horaInicio,
        horaFin: fechaFin.toTimeString().slice(0, 5),
        quirofano: formData.quirofano,
        duracionEstimadaMinutos: formData.duracion,
        observacionesAgenda: formData.observacionesAgenda
      };

      const personalIds = [formData.idAnestesiologo, formData.idEnfermera].filter(Boolean);
      const personalRequerido = personalIds.map((id: string) => 
        cirugia.personalAsignado.find(p => p.idPersonal === id)
      ).filter(Boolean) as PersonalAsignado[];

      const result = await this.programacionService.verificarDisponibilidad(
        fechaInicio,
        fechaFin,
        formData.quirofano,
        personalRequerido
      );

      // Convertir resultado del servicio al formato esperado
      const disponible = result.quirofanoDisponible && result.personalNoDisponible.length === 0;
      const conflictos: string[] = [];
      
      if (!result.quirofanoDisponible) {
        conflictos.push(`Quirófano ${formData.quirofano} no disponible en el horario seleccionado`);
      }
      
      result.personalNoDisponible.forEach(personal => {
        conflictos.push(`${personal.nombre} no disponible en el horario seleccionado`);
      });

      this.resultadoDisponibilidad.set({ disponible, conflictos });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      this.resultadoDisponibilidad.set({
        disponible: false,
        conflictos: ['Error al verificar disponibilidad. Intente nuevamente.']
      });
    } finally {
      this.verificandoDisponibilidad.set(false);
    }
  }

  async confirmarAgenda() {
    if (this.agendaForm.invalid || !this.resultadoDisponibilidad()?.disponible) return;

    const formData = this.agendaForm.value;
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia) return;

    this.cargando.set(true);
    try {
      const fechaInicio = new Date(`${formData.fecha}T${formData.horaInicio}`);
      const fechaFin = new Date(fechaInicio.getTime() + (formData.duracion * 60000));

      const agenda: AgendaCirugia = {
        fechaInicio,
        fechaFin,
        horaInicio: formData.horaInicio,
        horaFin: fechaFin.toTimeString().slice(0, 5),
        quirofano: formData.quirofano,
        duracionEstimadaMinutos: formData.duracion
      };

      // Agregar personal adicional
      const personalAdicional: PersonalAsignado[] = [];
      
      const anestesiologo = this.anestesiologos().find(a => a.id === formData.idAnestesiologo);
      if (anestesiologo) {
        personalAdicional.push({
          idPersonal: anestesiologo.id!,
          tipoPersonal: 'anestesiologo',
          nombre: anestesiologo.nombres,
          apellido: anestesiologo.apellidos,
          rol: 'principal'
        });
      }

      const enfermera = this.enfermeras().find(e => e.id === formData.idEnfermera);
      if (enfermera) {
        personalAdicional.push({
          idPersonal: enfermera.id!,
          tipoPersonal: 'enfermera',
          nombre: enfermera.nombres,
          apellido: enfermera.apellidos,
          rol: 'principal'
        });
      }

      await this.programacionService.agendarCirugia(cirugia.id!, agenda, 'current-user');
      await this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al agendar cirugía:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Workflow operations
  async iniciarCirugia(cirugia: CirugiaProgramada) {
    if (!confirm('¿Confirma el inicio de la cirugía?')) return;

    try {
      await this.programacionService.iniciarCirugia(cirugia.id!, 'current-user');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al iniciar cirugía:', error);
    }
  }

  finalizarCirugia(cirugia: CirugiaProgramada) {
    // Si la cirugía está en proceso, el administrador la marca como pendiente observaciones
    if (cirugia.estado === EstadoCirugiaProgramada.EN_PROCESO) {
      this.finalizarProcedimiento(cirugia);
    } 
    // Si está pendiente observaciones, el médico completa las observaciones
    else if (cirugia.estado === EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES) {
      this.abrirModal('observaciones', cirugia);
    }
  }

  async finalizarProcedimiento(cirugia: CirugiaProgramada) {
    if (!confirm('¿Confirma que la cirugía ha finalizado? Se cambiará a "Pendiente Observaciones" para que el médico complete los datos.')) return;

    this.cargando.set(true);
    try {
      await this.programacionService.finalizarCirugia(cirugia.id!, 'current-user');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al finalizar procedimiento:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  private prepararFormularioObservaciones() {
    this.observacionesForm.reset({
      complicaciones: 'ninguna',
      citasPostoperatorias: 1
    });
    
    // Limpiar array de medicación
    const medicacionArray = this.getMedicacion();
    while (medicacionArray.length > 0) {
      medicacionArray.removeAt(0);
    }
  }

  getMedicacion(): FormArray {
    return this.observacionesForm.get('medicacion') as FormArray;
  }

  agregarMedicamento() {
    const medicamento = this.fb.group({
      medicamento: ['', Validators.required],
      dosis: ['', Validators.required],
      frecuencia: ['Cada 8 horas', Validators.required],
      duracionDias: [7, [Validators.required, Validators.min(1)]],
      viaAdministracion: ['Oral', Validators.required],
      indicaciones: ['']
    });

    this.getMedicacion().push(medicamento);
  }

  eliminarMedicamento(index: number) {
    this.getMedicacion().removeAt(index);
  }

  async guardarObservaciones() {
    if (this.observacionesForm.invalid) return;

    const formData = this.observacionesForm.value;
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia) return;

    this.cargando.set(true);
    try {
      const observaciones: ObservacionesCirugia = {
        complicaciones: formData.complicaciones as TipoComplicacion,
        detalleComplicaciones: formData.detalleComplicaciones || undefined,
        citasPostoperatorias: formData.citasPostoperatorias,
        observacionesFinales: formData.observacionesFinales,
        recomendaciones: formData.recomendaciones || undefined,
        medicacionPrescrita: formData.medicacion as MedicacionPrescrita[],
        fechaObservaciones: new Date(),
        medicoObservaciones: 'current-user' // TODO: obtener usuario actual
      };

      await this.programacionService.completarObservaciones(cirugia.id!, observaciones, 'current-user');
      await this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al completar observaciones:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Checklist management
  editarChecklist(cirugia: CirugiaProgramada) {
    this.abrirModal('checklist', cirugia);
  }

  async actualizarItemChecklist(item: ItemChecklistCirugia) {
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia || !item.id) return;

    try {
      await this.programacionService.actualizarItemChecklist(cirugia.id!, item.id, item);
      
      // Actualizar en el estado local
      const cirugias = this.cirugias();
      const index = cirugias.findIndex(c => c.id === cirugia.id);
      if (index !== -1) {
        const cirugiaActualizada = { ...cirugias[index] };
        const itemIndex = cirugiaActualizada.checklist?.findIndex(i => i.id === item.id);
        if (itemIndex !== undefined && itemIndex !== -1 && cirugiaActualizada.checklist) {
          cirugiaActualizada.checklist[itemIndex] = item;
          cirugias[index] = cirugiaActualizada;
          this.cirugias.set([...cirugias]);
          this.cirugiaSeleccionada.set(cirugiaActualizada);
          this.aplicarFiltros();
        }
      }
    } catch (error) {
      console.error('Error al actualizar item checklist:', error);
    }
  }

  async subirArchivo(item: ItemChecklistCirugia, fileInput: HTMLInputElement) {
    const file = fileInput.files?.[0];
    if (!file) return;

    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia) return;

    try {
      // Aquí implementarías la subida del archivo a tu servicio de almacenamiento
      // Por ahora simularemos con una URL ficticia
      const fakeUrl = `https://storage.example.com/cirugias/${cirugia.id}/checklist/${item.id}/${file.name}`;
      
      const itemActualizado: ItemChecklistCirugia = {
        ...item,
        archivoUrl: fakeUrl,
        nombreArchivo: file.name,
        fechaSubida: new Date()
      };

      await this.actualizarItemChecklist(itemActualizado);
      fileInput.value = '';
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  }

  agregarItemPersonalizado() {
    const nombre = prompt('Nombre del item personalizado:');
    if (!nombre) return;

    const descripcion = prompt('Descripción del item:') || '';
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia) return;

    const nuevoItem: ItemChecklistCirugia = {
      id: Date.now().toString(),
      nombre,
      descripcion,
      esObligatorio: false,
      tipoArchivo: TipoArchivoChecklist.OTRO,
      estado: EstadoItemChecklist.PENDIENTE,
      observaciones: ''
    };

    if (cirugia.checklist) {
      cirugia.checklist.push(nuevoItem);
    } else {
      cirugia.checklist = [nuevoItem];
    }

    this.cirugiaSeleccionada.set({ ...cirugia });
  }

  async guardarChecklist() {
    const cirugia = this.cirugiaSeleccionada();
    if (!cirugia || !cirugia.checklist) return;

    try {
      await this.programacionService.actualizarCirugiaProgramada(cirugia.id!, {
        checklist: cirugia.checklist
      });
      
      await this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar checklist:', error);
    }
  }

  // Utility methods
  verDetalleCirugia(cirugia: CirugiaProgramada) {
    this.abrirModal('detalle', cirugia);
  }

  agregarObservaciones(cirugia: CirugiaProgramada) {
    this.abrirModal('observaciones', cirugia);
  }

  async descargarReceta(cirugia: CirugiaProgramada) {
    if (!cirugia.observaciones?.medicacionPrescrita?.length) {
      alert('No hay medicación prescrita para esta cirugía');
      return;
    }

    try {
      // Aquí implementarías la generación del PDF de receta
      console.log('Generando receta para:', cirugia.nombrePaciente);
      alert('Funcionalidad de descarga en desarrollo');
    } catch (error) {
      console.error('Error al generar receta:', error);
    }
  }

  private generarChecklistBasico(condiciones: any): ItemChecklistCirugia[] {
    const checklist: ItemChecklistCirugia[] = [
      {
        id: 'hemograma',
        nombre: 'Hemograma Completo',
        descripcion: 'Examen de sangre completo con recuento de células',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.LABORATORIO,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      },
      {
        id: 'coagulacion',
        nombre: 'Tiempos de Coagulación',
        descripcion: 'PT/PTT para evaluar coagulación sanguínea',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.LABORATORIO,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'electrocardiograma',
        nombre: 'Electrocardiograma',
        descripcion: 'ECG de 12 derivaciones',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.ELECTROCARDIOGRAMA,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
      },
      {
        id: 'consentimiento',
        nombre: 'Consentimiento Informado',
        descripcion: 'Documento firmado de consentimiento para el procedimiento',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.CONSENTIMIENTO,
        estado: EstadoItemChecklist.PENDIENTE
      }
    ];

    // Agregar checks específicos según condiciones
    if (condiciones.problemasCardiovasculares) {
      checklist.push({
        id: 'ecocardiograma',
        nombre: 'Ecocardiograma',
        descripcion: 'Evaluación cardíaca completa por problemas cardiovasculares',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.ECOGRAFIA,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
    }

    if (condiciones.diabetico) {
      checklist.push({
        id: 'hemoglobina-glucosilada',
        nombre: 'Hemoglobina Glucosilada',
        descripcion: 'HbA1c para control diabético',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.LABORATORIO,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
    }

    if (condiciones.anestesiaGeneral) {
      checklist.push({
        id: 'valoracion-anestesia',
        nombre: 'Valoración Preanestésica',
        descripcion: 'Evaluación por anestesiólogo',
        esObligatorio: true,
        tipoArchivo: TipoArchivoChecklist.INTERCONSULTA,
        estado: EstadoItemChecklist.PENDIENTE,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    return checklist;
  }

  // Helper methods
  getEstadoLabel(estado: EstadoCirugiaProgramada): string {
    const labels: Record<EstadoCirugiaProgramada, string> = {
      [EstadoCirugiaProgramada.PENDIENTE_APROBACION]: 'Pendiente Aprobación',
      [EstadoCirugiaProgramada.APROBADA]: 'Aprobada',
      [EstadoCirugiaProgramada.AGENDADA]: 'Agendada',
      [EstadoCirugiaProgramada.EN_PROCESO]: 'En Proceso',
      [EstadoCirugiaProgramada.PENDIENTE_OBSERVACIONES]: 'Pendiente Observaciones',
      [EstadoCirugiaProgramada.FINALIZADA]: 'Finalizada',
      [EstadoCirugiaProgramada.CANCELADA]: 'Cancelada',
      [EstadoCirugiaProgramada.REPROGRAMADA]: 'Reprogramada'
    };
    return labels[estado] || estado;
  }

  getPrioridadLabel(prioridad: PrioridadCirugia): string {
    const labels: Record<PrioridadCirugia, string> = {
      baja: 'Baja',
      normal: 'Normal',
      alta: 'Alta',
      urgente: 'Urgente'
    };
    return labels[prioridad] || prioridad;
  }

  getTipoPersonalLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'medico': 'Médico',
      'enfermera': 'Enfermera',
      'anestesiologo': 'Anestesiólogo'
    };
    return labels[tipo] || tipo;
  }

  getTipoComplicacionLabel(tipo: TipoComplicacion): string {
    const labels: Record<TipoComplicacion, string> = {
      ninguna: 'Ninguna',
      leve: 'Leve',
      moderada: 'Moderada',
      grave: 'Grave'
    };
    return labels[tipo] || tipo;
  }

  formatearFecha(fecha: Date | any): string {
    const f = fecha?.toDate?.() || new Date(fecha);
    return f.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: Date | any): string {
    const f = fecha?.toDate?.() || new Date(fecha);
    return f.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  }

  getProgresoChecklist(checklist: ItemChecklistCirugia[]): number {
    if (!checklist || checklist.length === 0) return 0;
    const completados = checklist.filter(item => 
      item.estado === EstadoItemChecklist.COMPLETADO || 
      item.estado === EstadoItemChecklist.NO_APLICA
    ).length;
    return (completados / checklist.length) * 100;
  }

  getItemsCompletados(checklist: ItemChecklistCirugia[]): number {
    if (!checklist) return 0;
    return checklist.filter(item => 
      item.estado === EstadoItemChecklist.COMPLETADO || 
      item.estado === EstadoItemChecklist.NO_APLICA
    ).length;
  }
}