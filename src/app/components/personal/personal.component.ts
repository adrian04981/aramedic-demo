import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal.service';
import { 
  Personal, 
  TipoPersonal, 
  EstadoPersonal, 
  TipoDocumento, 
  TurnoTrabajo,
  CERTIFICACIONES_ENFERMERAS,
  CERTIFICACIONES_ANESTESIOLOGOS
} from '../../models/personal.interface';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="personal-container">
      <div class="personal-header">
        <h1>👨‍⚕️ Gestión de Personal Médico</h1>
        <p>Administra enfermeras y anestesiólogos de la clínica</p>
        
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-number">{{personalFiltrado().length}}</span>
            <span class="stat-label">Personal Total</span>
          </div>
          <div class="stat-card enfermeras">
            <span class="stat-number">{{contarPorTipo(TipoPersonal.ENFERMERA)}}</span>
            <span class="stat-label">Enfermeras</span>
          </div>
          <div class="stat-card anestesiologos">
            <span class="stat-number">{{contarPorTipo(TipoPersonal.ANESTESIOLOGO)}}</span>
            <span class="stat-label">Anestesiólogos</span>
          </div>
        </div>
      </div>

      <div class="personal-controls">
        <div class="filters">
          <select 
            class="filter-select" 
            [(ngModel)]="filtroTipo" 
            (ngModelChange)="aplicarFiltros()"
            [ngModelOptions]="{standalone: true}">
            <option value="">Todos los tipos</option>
            <option value="enfermera">Enfermeras</option>
            <option value="anestesiologo">Anestesiólogos</option>
          </select>
          
          <select 
            class="filter-select" 
            [(ngModel)]="filtroEstado" 
            (ngModelChange)="aplicarFiltros()"
            [ngModelOptions]="{standalone: true}">
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="suspendido">Suspendidos</option>
            <option value="vacaciones">En Vacaciones</option>
            <option value="licencia">En Licencia</option>
          </select>
          
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar por nombre, apellido o documento..."
            [(ngModel)]="terminoBusqueda"
            (ngModelChange)="aplicarFiltros()"
            [ngModelOptions]="{standalone: true}">
        </div>
        
        <button class="btn btn-primary" (click)="abrirModal('crear')">
          <i class="icon">👤</i> Agregar Personal
        </button>
      </div>

      <!-- Tabla de Personal -->
      <div class="tabla-container">
        <table class="tabla-personal">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Turno</th>
              <th>Experiencia</th>
              <th>Salario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (persona of personalFiltrado(); track persona.id) {
              <tr>
                <td>
                  <span class="tipo-badge" [class]="persona.tipoPersonal">
                    {{persona.tipoPersonal === TipoPersonal.ENFERMERA ? '👩‍⚕️ Enfermera' : '🩺 Anestesiólogo'}}
                  </span>
                </td>
                <td class="nombre-completo">
                  <strong>{{persona.nombres}} {{persona.apellidos}}</strong>
                </td>
                <td>{{persona.numeroDocumento}}</td>
                <td>{{persona.telefono}}</td>
                <td>{{persona.email}}</td>
                <td>
                  <span class="estado-badge" [class]="persona.estado">
                    {{getEstadoLabel(persona.estado)}}
                  </span>
                </td>
                <td>{{getTurnoLabel(persona.turnoPreferido)}}</td>
                <td>{{persona.experienciaAnios}} años</td>
                <td>{{formatearSalario(persona.salarioBase)}}</td>
                <td class="acciones">
                  <button class="btn-icon btn-edit" (click)="abrirModal('editar', persona)" title="Editar">
                    ✏️
                  </button>
                  <button class="btn-icon btn-view" (click)="abrirModal('ver', persona)" title="Ver detalles">
                    👁️
                  </button>
                  <button class="btn-icon btn-delete" (click)="confirmarEliminacion(persona)" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="empty-message">
                  No se encontró personal que coincida con los filtros aplicados
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      @if (mostrarModal()) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                @switch (modoModal()) {
                  @case ('crear') { 👤 Agregar Nuevo Personal }
                  @case ('editar') { ✏️ Editar Personal }
                  @case ('ver') { 👁️ Detalles del Personal }
                }
              </h3>
              <button class="btn-close" (click)="cerrarModal()">×</button>
            </div>
            
            <div class="modal-body">
              @if (modoModal() === 'ver') {
                <!-- Vista de solo lectura -->
                <div class="vista-detalle">
                  <div class="detalle-section">
                    <h4>Información Personal</h4>
                    <div class="detalle-grid">
                      <div class="detalle-item">
                        <label>Tipo:</label>
                        <span class="tipo-badge" [class]="personalSeleccionado()?.tipoPersonal">
                          {{personalSeleccionado()?.tipoPersonal === TipoPersonal.ENFERMERA ? '👩‍⚕️ Enfermera' : '🩺 Anestesiólogo'}}
                        </span>
                      </div>
                      <div class="detalle-item">
                        <label>Nombre Completo:</label>
                        <span>{{personalSeleccionado()?.nombres}} {{personalSeleccionado()?.apellidos}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Documento:</label>
                        <span>{{personalSeleccionado()?.numeroDocumento}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Fecha de Nacimiento:</label>
                        <span>{{formatearFecha(personalSeleccionado()?.fechaNacimiento)}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Teléfono:</label>
                        <span>{{personalSeleccionado()?.telefono}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Email:</label>
                        <span>{{personalSeleccionado()?.email}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Dirección:</label>
                        <span>{{personalSeleccionado()?.direccion}}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="detalle-section">
                    <h4>Información Laboral</h4>
                    <div class="detalle-grid">
                      <div class="detalle-item">
                        <label>Estado:</label>
                        <span class="estado-badge" [class]="personalSeleccionado()?.estado">
                          {{getEstadoLabel(personalSeleccionado()?.estado)}}
                        </span>
                      </div>
                      <div class="detalle-item">
                        <label>Turno Preferido:</label>
                        <span>{{getTurnoLabel(personalSeleccionado()?.turnoPreferido)}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Experiencia:</label>
                        <span>{{personalSeleccionado()?.experienciaAnios}} años</span>
                      </div>
                      <div class="detalle-item">
                        <label>Fecha de Ingreso:</label>
                        <span>{{formatearFecha(personalSeleccionado()?.fechaIngreso)}}</span>
                      </div>
                      <div class="detalle-item">
                        <label>Salario Base:</label>
                        <span>{{formatearSalario(personalSeleccionado()?.salarioBase)}}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="detalle-section">
                    <h4>Certificaciones</h4>
                    <div class="certificaciones-list">
                      @for (cert of personalSeleccionado()?.certificaciones; track cert) {
                        <span class="certificacion-badge">{{cert}}</span>
                      }
                    </div>
                  </div>
                  
                  @if (personalSeleccionado()?.observaciones) {
                    <div class="detalle-section">
                      <h4>Observaciones</h4>
                      <p>{{personalSeleccionado()?.observaciones}}</p>
                    </div>
                  }
                </div>
              } @else {
                <!-- Formulario de crear/editar -->
                <form [formGroup]="personalForm" (ngSubmit)="guardarPersonal()">
                  <div class="form-grid">
                    <!-- Información básica -->
                    <div class="form-section">
                      <h4>Información Personal</h4>
                      
                      <div class="form-group">
                        <label for="tipoPersonal">Tipo de Personal *</label>
                        <select id="tipoPersonal" formControlName="tipoPersonal" (change)="onTipoPersonalChange()">
                          <option value="">Seleccionar tipo</option>
                          <option value="enfermera">👩‍⚕️ Enfermera</option>
                          <option value="anestesiologo">🩺 Anestesiólogo</option>
                        </select>
                        @if (personalForm.get('tipoPersonal')?.invalid && personalForm.get('tipoPersonal')?.touched) {
                          <span class="error-message">El tipo de personal es requerido</span>
                        }
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label for="nombres">Nombres *</label>
                          <input type="text" id="nombres" formControlName="nombres" placeholder="Nombres">
                          @if (personalForm.get('nombres')?.invalid && personalForm.get('nombres')?.touched) {
                            <span class="error-message">Los nombres son requeridos</span>
                          }
                        </div>
                        
                        <div class="form-group">
                          <label for="apellidos">Apellidos *</label>
                          <input type="text" id="apellidos" formControlName="apellidos" placeholder="Apellidos">
                          @if (personalForm.get('apellidos')?.invalid && personalForm.get('apellidos')?.touched) {
                            <span class="error-message">Los apellidos son requeridos</span>
                          }
                        </div>
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label for="tipoDocumento">Tipo de Documento *</label>
                          <select id="tipoDocumento" formControlName="tipoDocumento">
                            <option value="cedula">Cédula</option>
                            <option value="pasaporte">Pasaporte</option>
                            <option value="cedula_extranjeria">Cédula de Extranjería</option>
                          </select>
                        </div>
                        
                        <div class="form-group">
                          <label for="numeroDocumento">Número de Documento *</label>
                          <input type="text" id="numeroDocumento" formControlName="numeroDocumento" placeholder="Número de documento">
                          @if (personalForm.get('numeroDocumento')?.invalid && personalForm.get('numeroDocumento')?.touched) {
                            <span class="error-message">El número de documento es requerido y debe ser único</span>
                          }
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label for="fechaNacimiento">Fecha de Nacimiento *</label>
                        <input type="date" id="fechaNacimiento" formControlName="fechaNacimiento">
                        @if (personalForm.get('fechaNacimiento')?.invalid && personalForm.get('fechaNacimiento')?.touched) {
                          <span class="error-message">La fecha de nacimiento es requerida</span>
                        }
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label for="telefono">Teléfono *</label>
                          <input type="tel" id="telefono" formControlName="telefono" placeholder="+57 300 123 4567">
                          @if (personalForm.get('telefono')?.invalid && personalForm.get('telefono')?.touched) {
                            <span class="error-message">El teléfono es requerido</span>
                          }
                        </div>
                        
                        <div class="form-group">
                          <label for="email">Email *</label>
                          <input type="email" id="email" formControlName="email" placeholder="email@aramedic.com">
                          @if (personalForm.get('email')?.invalid && personalForm.get('email')?.touched) {
                            <span class="error-message">Email inválido o ya existe</span>
                          }
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label for="direccion">Dirección *</label>
                        <input type="text" id="direccion" formControlName="direccion" placeholder="Dirección completa">
                        @if (personalForm.get('direccion')?.invalid && personalForm.get('direccion')?.touched) {
                          <span class="error-message">La dirección es requerida</span>
                        }
                      </div>
                    </div>
                    
                    <!-- Información laboral -->
                    <div class="form-section">
                      <h4>Información Laboral</h4>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label for="estado">Estado *</label>
                          <select id="estado" formControlName="estado">
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="suspendido">Suspendido</option>
                            <option value="vacaciones">En Vacaciones</option>
                            <option value="licencia">En Licencia</option>
                          </select>
                        </div>
                        
                        <div class="form-group">
                          <label for="turnoPreferido">Turno Preferido *</label>
                          <select id="turnoPreferido" formControlName="turnoPreferido">
                            <option value="manana">Mañana</option>
                            <option value="tarde">Tarde</option>
                            <option value="noche">Noche</option>
                            <option value="rotativo">Rotativo</option>
                            <option value="disponibilidad_completa">Disponibilidad Completa</option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label for="experienciaAnios">Años de Experiencia *</label>
                          <input type="number" id="experienciaAnios" formControlName="experienciaAnios" min="0" max="50">
                          @if (personalForm.get('experienciaAnios')?.invalid && personalForm.get('experienciaAnios')?.touched) {
                            <span class="error-message">Los años de experiencia son requeridos</span>
                          }
                        </div>
                        
                        <div class="form-group">
                          <label for="fechaIngreso">Fecha de Ingreso *</label>
                          <input type="date" id="fechaIngreso" formControlName="fechaIngreso">
                          @if (personalForm.get('fechaIngreso')?.invalid && personalForm.get('fechaIngreso')?.touched) {
                            <span class="error-message">La fecha de ingreso es requerida</span>
                          }
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label for="salarioBase">Salario Base *</label>
                        <input type="number" id="salarioBase" formControlName="salarioBase" min="0" placeholder="2000000">
                        @if (personalForm.get('salarioBase')?.invalid && personalForm.get('salarioBase')?.touched) {
                          <span class="error-message">El salario base es requerido</span>
                        }
                      </div>
                    </div>
                    
                    <!-- Certificaciones -->
                    <div class="form-section full-width">
                      <h4>Certificaciones</h4>
                      <div class="certificaciones-container">
                        <div class="certificaciones-disponibles">
                          <label>Certificaciones Disponibles:</label>
                          <div class="certificaciones-grid">
                            @for (cert of certificacionesDisponibles(); track cert) {
                              <label class="certificacion-checkbox">
                                <input 
                                  type="checkbox" 
                                  [value]="cert"
                                  [checked]="esCertificacionSeleccionada(cert)"
                                  (change)="toggleCertificacion(cert, $event)">
                                <span>{{cert}}</span>
                              </label>
                            }
                          </div>
                        </div>
                        
                        <div class="certificaciones-personalizadas">
                          <label for="nuevaCertificacion">Agregar Certificación Personalizada:</label>
                          <div class="add-certificacion">
                            <input 
                              type="text" 
                              id="nuevaCertificacion"
                              #nuevaCert
                              placeholder="Nueva certificación..."
                              (keyup.enter)="agregarCertificacionPersonalizada(nuevaCert.value); nuevaCert.value = ''">
                            <button 
                              type="button" 
                              class="btn btn-small"
                              (click)="agregarCertificacionPersonalizada(nuevaCert.value); nuevaCert.value = ''">
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Observaciones -->
                    <div class="form-section full-width">
                      <div class="form-group">
                        <label for="observaciones">Observaciones</label>
                        <textarea 
                          id="observaciones" 
                          formControlName="observaciones" 
                          rows="3"
                          placeholder="Observaciones adicionales sobre el personal..."></textarea>
                      </div>
                    </div>
                  </div>
                </form>
              }
            </div>
            
            <div class="modal-footer">
              @if (modoModal() === 'ver') {
                <button class="btn btn-secondary" (click)="cerrarModal()">Cerrar</button>
                <button class="btn btn-primary" (click)="abrirModal('editar', personalSeleccionado())">
                  ✏️ Editar
                </button>
              } @else {
                <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                <button 
                  class="btn btn-primary" 
                  (click)="guardarPersonal()"
                  [disabled]="personalForm.invalid || guardando()">
                  {{guardando() ? 'Guardando...' : (modoModal() === 'crear' ? 'Crear Personal' : 'Actualizar Personal')}}
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .personal-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .personal-header {
      margin-bottom: 2rem;
    }

    .personal-header h1 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .personal-header p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
      border-left: 4px solid #3b82f6;
    }

    .stat-card.enfermeras {
      border-left-color: #10b981;
    }

    .stat-card.anestesiologos {
      border-left-color: #8b5cf6;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .personal-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      background: white;
      min-width: 150px;
    }

    .search-input {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      min-width: 250px;
    }

    .tabla-container {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .tabla-personal {
      width: 100%;
      border-collapse: collapse;
    }

    .tabla-personal th {
      background: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .tabla-personal td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }

    .tabla-personal tr:hover {
      background: #f9fafb;
    }

    .nombre-completo {
      min-width: 200px;
    }

    .tipo-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .tipo-badge.enfermera {
      background: #dcfce7;
      color: #166534;
    }

    .tipo-badge.anestesiologo {
      background: #ede9fe;
      color: #7c3aed;
    }

    .estado-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .estado-badge.activo {
      background: #dcfce7;
      color: #166534;
    }

    .estado-badge.inactivo {
      background: #f3f4f6;
      color: #6b7280;
    }

    .estado-badge.suspendido {
      background: #fee2e2;
      color: #dc2626;
    }

    .estado-badge.vacaciones {
      background: #fef3c7;
      color: #d97706;
    }

    .estado-badge.licencia {
      background: #dbeafe;
      color: #2563eb;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      padding: 0.5rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-icon:hover {
      transform: scale(1.1);
    }

    .btn-edit {
      background: #fef3c7;
    }

    .btn-view {
      background: #dbeafe;
    }

    .btn-delete {
      background: #fee2e2;
    }

    .empty-message {
      text-align: center;
      color: #6b7280;
      font-style: italic;
      padding: 3rem !important;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    /* Modal styles */
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
      border-radius: 0.75rem;
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
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    /* Vista de detalles */
    .vista-detalle {
      space-y: 1.5rem;
    }

    .detalle-section {
      margin-bottom: 1.5rem;
    }

    .detalle-section h4 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-size: 1.125rem;
      border-bottom: 2px solid #f3f4f6;
      padding-bottom: 0.5rem;
    }

    .detalle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .detalle-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detalle-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .detalle-item span {
      color: #6b7280;
    }

    .certificaciones-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .certificacion-badge {
      background: #f3f4f6;
      color: #374151;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }

    /* Formulario */
    .form-grid {
      display: grid;
      gap: 2rem;
    }

    .form-section {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }

    .form-section.full-width {
      grid-column: 1 / -1;
    }

    .form-section h4 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-message {
      color: #dc2626;
      font-size: 0.75rem;
    }

    .certificaciones-container {
      display: grid;
      gap: 1.5rem;
    }

    .certificaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
    }

    .certificacion-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .certificacion-checkbox:hover {
      background: #f3f4f6;
      border-radius: 0.25rem;
    }

    .add-certificacion {
      display: flex;
      gap: 0.5rem;
    }

    .add-certificacion input {
      flex: 1;
    }

    @media (max-width: 768px) {
      .personal-container {
        padding: 1rem;
      }

      .personal-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .filters {
        flex-direction: column;
      }

      .tabla-container {
        overflow-x: auto;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
        max-width: none;
      }
    }
  `]
})
export class PersonalComponent implements OnInit {
  // Signals
  personal = signal<Personal[]>([]);
  personalFiltrado = signal<Personal[]>([]);
  mostrarModal = signal(false);
  modoModal = signal<'crear' | 'editar' | 'ver'>('crear');
  personalSeleccionado = signal<Personal | undefined>(undefined);
  guardando = signal(false);
  certificacionesDisponibles = signal<string[]>([]);

  // Filtros
  filtroTipo = '';
  filtroEstado = '';
  terminoBusqueda = '';

  // Formulario
  personalForm: FormGroup;

  // Enums para template
  TipoPersonal = TipoPersonal;
  EstadoPersonal = EstadoPersonal;
  TipoDocumento = TipoDocumento;
  TurnoTrabajo = TurnoTrabajo;

  constructor(
    private personalService: PersonalService,
    private fb: FormBuilder
  ) {
    this.personalForm = this.crearFormulario();
  }

  async ngOnInit() {
    await this.cargarPersonal();
  }

  async cargarPersonal() {
    try {
      const personal = await this.personalService.obtenerPersonalSimple();
      this.personal.set(personal);
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando personal:', error);
    }
  }

  aplicarFiltros() {
    let personalFiltrado = [...this.personal()];

    // Filtro por tipo
    if (this.filtroTipo) {
      personalFiltrado = personalFiltrado.filter(p => p.tipoPersonal === this.filtroTipo);
    }

    // Filtro por estado
    if (this.filtroEstado) {
      personalFiltrado = personalFiltrado.filter(p => p.estado === this.filtroEstado);
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      personalFiltrado = personalFiltrado.filter(p => 
        p.nombres.toLowerCase().includes(termino) ||
        p.apellidos.toLowerCase().includes(termino) ||
        p.numeroDocumento.includes(termino) ||
        p.email.toLowerCase().includes(termino)
      );
    }

    this.personalFiltrado.set(personalFiltrado);
  }

  contarPorTipo(tipo: TipoPersonal): number {
    return this.personalFiltrado().filter(p => p.tipoPersonal === tipo).length;
  }

  abrirModal(modo: 'crear' | 'editar' | 'ver', personal?: Personal) {
    this.modoModal.set(modo);
    this.personalSeleccionado.set(personal || undefined);
    
    if (modo === 'crear') {
      this.personalForm.reset();
      this.personalForm.patchValue({
        tipoDocumento: TipoDocumento.CEDULA,
        estado: EstadoPersonal.ACTIVO,
        turnoPreferido: TurnoTrabajo.MANANA,
        experienciaAnios: 0,
        salarioBase: 2000000
      });
      this.certificacionesDisponibles.set([]);
    } else if (modo === 'editar' && personal) {
      this.personalForm.patchValue({
        ...personal,
        fechaNacimiento: this.formatearFechaParaInput(personal.fechaNacimiento),
        fechaIngreso: this.formatearFechaParaInput(personal.fechaIngreso)
      });
      this.actualizarCertificacionesDisponibles(personal.tipoPersonal);
    }
    
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.personalForm.reset();
    this.personalSeleccionado.set(undefined);
  }

  onTipoPersonalChange() {
    const tipoPersonal = this.personalForm.get('tipoPersonal')?.value;
    if (tipoPersonal) {
      this.actualizarCertificacionesDisponibles(tipoPersonal);
    }
  }

  actualizarCertificacionesDisponibles(tipo: TipoPersonal) {
    const certificaciones = this.personalService.getCertificacionesPorTipo(tipo);
    this.certificacionesDisponibles.set(certificaciones);
  }

  esCertificacionSeleccionada(certificacion: string): boolean {
    const certificacionesActuales = this.personalForm.get('certificaciones')?.value || [];
    return certificacionesActuales.includes(certificacion);
  }

  toggleCertificacion(certificacion: string, event: any) {
    const certificacionesActuales = this.personalForm.get('certificaciones')?.value || [];
    
    if (event.target.checked) {
      if (!certificacionesActuales.includes(certificacion)) {
        this.personalForm.patchValue({
          certificaciones: [...certificacionesActuales, certificacion]
        });
      }
    } else {
      this.personalForm.patchValue({
        certificaciones: certificacionesActuales.filter((c: string) => c !== certificacion)
      });
    }
  }

  agregarCertificacionPersonalizada(certificacion: string) {
    if (certificacion.trim()) {
      const certificacionesActuales = this.personalForm.get('certificaciones')?.value || [];
      if (!certificacionesActuales.includes(certificacion.trim())) {
        this.personalForm.patchValue({
          certificaciones: [...certificacionesActuales, certificacion.trim()]
        });
      }
    }
  }

  async guardarPersonal() {
    if (this.personalForm.valid) {
      this.guardando.set(true);
      
      try {
        const formData = this.personalForm.value;
        
        // Validar documento único
        const documentoValido = await this.personalService.validarDocumentoUnico(
          formData.numeroDocumento,
          this.personalSeleccionado()?.id
        );
        
        if (!documentoValido) {
          alert('El número de documento ya existe');
          this.guardando.set(false);
          return;
        }
        
        // Validar email único
        const emailValido = await this.personalService.validarEmailUnico(
          formData.email,
          this.personalSeleccionado()?.id
        );
        
        if (!emailValido) {
          alert('El email ya existe');
          this.guardando.set(false);
          return;
        }
        
        // Convertir fechas
        const personalData = {
          ...formData,
          fechaNacimiento: new Date(formData.fechaNacimiento),
          fechaIngreso: new Date(formData.fechaIngreso),
          certificaciones: formData.certificaciones || []
        };
        
        if (this.modoModal() === 'crear') {
          await this.personalService.crearPersonal(personalData);
        } else {
          const id = this.personalSeleccionado()?.id;
          if (id) {
            await this.personalService.actualizarPersonal(id, personalData);
          }
        }
        
        await this.cargarPersonal();
        this.cerrarModal();
        
      } catch (error) {
        console.error('Error guardando personal:', error);
        alert('Error al guardar el personal');
      } finally {
        this.guardando.set(false);
      }
    }
  }

  async confirmarEliminacion(personal: Personal) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${personal.nombres} ${personal.apellidos}?`)) {
      try {
        if (personal.id) {
          await this.personalService.eliminarPersonal(personal.id);
          await this.cargarPersonal();
        }
      } catch (error) {
        console.error('Error eliminando personal:', error);
        alert('Error al eliminar el personal');
      }
    }
  }

  // Utilidades
  getEstadoLabel(estado?: EstadoPersonal): string {
    const labels = {
      [EstadoPersonal.ACTIVO]: 'Activo',
      [EstadoPersonal.INACTIVO]: 'Inactivo',
      [EstadoPersonal.SUSPENDIDO]: 'Suspendido',
      [EstadoPersonal.VACACIONES]: 'En Vacaciones',
      [EstadoPersonal.LICENCIA]: 'En Licencia'
    };
    return estado ? labels[estado] : '';
  }

  getTurnoLabel(turno?: TurnoTrabajo): string {
    const labels = {
      [TurnoTrabajo.MANANA]: 'Mañana',
      [TurnoTrabajo.TARDE]: 'Tarde',
      [TurnoTrabajo.NOCHE]: 'Noche',
      [TurnoTrabajo.ROTATIVO]: 'Rotativo',
      [TurnoTrabajo.DISPONIBILIDAD_COMPLETA]: 'Disponibilidad Completa'
    };
    return turno ? labels[turno] : '';
  }

  formatearSalario(salario?: number): string {
    if (!salario) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '';
    return new Intl.DateTimeFormat('es-CO').format(fecha);
  }

  formatearFechaParaInput(fecha?: Date): string {
    if (!fecha) return '';
    return fecha.toISOString().split('T')[0];
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      tipoPersonal: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipoDocumento: [TipoDocumento.CEDULA, Validators.required],
      numeroDocumento: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      estado: [EstadoPersonal.ACTIVO, Validators.required],
      turnoPreferido: [TurnoTrabajo.MANANA, Validators.required],
      experienciaAnios: [0, [Validators.required, Validators.min(0)]],
      fechaIngreso: ['', Validators.required],
      salarioBase: [2000000, [Validators.required, Validators.min(0)]],
      certificaciones: [[]],
      observaciones: ['']
    });
  }
}