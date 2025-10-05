import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { PacienteService } from '../../services/paciente.service';
import { AuthService, UserRole } from '../../services/auth.service';
import { Cita, EstadoCita, TipoCita } from '../../models/cita.interface';
import { Paciente } from '../../models/paciente.interface';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="citas-container">
      <div class="header">
        <h1>Gestión de Citas</h1>
        <div class="header-actions">
          <div class="view-toggles">
            <button 
              class="btn" 
              [class.btn-primary]="vistaActual === 'calendario'"
              [class.btn-outline]="vistaActual !== 'calendario'"
              (click)="cambiarVista('calendario')">
              📅 Calendario
            </button>
            <button 
              class="btn" 
              [class.btn-primary]="vistaActual === 'lista'"
              [class.btn-outline]="vistaActual !== 'lista'"
              (click)="cambiarVista('lista')">
              📋 Lista
            </button>
          </div>
          <button class="btn btn-primary" (click)="abrirModalCita()">
            + Nueva Cita
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>Fecha:</label>
            <input type="date" [(ngModel)]="filtros.fecha" (change)="aplicarFiltros()">
          </div>
          <div class="filter-group">
            <label>Médico:</label>
            <select [(ngModel)]="filtros.medicoId" (change)="aplicarFiltros()">
              <option value="">Todos los médicos</option>
              <option *ngFor="let medico of medicos()" [value]="medico.uid">
                {{medico.firstName}} {{medico.lastName}}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Estado:</label>
            <select [(ngModel)]="filtros.estado" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="en-curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no-asistio">No Asistió</option>
              <option value="reprogramada">Reprogramada</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Tipo:</label>
            <select [(ngModel)]="filtros.tipo" (change)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="consulta-inicial">Consulta Inicial</option>
              <option value="cirugia">Cirugía</option>
              <option value="post-operatorio">Post-operatorio</option>
            </select>
          </div>
          <button class="btn btn-outline" (click)="limpiarFiltros()">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Vista Calendario -->
      <div *ngIf="vistaActual === 'calendario'" class="calendario-container">
        <div class="calendario-header">
          <button class="btn btn-outline" (click)="navegarMes(-1)">‹ Anterior</button>
          <h2>{{ obtenerNombreMes() }} {{ anioActual }}</h2>
          <button class="btn btn-outline" (click)="navegarMes(1)">Siguiente ›</button>
        </div>

        <div class="calendario-grid">
          <div class="dia-header" *ngFor="let dia of diasSemana">{{ dia }}</div>
          
          <div 
            *ngFor="let dia of diasDelMes" 
            class="dia-celda"
            [class.otro-mes]="!dia.delMesActual"
            [class.hoy]="dia.esHoy"
            [class.seleccionado]="dia.fecha === fechaSeleccionada"
            (click)="seleccionarFecha(dia.fecha)">
            
            <div class="dia-numero">{{ dia.numero }}</div>
            
            <div class="citas-del-dia">
              <div 
                *ngFor="let cita of obtenerCitasDelDia(dia.fecha)" 
                class="cita-mini"
                [class]="'estado-' + cita.estado"
                (click)="verDetalleCita(cita); $event.stopPropagation()">
                <div class="cita-hora">{{ cita.horaInicio }}</div>
                <div class="cita-paciente">{{ cita.pacienteNombre }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral con detalles del día seleccionado -->
        <div *ngIf="fechaSeleccionada" class="panel-dia">
          <h3>{{ formatearFecha(fechaSeleccionada) }}</h3>
          <div class="citas-detalle">
            <div *ngIf="citasDelDiaSeleccionado().length === 0" class="no-citas">
              No hay citas programadas para este día
            </div>
            <div *ngFor="let cita of citasDelDiaSeleccionado()" class="cita-detalle">
              <div class="cita-header">
                <span class="hora">{{ cita.horaInicio }} - {{ cita.horaFin }}</span>
                <span class="estado" [class]="'badge-' + cita.estado">{{ obtenerTextoEstado(cita.estado) }}</span>
              </div>
              <div class="cita-info">
                <strong>{{ cita.pacienteNombre }}</strong>
                <span class="tipo">{{ obtenerTextoTipo(cita.tipo) }}</span>
                <span class="medico">Dr. {{ cita.medicoNombre }}</span>
              </div>
              <div class="cita-acciones">
                <button class="btn btn-sm btn-outline" (click)="editarCita(cita)" *ngIf="puedeEditarCita(cita)">Editar</button>
                <button class="btn btn-sm btn-info" (click)="consultarCita(cita)" *ngIf="puedeConsultar(cita)">Consultar</button>
                <button class="btn btn-sm btn-success" (click)="iniciarCita(cita)" *ngIf="puedeIniciar(cita)">Iniciar</button>
                <button class="btn btn-sm btn-primary" (click)="completarCita(cita)" *ngIf="cita.estado === 'en-curso'">Completar</button>
                <button class="btn btn-sm btn-warning" (click)="reprogramarCita(cita)" *ngIf="puedeReprogramar(cita)">Reprogramar</button>
                <button class="btn btn-sm btn-danger" (click)="cancelarCita(cita)" *ngIf="puedeCancelar(cita)">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Lista -->
      <div *ngIf="vistaActual === 'lista'" class="lista-container">
        <div class="table-container">
          <table class="citas-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cita of citasFiltradas()" class="cita-row">
                <td>
                  <div class="fecha-hora">
                    <div class="fecha">{{ formatearFecha(cita.fecha) }}</div>
                    <div class="hora">{{ cita.horaInicio }} - {{ cita.horaFin }}</div>
                  </div>
                </td>
                <td>
                  <strong>{{ cita.pacienteNombre }}</strong>
                </td>
                <td>
                  Dr. {{ cita.medicoNombre }}
                </td>
                <td>
                  <span class="badge badge-info">{{ obtenerTextoTipo(cita.tipo) }}</span>
                </td>
                <td>
                  <span class="badge" [class]="'badge-' + cita.estado">{{ obtenerTextoEstado(cita.estado) }}</span>
                </td>
                <td>{{ cita.motivo }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" (click)="editarCita(cita)" *ngIf="puedeEditarCita(cita)" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-info" (click)="consultarCita(cita)" *ngIf="puedeConsultar(cita)" title="Consultar">👁️</button>
                    <button class="btn btn-sm btn-success" (click)="iniciarCita(cita)" *ngIf="puedeIniciar(cita)" title="Iniciar">▶️</button>
                    <button class="btn btn-sm btn-primary" (click)="completarCita(cita)" *ngIf="cita.estado === 'en-curso'" title="Completar">✔️</button>
                    <button class="btn btn-sm btn-warning" (click)="reprogramarCita(cita)" *ngIf="puedeReprogramar(cita)" title="Reprogramar">🔄</button>
                    <button class="btn btn-sm btn-danger" (click)="cancelarCita(cita)" *ngIf="puedeCancelar(cita)" title="Cancelar">❌</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="citasFiltradas().length === 0" class="no-results">
            <p>No se encontraron citas que coincidan con los filtros aplicados.</p>
          </div>
        </div>
      </div>

      <!-- Modal Nueva/Editar Cita -->
      <div class="modal" [class.active]="mostrarModal()" (click)="cerrarModal()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ modoConsulta() ? 'Consultar Cita' : (modoReprogramacion ? 'Reprogramar Cita' : (modoEdicion() ? 'Editar Cita' : 'Nueva Cita')) }}</h2>
            <button class="close-btn" (click)="cerrarModal()">×</button>
          </div>

          <form [formGroup]="citaForm" (ngSubmit)="guardarCita()" class="cita-form">
            <div class="form-sections">
              <!-- Sección Básica -->
              <div class="form-section">
                <h3>Información Básica</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Paciente *</label>
                    <div class="paciente-selector">
                      <select formControlName="pacienteId" (change)="onPacienteChange()">
                        <option value="">Seleccionar paciente</option>
                        <option *ngFor="let paciente of pacientes()" [value]="paciente.id">
                          {{ paciente.nombres }} {{ paciente.apellidos }} - {{ paciente.numeroDocumento }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-outline btn-sm" (click)="abrirModalNuevoPaciente()">
                        + Nuevo
                      </button>
                    </div>
                    <div class="error" *ngIf="citaForm.get('pacienteId')?.invalid && citaForm.get('pacienteId')?.touched">
                      Debe seleccionar un paciente
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Médico *</label>
                    <select formControlName="medicoId" (change)="onMedicoChange()">
                      <option value="">Seleccionar médico</option>
                      <option *ngFor="let medico of medicos()" [value]="medico.uid">
                        Dr. {{ medico.firstName }} {{ medico.lastName }}
                      </option>
                    </select>
                    <div class="error" *ngIf="citaForm.get('medicoId')?.invalid && citaForm.get('medicoId')?.touched">
                      Debe seleccionar un médico
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha *</label>
                    <input type="date" formControlName="fecha" (change)="onFechaChange()" class="fecha-input">
                    <div class="error" *ngIf="citaForm.get('fecha')?.invalid && citaForm.get('fecha')?.touched">
                      La fecha es obligatoria y no puede ser en el pasado
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Hora Inicio *</label>
                    <input type="time" formControlName="horaInicio" (change)="onHoraChange()" class="hora-input">
                    <div class="error" *ngIf="citaForm.get('horaInicio')?.invalid && citaForm.get('horaInicio')?.touched">
                      La hora de inicio es obligatoria
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Hora Fin *</label>
                    <input type="time" formControlName="horaFin" class="hora-input">
                    <div class="error" *ngIf="citaForm.get('horaFin')?.invalid && citaForm.get('horaFin')?.touched">
                      La hora de fin es obligatoria
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección Detalles -->
              <div class="form-section">
                <h3>Detalles de la Cita</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Tipo de Cita *</label>
                    <select formControlName="tipo" (change)="onTipoChange()">
                      <option value="">Seleccionar tipo</option>
                      <option value="consulta-inicial">Consulta Inicial</option>
                      <option value="cirugia">Cirugía</option>
                      <option value="post-operatorio">Post-operatorio</option>
                    </select>
                  </div>
                  
                  <div class="form-group" *ngIf="modoConsulta()">
                    <label>Estado Actual</label>
                    <div class="estado-display">
                      <span class="badge" [class]="'badge-' + citaEditando?.estado">
                        {{ obtenerTextoEstado(citaEditando?.estado || '') }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Motivo de la Cita *</label>
                  <input type="text" formControlName="motivo" placeholder="Ej: Consulta de rinoplastia" class="motivo-input">
                  <div class="error" *ngIf="citaForm.get('motivo')?.invalid && citaForm.get('motivo')?.touched">
                    El motivo es obligatorio
                  </div>
                </div>

                <div class="form-group">
                  <label>Descripción</label>
                  <textarea 
                    formControlName="descripcion" 
                    placeholder="Detalles adicionales sobre la cita"
                    class="descripcion-textarea">
                  </textarea>
                </div>

                <!-- Campo de observaciones finales (solo visible si existen o en modo consulta de cita completada) -->
                <div class="form-group" *ngIf="mostrarObservacionesFinales()">
                  <label>Observaciones Finales</label>
                  <textarea 
                    formControlName="observacionesFinales" 
                    placeholder="Observaciones registradas al completar la cita"
                    class="observaciones-textarea"
                    readonly>
                  </textarea>
                  <div class="field-help">
                    <small>Estas observaciones se registraron cuando se completó la cita.</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" formControlName="notificacionesActivas">
                      <span class="checkmark"></span>
                      Enviar recordatorios al paciente
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensaje de reprogramación -->
            <div *ngIf="modoReprogramacion" class="alert alert-info">
              <strong>Reprogramación de cita:</strong> Puede modificar la fecha y hora. Se validará automáticamente la disponibilidad del médico.
            </div>

            <!-- Mensaje de conflicto -->
            <div *ngIf="mensajeConflicto" class="alert alert-warning">
              {{ mensajeConflicto }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                {{ modoConsulta() ? 'Cerrar' : 'Cancelar' }}
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="citaForm.invalid || guardando()" *ngIf="!modoConsulta()">
                {{ guardando() ? 'Guardando...' : (modoReprogramacion ? 'Reprogramar' : (modoEdicion() ? 'Actualizar' : 'Crear')) }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Nuevo Paciente (Overlay) -->
      <div class="modal modal-overlay" [class.active]="mostrarModalPaciente()" (click)="cerrarModalPaciente()">
        <div class="modal-content modal-nested" (click)="$event.stopPropagation()">
          <div class="modal-header modal-header-nested">
            <h2>Registrar Nuevo Paciente</h2>
            <button class="close-btn" (click)="cerrarModalPaciente()">×</button>
          </div>

          <form [formGroup]="pacienteForm" (ngSubmit)="guardarPaciente()" class="paciente-form">
            <div class="form-section">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombres *</label>
                  <input type="text" formControlName="nombres" placeholder="Nombres del paciente">
                  <div class="error" *ngIf="pacienteForm.get('nombres')?.invalid && pacienteForm.get('nombres')?.touched">
                    Los nombres son obligatorios
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Apellidos *</label>
                  <input type="text" formControlName="apellidos" placeholder="Apellidos del paciente">
                  <div class="error" *ngIf="pacienteForm.get('apellidos')?.invalid && pacienteForm.get('apellidos')?.touched">
                    Los apellidos son obligatorios
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tipo de Documento *</label>
                  <select formControlName="tipoDocumento">
                    <option value="cedula">Cédula de Ciudadanía</option>
                    <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                    <option value="cedula_extranjeria">Cédula de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Número de Documento *</label>
                  <input type="text" formControlName="numeroDocumento" placeholder="Número de documento">
                  <div class="error" *ngIf="pacienteForm.get('numeroDocumento')?.invalid && pacienteForm.get('numeroDocumento')?.touched">
                    El número de documento es obligatorio
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Teléfono *</label>
                  <input type="tel" formControlName="telefono" placeholder="Número de teléfono">
                  <div class="error" *ngIf="pacienteForm.get('telefono')?.invalid && pacienteForm.get('telefono')?.touched">
                    El teléfono es obligatorio
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="email" placeholder="Correo electrónico">
                </div>
              </div>

              <div class="form-group">
                <label>Fecha de Nacimiento *</label>
                <input type="date" formControlName="fechaNacimiento">
                <div class="error" *ngIf="pacienteForm.get('fechaNacimiento')?.invalid && pacienteForm.get('fechaNacimiento')?.touched">
                  La fecha de nacimiento es obligatoria
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalPaciente()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="pacienteForm.invalid || guardandoPaciente()">
                {{ guardandoPaciente() ? 'Guardando...' : 'Registrar Paciente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .citas-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .header h1 {
      color: #1f2937;
      margin: 0;
      font-size: 2rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .view-toggles {
      display: flex;
      gap: 0.5rem;
    }

    /* Filtros */
    .filters-section {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      border: 1px solid #e2e8f0;
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 150px;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .filter-group select,
    .filter-group input {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: white;
    }

    /* Vista Calendario */
    .calendario-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
    }

    .calendario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .calendario-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
    }

    .calendario-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e5e7eb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .dia-header {
      background: #f3f4f6;
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .dia-celda {
      background: white;
      min-height: 120px;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .dia-celda:hover {
      background: #f8fafc;
    }

    .dia-celda.otro-mes {
      background: #f9fafb;
      color: #9ca3af;
    }

    .dia-celda.hoy {
      background: #eff6ff;
      border: 2px solid #3b82f6;
    }

    .dia-celda.seleccionado {
      background: #dbeafe;
    }

    .dia-numero {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .citas-del-dia {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cita-mini {
      font-size: 0.75rem;
      padding: 2px 4px;
      border-radius: 3px;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .cita-mini:hover {
      transform: scale(1.05);
    }

    .estado-confirmada { background: #d1fae5; color: #065f46; }
    .estado-en-curso { background: #dbeafe; color: #1e40af; }
    .estado-completada { background: #e0e7ff; color: #5b21b6; }
    .estado-cancelada { background: #fee2e2; color: #991b1b; }
    .estado-no-asistio { background: #f3f4f6; color: #374151; }

    .cita-hora {
      font-weight: 600;
    }

    .cita-paciente {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Panel del día */
    .panel-dia {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      height: fit-content;
    }

    .panel-dia h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .no-citas {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
      font-style: italic;
    }

    .cita-detalle {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .cita-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .hora {
      font-weight: 600;
      color: #1f2937;
    }

    .cita-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .tipo {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .medico {
      font-size: 0.875rem;
      color: #059669;
    }

    .cita-acciones {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Vista Lista */
    .table-container {
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .citas-table {
      width: 100%;
      border-collapse: collapse;
    }

    .citas-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .citas-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }

    .cita-row:hover {
      background: #f8fafc;
    }

    .fecha-hora {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fecha {
      font-weight: 600;
      color: #1f2937;
    }

    .hora {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      padding: 0.375rem;
      min-width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }

    /* Badges */
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .badge-confirmada { background: #d1fae5; color: #065f46; }
    .badge-en-curso { background: #dbeafe; color: #1e40af; }
    .badge-completada { background: #e0e7ff; color: #5b21b6; }
    .badge-cancelada { background: #fee2e2; color: #991b1b; }
    .badge-no-asistio { background: #f3f4f6; color: #374151; }
    .badge-info { background: #dbeafe; color: #1e40af; }

    /* Selector de paciente */
    .paciente-selector {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: stretch;
    }

    .paciente-selector select {
      width: 100%;
    }

    .paciente-selector .btn {
      padding: 0.75rem;
      font-size: 0.875rem;
      white-space: nowrap;
      text-align: center;
    }

    @media (min-width: 640px) {
      .paciente-selector {
        flex-direction: row;
        gap: 0.5rem;
        align-items: flex-start;
      }
      
      .paciente-selector select {
        flex: 1;
      }
      
      .paciente-selector .btn {
        padding: 0.75rem 1rem;
      }
    }

    /* Campos de formulario mejorados */
    .fecha-input,
    .hora-input {
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 0.75rem;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .fecha-input:focus,
    .hora-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .motivo-input {
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 0.75rem;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .motivo-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .descripcion-textarea {
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 0.75rem;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
      min-height: 80px;
      resize: vertical;
    }

    .descripcion-textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .observaciones-textarea {
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 0.75rem;
      border: 2px solid #f59e0b;
      background-color: #fef3c7;
      color: #92400e;
      min-height: 80px;
      resize: vertical;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5;
    }

    .observaciones-textarea:read-only {
      cursor: default;
      opacity: 1;
    }

    @media (min-width: 640px) {
      .fecha-input,
      .hora-input,
      .motivo-input,
      .descripcion-textarea {
        padding: 0.875rem;
      }
      
      .fecha-input:focus,
      .hora-input:focus,
      .motivo-input:focus,
      .descripcion-textarea:focus {
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
      
      .descripcion-textarea {
        min-height: 100px;
      }
    }

    /* Checkbox mejorado */
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      background: #f8fafc;
    }

    .checkbox-label:hover {
      border-color: #d1d5db;
      background: #f1f5f9;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      cursor: pointer;
    }

    .checkmark {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    @media (min-width: 640px) {
      .checkbox-label {
        padding: 1rem;
      }
      
      .checkbox-label input[type="checkbox"] {
        width: 20px;
        height: 20px;
      }
      
      .checkmark {
        font-size: 1rem;
      }
    }

    /* Display de estado */
    .estado-display {
      padding: 0.875rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      background: #f8fafc;
      display: flex;
      align-items: center;
    }

    .estado-display .badge {
      font-size: 1rem;
      padding: 0.5rem 1rem;
    }

    /* Modal mejorado y responsive */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      padding: 1rem;
      overflow-y: auto;
    }

    /* Modal de paciente debe aparecer encima del modal de cita */
    .modal:last-child {
      z-index: 1100;
      background: rgba(0, 0, 0, 0.8);
    }

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: white;
      border-radius: 1.5rem;
      width: 100%;
      max-width: 600px;
      max-height: calc(100vh - 2rem);
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(0.95);
      animation: modalAppear 0.2s ease-out forwards;
      display: flex;
      flex-direction: column;
      margin: auto;
    }

    @keyframes modalAppear {
      to {
        transform: scale(1);
      }
    }

    .modal-large {
      max-width: 900px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 1.5rem 1.5rem 0 0;
      flex-shrink: 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .cita-form,
    .paciente-form {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
    }

    .form-section h3 {
      color: #1f2937;
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
      font-size: 1rem;
      font-weight: 600;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (min-width: 640px) {
      .form-row {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
      }
      
      .cita-form,
      .paciente-form {
        padding: 2rem;
      }
      
      .form-section {
        padding: 1.5rem;
      }
      
      .form-sections {
        gap: 2rem;
      }
      
      .modal-header h2 {
        font-size: 1.5rem;
      }
      
      .close-btn {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      background: white;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    /* Mejorar campos en móviles */
    @media (min-width: 640px) {
      .form-group {
        gap: 0.75rem;
      }
      
      .form-group label {
        font-size: 0.875rem;
      }
      
      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 0.875rem;
      }
      
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
    }

    .form-group input:disabled,
    .form-group select:disabled,
    .form-group textarea:disabled {
      background-color: #f3f4f6;
      color: #6b7280;
      cursor: not-allowed;
      border-color: #d1d5db;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 0.75rem;
      margin: 1rem 0;
      border-left: 4px solid;
    }

    .alert-warning {
      background: #fef3c7;
      color: #92400e;
      border-left-color: #f59e0b;
    }

    .alert-info {
      background: #dbeafe;
      color: #1e40af;
      border-left-color: #3b82f6;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
      border-radius: 0 0 1.5rem 1.5rem;
      flex-shrink: 0;
    }

    .modal-actions .btn {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    @media (min-width: 640px) {
      .modal-actions {
        flex-direction: row;
        gap: 1rem;
        justify-content: flex-end;
        padding: 2rem;
      }
      
      .modal-actions .btn {
        width: auto;
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        min-width: 120px;
      }
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    /* Botones */
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-outline {
      background: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background: #f3f4f6;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-info {
      background: #06b6d4;
      color: white;
    }

    .btn-info:hover {
      background: #0891b2;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover {
      background: #d97706;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Campos deshabilitados en modo consulta */
    .form-group input:disabled,
    .form-group select:disabled,
    .form-group textarea:disabled {
      background-color: #f8fafc;
      color: #6b7280;
      border-color: #e5e7eb;
      cursor: not-allowed;
    }

    .form-group textarea.readonly {
      background-color: #f8fafc;
      color: #374151;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .field-help {
      margin-top: 0.5rem;
    }

    .field-help small {
      color: #6b7280;
      font-size: 0.75rem;
      font-style: italic;
    }

    /* Mejoras táctiles para móviles */
    @media (max-width: 768px) {
      .btn {
        min-height: 44px; /* Tamaño mínimo táctil recomendado */
        touch-action: manipulation;
      }
      
      .form-group input,
      .form-group select,
      .form-group textarea {
        min-height: 44px;
        touch-action: manipulation;
      }
      
      .checkbox-label {
        min-height: 44px;
        touch-action: manipulation;
      }
      
      .close-btn {
        min-width: 44px;
        min-height: 44px;
        touch-action: manipulation;
      }
    }

    /* Evitar zoom en inputs en iOS */
    @media screen and (max-width: 768px) {
      .form-group input,
      .form-group select,
      .form-group textarea {
        font-size: 16px;
      }
    }

    /* Responsive adicional para la tabla y otros elementos */
    @media (max-width: 768px) {
      .citas-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: space-between;
      }

      .calendario-container {
        grid-template-columns: 1fr;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-group {
        min-width: auto;
      }

      .table-container {
        overflow-x: auto;
      }

      .citas-table {
        min-width: 800px;
      }

      .cita-acciones,
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      /* Modal específico para móviles */
      .modal {
        padding: 0.5rem;
      }

      .modal-content {
        width: 100%;
        max-width: 100%;
        margin: 0;
        border-radius: 1rem;
        max-height: calc(100vh - 1rem);
      }

      .modal-header {
        padding: 1rem 1.5rem;
        border-radius: 1rem 1rem 0 0;
      }

      .modal-header h2 {
        font-size: 1.125rem;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        font-size: 1.125rem;
      }
    }
  `]
})
export class CitasComponent implements OnInit {
  // Signals
  citas = signal<Cita[]>([]);
  citasFiltradas = signal<Cita[]>([]);
  pacientes = signal<Paciente[]>([]);
  medicos = signal<UserRole[]>([]);
  mostrarModal = signal(false);
  mostrarModalPaciente = signal(false);
  modoEdicion = signal(false);
  modoConsulta = signal(false);
  guardando = signal(false);
  guardandoPaciente = signal(false);
  
  // Control de navegación entre modales
  volverACitaDespuesPaciente = false;
  modoReprogramacion = false;

  // Formularios
  citaForm: FormGroup;
  pacienteForm: FormGroup;
  citaEditando: Cita | null = null;
  mensajeConflicto = '';

  // Vista y filtros
  vistaActual: 'calendario' | 'lista' = 'lista';
  filtros = {
    fecha: '',
    medicoId: '',
    estado: '',
    tipo: ''
  };

  // Calendario
  fechaActual = new Date();
  fechaSeleccionada: string | null = null;
  mesActual = this.fechaActual.getMonth();
  anioActual = this.fechaActual.getFullYear();
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  diasDelMes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private authService: AuthService,
    private router: Router
  ) {
    this.citaForm = this.crearFormulario();
    this.pacienteForm = this.crearFormularioPaciente();
    this.generarCalendario();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      pacienteId: ['', Validators.required],
      medicoId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      tipo: ['', Validators.required],
      estado: ['confirmada'],
      motivo: ['', Validators.required],
      descripcion: [''],
      observacionesFinales: [''],
      duracionEstimada: [60],
      costo: [0],
      notificacionesActivas: [true]
    });
  }

  crearFormularioPaciente(): FormGroup {
    return this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipoDocumento: ['cedula', Validators.required],
      numeroDocumento: ['', Validators.required],
      telefono: ['', Validators.required],
      email: [''],
      fechaNacimiento: ['', Validators.required]
    });
  }

  async cargarDatos() {
    try {
      // Cargar pacientes
      this.pacienteService.obtenerPacientes().subscribe(pacientes => {
        this.pacientes.set(pacientes);
      });

      // Cargar médicos (usuarios con rol médico)
      const usuarios = await this.authService.getAllUsers();
      const medicos = usuarios.filter((u: UserRole) => u.role === 'medico' || u.role === 'administrador_medico');
      this.medicos.set(medicos);

      // Cargar citas
      this.cargarCitas();
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  cargarCitas() {
    this.citaService.obtenerCitas().subscribe((citas: Cita[]) => {
      this.citas.set(citas);
      this.aplicarFiltros();
    });
  }

  // Métodos de vista
  cambiarVista(vista: 'calendario' | 'lista') {
    this.vistaActual = vista;
  }

  // Métodos de filtros
  aplicarFiltros() {
    let citasFiltradas = [...this.citas()];

    if (this.filtros.fecha) {
      const fechaFiltro = new Date(this.filtros.fecha);
      citasFiltradas = citasFiltradas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.toDateString() === fechaFiltro.toDateString();
      });
    }

    if (this.filtros.medicoId) {
      citasFiltradas = citasFiltradas.filter(cita => cita.medicoId === this.filtros.medicoId);
    }

    if (this.filtros.estado) {
      citasFiltradas = citasFiltradas.filter(cita => cita.estado === this.filtros.estado);
    }

    if (this.filtros.tipo) {
      citasFiltradas = citasFiltradas.filter(cita => cita.tipo === this.filtros.tipo);
    }

    this.citasFiltradas.set(citasFiltradas);
  }

  limpiarFiltros() {
    this.filtros = {
      fecha: '',
      medicoId: '',
      estado: '',
      tipo: ''
    };
    this.aplicarFiltros();
  }

  // Métodos de calendario
  generarCalendario() {
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    const primerDiaSemana = primerDia.getDay();
    
    this.diasDelMes = [];

    // Días del mes anterior
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(this.anioActual, this.mesActual, -i);
      this.diasDelMes.push({
        numero: fecha.getDate(),
        fecha: fecha.toISOString().split('T')[0],
        delMesActual: false,
        esHoy: false
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.anioActual, this.mesActual, dia);
      const hoy = new Date();
      this.diasDelMes.push({
        numero: dia,
        fecha: fecha.toISOString().split('T')[0],
        delMesActual: true,
        esHoy: fecha.toDateString() === hoy.toDateString()
      });
    }

    // Días del siguiente mes para completar la grilla
    const diasRestantes = 42 - this.diasDelMes.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(this.anioActual, this.mesActual + 1, dia);
      this.diasDelMes.push({
        numero: dia,
        fecha: fecha.toISOString().split('T')[0],
        delMesActual: false,
        esHoy: false
      });
    }
  }

  navegarMes(direccion: number) {
    this.mesActual += direccion;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.generarCalendario();
  }

  obtenerNombreMes(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[this.mesActual];
  }

  seleccionarFecha(fecha: string) {
    this.fechaSeleccionada = fecha;
  }

  obtenerCitasDelDia(fecha: string): Cita[] {
    return this.citasFiltradas().filter(cita => {
      const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
      return fechaCita === fecha;
    });
  }

  citasDelDiaSeleccionado(): Cita[] {
    if (!this.fechaSeleccionada) return [];
    return this.obtenerCitasDelDia(this.fechaSeleccionada);
  }

  // Métodos del formulario
  abrirModalCita() {
    this.modoEdicion.set(false);
    this.modoConsulta.set(false);
    this.modoReprogramacion = false;
    this.citaEditando = null;
    this.citaForm.reset({
      estado: 'confirmada',
      duracionEstimada: 60,
      costo: 0,
      notificacionesActivas: true
    });
    this.citaForm.enable();
    this.mensajeConflicto = '';
    this.mostrarModal.set(true);
  }

  editarCita(cita: Cita) {
    this.modoEdicion.set(true);
    this.modoConsulta.set(false);
    this.citaEditando = cita;
    this.mensajeConflicto = '';
    
    this.citaForm.patchValue({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: new Date(cita.fecha).toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      tipo: cita.tipo,
      estado: cita.estado,
      motivo: cita.motivo,
      descripcion: cita.descripcion,
      duracionEstimada: cita.duracionEstimada,
      costo: cita.costo,
      notificacionesActivas: cita.notificacionesActivas
    });
    
    this.mostrarModal.set(true);
  }

  consultarCita(cita: Cita) {
    this.modoEdicion.set(false);
    this.modoConsulta.set(true);
    this.citaEditando = cita;
    this.mensajeConflicto = '';
    
    this.citaForm.patchValue({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: new Date(cita.fecha).toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      tipo: cita.tipo,
      estado: cita.estado,
      motivo: cita.motivo,
      descripcion: cita.descripcion,
      duracionEstimada: cita.duracionEstimada,
      costo: cita.costo,
      notificacionesActivas: cita.notificacionesActivas
    });
    
    // Deshabilitar todo el formulario en modo consulta
    this.citaForm.disable();
    
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.modoConsulta.set(false);
    this.modoReprogramacion = false;
    this.mensajeConflicto = '';
    this.volverACitaDespuesPaciente = false; // Resetear bandera
    // Rehabilitar el formulario si estaba deshabilitado
    this.citaForm.enable();
  }

  async guardarCita() {
    if (this.citaForm.invalid) return;

    this.guardando.set(true);
    this.mensajeConflicto = '';

    try {
      const formData = this.citaForm.value;
      const fecha = new Date(formData.fecha);
      
      // Validar disponibilidad
      const disponible = await this.citaService.validarDisponibilidadHorario(
        fecha,
        formData.horaInicio,
        formData.horaFin,
        formData.medicoId,
        this.modoEdicion() ? this.citaEditando?.id : undefined
      );

      if (!disponible) {
        this.mensajeConflicto = this.modoReprogramacion 
          ? 'El médico no está disponible en el horario seleccionado. Por favor, elija otro horario para reprogramar la cita.'
          : 'El horario seleccionado no está disponible. Por favor, elija otro horario.';
        this.guardando.set(false);
        return;
      }

      // Obtener nombres de paciente y médico
      const paciente = this.pacientes().find(p => p.id === formData.pacienteId);
      const medico = this.medicos().find(m => m.uid === formData.medicoId);

      const cita: Cita = {
        ...formData,
        fecha,
        pacienteNombre: `${paciente?.nombres} ${paciente?.apellidos}`,
        medicoNombre: `${medico?.firstName} ${medico?.lastName}`,
        fechaCreacion: this.modoEdicion() ? this.citaEditando!.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
        creadoPor: 'current-user-id', // TODO: Obtener del AuthService
        recordatorioEnviado: false
      };

      if (this.modoEdicion() && this.citaEditando) {
        await this.citaService.actualizarCita(this.citaEditando.id!, cita);
      } else {
        await this.citaService.crearCita(cita);
      }

      this.cargarCitas();
      this.cerrarModal();
      
      const mensaje = this.modoReprogramacion 
        ? 'Cita reprogramada exitosamente'
        : (this.modoEdicion() ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente');
      alert(mensaje);
    } catch (error) {
      console.error('Error guardando cita:', error);
      alert('Error al guardar la cita');
    } finally {
      this.guardando.set(false);
    }
  }

  // Eventos del formulario
  onPacienteChange() {
    // Lógica adicional si es necesaria
  }

  onMedicoChange() {
    // Lógica adicional si es necesaria
  }

  onFechaChange() {
    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(this.citaForm.get('fecha')?.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      this.citaForm.get('fecha')?.setErrors({ fechaPasada: true });
      this.mensajeConflicto = 'No se pueden programar citas en fechas pasadas.';
    } else {
      // Limpiar el error si la fecha es válida
      if (this.citaForm.get('fecha')?.hasError('fechaPasada')) {
        this.citaForm.get('fecha')?.setErrors(null);
        this.mensajeConflicto = '';
      }
    }
  }

  onHoraChange() {
    const horaInicio = this.citaForm.get('horaInicio')?.value;
    const duracion = this.citaForm.get('duracionEstimada')?.value || 60;
    
    if (horaInicio) {
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const minutosTotal = horas * 60 + minutos + duracion;
      const horasFin = Math.floor(minutosTotal / 60);
      const minutosFin = minutosTotal % 60;
      
      const horaFin = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
      this.citaForm.get('horaFin')?.setValue(horaFin);
    }
  }

  onTipoChange() {
    const tipo = this.citaForm.get('tipo')?.value;
    let duracionDefault = 60;
    
    switch (tipo) {
      case 'consulta-inicial':
        duracionDefault = 45;
        break;
      case 'cirugia':
        duracionDefault = 120;
        break;
      case 'post-operatorio':
        duracionDefault = 30;
        break;
    }
    
    this.citaForm.get('duracionEstimada')?.setValue(duracionDefault);
    this.onHoraChange();
  }

  // Métodos de acciones de citas
  /* MÉTODO REMOVIDO - Ya no hay estado 'programada'
  async confirmarCita(cita: Cita) {
    if (confirm('¿Está seguro de que desea confirmar esta cita?')) {
      try {
        await this.citaService.confirmarCita(cita.id!);
        this.cargarCitas();
        alert('Cita confirmada exitosamente');
      } catch (error) {
        console.error('Error confirmando cita:', error);
        alert('Error al confirmar la cita');
      }
    }
  }
  */

  async iniciarCita(cita: Cita) {
    if (confirm('¿Está seguro de que desea iniciar esta cita?')) {
      try {
        await this.citaService.iniciarCita(cita.id!);
        this.cargarCitas();
        alert('Cita iniciada exitosamente');
      } catch (error) {
        console.error('Error iniciando cita:', error);
        alert('Error al iniciar la cita');
      }
    }
  }

  async completarCita(cita: Cita) {
    const observaciones = prompt('Observaciones finales de la cita:');
    if (observaciones !== null) { // Solo proceder si no se canceló el prompt
      try {
        // Completar la cita con las observaciones
        await this.citaService.completarCita(cita.id!, observaciones || undefined);
        
        this.cargarCitas();
        alert('Cita completada exitosamente');
      } catch (error) {
        console.error('Error completando cita:', error);
        alert('Error al completar la cita');
      }
    }
  }

  async cancelarCita(cita: Cita) {
    const motivo = prompt('Motivo de la cancelación:');
    if (motivo) {
      try {
        await this.citaService.cancelarCita(cita.id!, motivo);
        this.cargarCitas();
        alert('Cita cancelada exitosamente');
      } catch (error) {
        console.error('Error cancelando cita:', error);
        alert('Error al cancelar la cita');
      }
    }
  }

  async reprogramarCita(cita: Cita) {
    // Abrir modal de edición en modo reprogramación
    this.modoEdicion.set(true);
    this.modoReprogramacion = true; // Nueva propiedad para indicar reprogramación
    this.citaEditando = cita;
    this.mensajeConflicto = '';
    
    // Llenar el formulario con los datos actuales
    this.citaForm.patchValue({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: new Date(cita.fecha).toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      tipo: cita.tipo,
      motivo: cita.motivo,
      descripcion: cita.descripcion,
      observacionesFinales: cita.observaciones || '',
      duracionEstimada: cita.duracionEstimada,
      costo: cita.costo,
      notificacionesActivas: cita.notificacionesActivas
    });
    
    // Habilitar solo los campos relevantes para reprogramación (fecha, hora)
    this.citaForm.get('pacienteId')?.disable();
    this.citaForm.get('medicoId')?.disable();
    this.citaForm.get('tipo')?.disable();
    this.citaForm.get('motivo')?.disable();
    
    this.mostrarModal.set(true);
  }

  verDetalleCita(cita: Cita) {
    // Navegar a vista detallada o abrir modal de detalles
    this.editarCita(cita);
  }

  // Métodos de utilidad
  puedeEditarCita(cita: Cita): boolean {
    // Las citas confirmadas no se pueden editar, solo reprogramar, iniciar o cancelar
    return false;
  }

  puedeConsultar(cita: Cita): boolean {
    return cita.estado === 'completada' || cita.estado === 'cancelada' || cita.estado === 'no-asistio';
  }

  puedeReprogramar(cita: Cita): boolean {
    return cita.estado === 'confirmada';
  }

  mostrarObservacionesFinales(): boolean {
    // Mostrar si estamos en modo consulta y es una cita completada
    if (this.modoConsulta() && this.citaEditando && this.citaEditando.estado === 'completada') {
      return true;
    }
    
    // Mostrar si hay observaciones finales en el formulario
    const observaciones = this.citaForm.get('observacionesFinales')?.value;
    return observaciones && observaciones.trim() !== '';
  }

  puedeIniciar(cita: Cita): boolean {
    return cita.estado === 'confirmada';
  }

  puedeCancelar(cita: Cita): boolean {
    return cita.estado === 'confirmada';
  }

  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'confirmada': 'Confirmada',
      'en-curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no-asistio': 'No Asistió',
      'reprogramada': 'Reprogramada'
    };
    return estados[estado] || estado;
  }

  obtenerTextoTipo(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'consulta-inicial': 'Consulta Inicial',
      'cirugia': 'Cirugía',
      'post-operatorio': 'Post-operatorio'
    };
    return tipos[tipo] || tipo;
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Métodos para modal de paciente
  abrirModalNuevoPaciente() {
    // Si venimos del modal de cita, marcamos para volver después
    this.volverACitaDespuesPaciente = this.mostrarModal();
    
    // Cerrar modal de cita si está abierto
    if (this.mostrarModal()) {
      this.mostrarModal.set(false);
    }
    
    this.pacienteForm.reset({
      tipoDocumento: 'cedula'
    });
    this.mostrarModalPaciente.set(true);
  }

  cerrarModalPaciente() {
    this.mostrarModalPaciente.set(false);
    
    // Si debemos volver al modal de cita, lo abrimos
    if (this.volverACitaDespuesPaciente) {
      this.volverACitaDespuesPaciente = false;
      this.mostrarModal.set(true);
    }
  }

  async guardarPaciente() {
    if (this.pacienteForm.invalid) return;

    this.guardandoPaciente.set(true);

    try {
      const pacienteData = {
        ...this.pacienteForm.value,
        fechaNacimiento: new Date(this.pacienteForm.value.fechaNacimiento),
        fechaRegistro: new Date(),
        activo: true
      };

      const nuevoPacienteId = await this.pacienteService.crearPaciente(pacienteData);
      
      // Cerrar modal de paciente
      this.mostrarModalPaciente.set(false);
      
      // Actualizar la lista de pacientes
      this.cargarDatos();
      
      // Si debemos volver al modal de cita
      if (this.volverACitaDespuesPaciente) {
        this.volverACitaDespuesPaciente = false;
        
        // Seleccionar el nuevo paciente en el formulario de cita
        this.citaForm.get('pacienteId')?.setValue(nuevoPacienteId);
        
        // Volver a abrir el modal de cita
        this.mostrarModal.set(true);
        
        alert('Paciente registrado exitosamente y seleccionado en la cita');
      } else {
        alert('Paciente registrado exitosamente');
      }
      
    } catch (error) {
      console.error('Error registrando paciente:', error);
      alert('Error al registrar el paciente');
    } finally {
      this.guardandoPaciente.set(false);
    }
  }
}