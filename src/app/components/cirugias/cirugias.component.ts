import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { CirugiaService } from '../../services/cirugia.service';
import { AuthService } from '../../services/auth.service';
import { 
  TipoCirugia, 
  RequisitoMinimo, 
  CategoriaCirugia, 
  NivelComplejidad, 
  TipoAnestesia, 
  TipoRequisito 
} from '../../models/cirugia.interface';

@Component({
  selector: 'app-cirugias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="cirugias-container">
      <div class="header">
        <h1>Gestión de Cirugías</h1>
        <div class="header-actions">
          <div class="view-toggles">
            <button 
              class="btn" 
              [class.btn-primary]="vistaActual === 'tipos'"
              [class.btn-outline]="vistaActual !== 'tipos'"
              (click)="cambiarVista('tipos')">
              🏥 Tipos de Cirugía
            </button>
            <button 
              class="btn" 
              [class.btn-primary]="vistaActual === 'estadisticas'"
              [class.btn-outline]="vistaActual !== 'estadisticas'"
              (click)="cambiarVista('estadisticas')">
              📊 Estadísticas
            </button>
          </div>
          <button class="btn btn-primary" (click)="abrirModalTipoCirugia()" *ngIf="vistaActual === 'tipos'">
            + Nuevo Tipo de Cirugía
          </button>
        </div>
      </div>

      <!-- Filtros para tipos de cirugía -->
      <div class="filters-section" *ngIf="vistaActual === 'tipos'">
        <div class="filters-row">
          <div class="filter-group">
            <label>Categoría:</label>
            <select [(ngModel)]="filtros.categoria" (change)="aplicarFiltros()">
              <option value="">Todas las categorías</option>
              <option value="facial">Facial</option>
              <option value="corporal">Corporal</option>
              <option value="mamaria">Mamaria</option>
              <option value="intima">Íntima</option>
              <option value="reconstructiva">Reconstructiva</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Complejidad:</label>
            <select [(ngModel)]="filtros.complejidad" (change)="aplicarFiltros()">
              <option value="">Todas las complejidades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="muy-alta">Muy Alta</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Anestesia:</label>
            <select [(ngModel)]="filtros.anestesia" (change)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="local">Local</option>
              <option value="sedacion">Sedación</option>
              <option value="regional">Regional</option>
              <option value="general">General</option>
            </select>
          </div>
          <button class="btn btn-outline" (click)="limpiarFiltros()">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Vista Tipos de Cirugía -->
      <div *ngIf="vistaActual === 'tipos'" class="tipos-container">
        <div class="table-container">
          <table class="cirugias-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Complejidad</th>
                <th>Duración</th>
                <th>Anestesia</th>
                <th>Costo Base</th>
                <th>Requisitos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tipo of tiposFiltrados()" class="tipo-row">
                <td>
                  <div class="tipo-info">
                    <strong>{{ tipo.nombre }}</strong>
                    <small>{{ tipo.descripcion }}</small>
                  </div>
                </td>
                <td>
                  <span class="badge badge-categoria" [class]="'categoria-' + tipo.categoria">
                    {{ obtenerTextoCategoria(tipo.categoria) }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-complejidad" [class]="'complejidad-' + tipo.nivelComplejidad">
                    {{ obtenerTextoComplejidad(tipo.nivelComplejidad) }}
                  </span>
                </td>
                <td>{{ tipo.duracionEstimada }} min</td>
                <td>{{ obtenerTextoAnestesia(tipo.anestesia) }}</td>
                <td>{{ formatearMoneda(tipo.costoBase) }}</td>
                <td>
                  <span class="badge badge-info">{{ tipo.checklistRequisitos.length }} requisitos</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" (click)="verDetalleTipo(tipo)" title="Ver Detalles">👁️</button>
                    <button class="btn btn-sm btn-primary" (click)="editarTipo(tipo)" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminarTipo(tipo)" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="tiposFiltrados().length === 0" class="no-results">
            <p>No se encontraron tipos de cirugía que coincidan con los filtros aplicados.</p>
            <button class="btn btn-primary" (click)="abrirModalTipoCirugia()">
              Crear primer tipo de cirugía
            </button>
          </div>
        </div>
      </div>

      <!-- Vista Estadísticas -->
      <div *ngIf="vistaActual === 'estadisticas'" class="estadisticas-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏥</div>
            <div class="stat-content">
              <h3>{{ estadisticas.totalTipos }}</h3>
              <p>Tipos de Cirugía</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👨‍⚕️</div>
            <div class="stat-content">
              <h3>{{ estadisticas.porCategoria?.facial || 0 }}</h3>
              <p>Cirugías Faciales</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💪</div>
            <div class="stat-content">
              <h3>{{ estadisticas.porCategoria?.corporal || 0 }}</h3>
              <p>Cirugías Corporales</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👩‍⚕️</div>
            <div class="stat-content">
              <h3>{{ estadisticas.porCategoria?.mamaria || 0 }}</h3>
              <p>Cirugías Mamarias</p>
            </div>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-section">
            <h3>Distribución por Complejidad</h3>
            <div class="complexity-chart">
              <div class="complexity-item">
                <span class="complexity-label">Baja:</span>
                <div class="complexity-bar">
                  <div class="complexity-fill complejidad-baja" 
                       [style.width.%]="calcularPorcentajeComplejidad('baja')">
                  </div>
                </div>
                <span class="complexity-value">{{ estadisticas.porComplejidad?.baja || 0 }}</span>
              </div>
              <div class="complexity-item">
                <span class="complexity-label">Media:</span>
                <div class="complexity-bar">
                  <div class="complexity-fill complejidad-media" 
                       [style.width.%]="calcularPorcentajeComplejidad('media')">
                  </div>
                </div>
                <span class="complexity-value">{{ estadisticas.porComplejidad?.media || 0 }}</span>
              </div>
              <div class="complexity-item">
                <span class="complexity-label">Alta:</span>
                <div class="complexity-bar">
                  <div class="complexity-fill complejidad-alta" 
                       [style.width.%]="calcularPorcentajeComplejidad('alta')">
                  </div>
                </div>
                <span class="complexity-value">{{ estadisticas.porComplejidad?.alta || 0 }}</span>
              </div>
              <div class="complexity-item">
                <span class="complexity-label">Muy Alta:</span>
                <div class="complexity-bar">
                  <div class="complexity-fill complejidad-muy-alta" 
                       [style.width.%]="calcularPorcentajeComplejidad('muyAlta')">
                  </div>
                </div>
                <span class="complexity-value">{{ estadisticas.porComplejidad?.muyAlta || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Nuevo/Editar Tipo de Cirugía -->
      <div class="modal" [class.active]="mostrarModal()" (click)="cerrarModal()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ modoConsulta() ? 'Detalles del Tipo de Cirugía' : (modoEdicion() ? 'Editar Tipo de Cirugía' : 'Nuevo Tipo de Cirugía') }}</h2>
            <button class="close-btn" (click)="cerrarModal()">×</button>
          </div>

          <form [formGroup]="tipoCirugiaForm" (ngSubmit)="guardarTipoCirugia()" class="tipo-form">
            <div class="form-sections">
              <!-- Sección Información Básica -->
              <div class="form-section">
                <h3>Información Básica</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Nombre de la Cirugía *</label>
                    <input type="text" formControlName="nombre" placeholder="Ej: Rinoplastia">
                    <div class="error" *ngIf="tipoCirugiaForm.get('nombre')?.invalid && tipoCirugiaForm.get('nombre')?.touched">
                      El nombre es obligatorio
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Categoría *</label>
                    <select formControlName="categoria">
                      <option value="">Seleccionar categoría</option>
                      <option value="facial">Facial</option>
                      <option value="corporal">Corporal</option>
                      <option value="mamaria">Mamaria</option>
                      <option value="intima">Íntima</option>
                      <option value="reconstructiva">Reconstructiva</option>
                    </select>
                    <div class="error" *ngIf="tipoCirugiaForm.get('categoria')?.invalid && tipoCirugiaForm.get('categoria')?.touched">
                      La categoría es obligatoria
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Descripción *</label>
                  <textarea 
                    formControlName="descripcion" 
                    placeholder="Descripción detallada del procedimiento"
                    rows="3">
                  </textarea>
                  <div class="error" *ngIf="tipoCirugiaForm.get('descripcion')?.invalid && tipoCirugiaForm.get('descripcion')?.touched">
                    La descripción es obligatoria
                  </div>
                </div>
              </div>

              <!-- Sección Detalles Técnicos -->
              <div class="form-section">
                <h3>Detalles Técnicos</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Duración Estimada (minutos) *</label>
                    <input type="number" formControlName="duracionEstimada" min="15" max="600" placeholder="120">
                    <div class="error" *ngIf="tipoCirugiaForm.get('duracionEstimada')?.invalid && tipoCirugiaForm.get('duracionEstimada')?.touched">
                      La duración debe ser entre 15 y 600 minutos
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Costo Base (COP) *</label>
                    <input type="number" formControlName="costoBase" min="0" step="10000" placeholder="3500000">
                    <div class="error" *ngIf="tipoCirugiaForm.get('costoBase')?.invalid && tipoCirugiaForm.get('costoBase')?.touched">
                      El costo base es obligatorio
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Nivel de Complejidad *</label>
                    <select formControlName="nivelComplejidad">
                      <option value="">Seleccionar complejidad</option>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="muy-alta">Muy Alta</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>Tipo de Anestesia *</label>
                    <select formControlName="anestesia">
                      <option value="">Seleccionar anestesia</option>
                      <option value="local">Local</option>
                      <option value="sedacion">Sedación</option>
                      <option value="regional">Regional</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tiempo de Recuperación (días) *</label>
                    <input type="number" formControlName="tiempoRecuperacion" min="1" max="365" placeholder="14">
                  </div>
                  
                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" formControlName="hospitalizacion">
                      <span class="checkmark"></span>
                      Requiere hospitalización
                    </label>
                  </div>
                </div>
              </div>

              <!-- Sección Checklist de Requisitos -->
              <div class="form-section">
                <h3>Checklist de Requisitos Mínimos</h3>
                <p class="section-description">
                  Define los exámenes y requisitos que debe cumplir el paciente antes de la cirugía
                </p>
                
                <div class="requisitos-container" formArrayName="checklistRequisitos">
                  <div class="requisito-item" 
                       *ngFor="let req of getChecklistRequisitos().controls; let i = index"
                       [formGroupName]="i">
                    <div class="requisito-header">
                      <div class="form-row">
                        <div class="form-group">
                          <label>Nombre del Requisito *</label>
                          <input type="text" formControlName="nombre" placeholder="Ej: Hemograma Completo">
                        </div>
                        <div class="form-group">
                          <label>Tipo *</label>
                          <select formControlName="tipo">
                            <option value="examen-laboratorio">Examen de Laboratorio</option>
                            <option value="examen-imagen">Examen de Imagen</option>
                            <option value="valoracion-medica">Valoración Médica</option>
                            <option value="documento">Documento</option>
                            <option value="autorizacion">Autorización</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Descripción</label>
                        <textarea formControlName="descripcion" 
                                  placeholder="Descripción detallada del requisito"
                                  rows="2">
                        </textarea>
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label>Validez (días)</label>
                          <input type="number" formControlName="validezDias" 
                                 placeholder="30" min="1" max="365">
                          <small>Dejar vacío si no tiene vencimiento</small>
                        </div>
                        
                        <div class="form-group checkbox-group">
                          <label class="checkbox-label">
                            <input type="checkbox" formControlName="obligatorio">
                            <span class="checkmark"></span>
                            Requisito obligatorio
                          </label>
                        </div>
                      </div>
                      
                      <div class="requisito-actions">
                        <button type="button" class="btn btn-sm btn-danger" 
                                (click)="eliminarRequisito(i)"
                                [disabled]="getChecklistRequisitos().length <= 1">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button type="button" class="btn btn-outline" (click)="agregarRequisito()">
                    + Agregar Requisito
                  </button>
                </div>
              </div>

              <!-- Sección Preparación y Cuidados -->
              <div class="form-section">
                <h3>Preparación y Cuidados</h3>
                
                <div class="form-group">
                  <label>Preparación Preoperatoria</label>
                  <div class="lista-items" formArrayName="preparacionPreoperatoria">
                    <div class="item-input" 
                         *ngFor="let item of getPreparacionPreoperatoria().controls; let i = index">
                      <input type="text" [formControlName]="i" placeholder="Instrucción de preparación">
                      <button type="button" class="btn btn-sm btn-danger" 
                              (click)="eliminarPreparacion(i)"
                              [disabled]="getPreparacionPreoperatoria().length <= 1">
                        ×
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline" (click)="agregarPreparacion()">
                    + Agregar instrucción
                  </button>
                </div>
                
                <div class="form-group">
                  <label>Cuidados Postoperatorios</label>
                  <div class="lista-items" formArrayName="cuidadosPostoperatorios">
                    <div class="item-input" 
                         *ngFor="let item of getCuidadosPostoperatorios().controls; let i = index">
                      <input type="text" [formControlName]="i" placeholder="Cuidado postoperatorio">
                      <button type="button" class="btn btn-sm btn-danger" 
                              (click)="eliminarCuidado(i)"
                              [disabled]="getCuidadosPostoperatorios().length <= 1">
                        ×
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline" (click)="agregarCuidado()">
                    + Agregar cuidado
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                {{ modoConsulta() ? 'Cerrar' : 'Cancelar' }}
              </button>
              <button type="submit" class="btn btn-primary" 
                      [disabled]="tipoCirugiaForm.invalid || guardando()" 
                      *ngIf="!modoConsulta()">
                {{ guardando() ? 'Guardando...' : (modoEdicion() ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cirugias-container {
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

    /* Tabla */
    .table-container {
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .cirugias-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cirugias-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .cirugias-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }

    .tipo-row:hover {
      background: #f8fafc;
    }

    .tipo-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tipo-info strong {
      color: #1f2937;
      font-size: 1rem;
    }

    .tipo-info small {
      color: #6b7280;
      font-size: 0.875rem;
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

    .badge-categoria {
      color: white;
    }

    .categoria-facial { background: #8b5cf6; }
    .categoria-corporal { background: #06b6d4; }
    .categoria-mamaria { background: #ec4899; }
    .categoria-intima { background: #f59e0b; }
    .categoria-reconstructiva { background: #10b981; }

    .badge-complejidad {
      color: white;
    }

    .complejidad-baja { background: #10b981; }
    .complejidad-media { background: #f59e0b; }
    .complejidad-alta { background: #ef4444; }
    .complejidad-muy-alta { background: #7c2d12; }

    .badge-info { 
      background: #dbeafe; 
      color: #1e40af; 
    }

    /* Estadísticas */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      padding: 0.75rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      color: #1f2937;
      font-weight: 700;
    }

    .stat-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Gráficos */
    .charts-container {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }

    .complexity-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .complexity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .complexity-label {
      min-width: 80px;
      font-weight: 500;
      color: #374151;
    }

    .complexity-bar {
      flex: 1;
      height: 20px;
      background: #f3f4f6;
      border-radius: 10px;
      overflow: hidden;
    }

    .complexity-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 10px;
    }

    .complexity-value {
      min-width: 30px;
      text-align: right;
      font-weight: 600;
      color: #1f2937;
    }

    /* Modal */
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

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: white;
      border-radius: 1.5rem;
      width: 100%;
      max-width: 800px;
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
      max-width: 1000px;
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

    /* Formulario */
    .tipo-form {
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

    .section-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      font-style: italic;
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
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
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

    /* Checkbox */
    .checkbox-group {
      justify-content: center;
    }

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

    /* Requisitos */
    .requisitos-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .requisito-item {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.75rem;
      padding: 1rem;
    }

    .requisito-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .requisito-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }

    /* Lista de items */
    .lista-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .item-input {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .item-input input {
      flex: 1;
    }

    .item-input .btn {
      min-width: auto;
      padding: 0.5rem;
      height: auto;
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

    /* Responsive */
    @media (max-width: 768px) {
      .cirugias-container {
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

      .cirugias-table {
        min-width: 800px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .complexity-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .complexity-label {
        min-width: auto;
      }

      .modal {
        padding: 0.5rem;
      }

      .modal-content {
        max-height: calc(100vh - 1rem);
      }
    }
  `]
})
export class CirugiasComponent implements OnInit {
  // Signals
  tiposCirugia = signal<TipoCirugia[]>([]);
  tiposFiltrados = signal<TipoCirugia[]>([]);
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  modoConsulta = signal(false);
  guardando = signal(false);
  estadisticas: any = {};

  // Formularios
  tipoCirugiaForm: FormGroup;
  tipoEditando: TipoCirugia | null = null;

  // Vista y filtros
  vistaActual: 'tipos' | 'estadisticas' = 'tipos';
  filtros = {
    categoria: '',
    complejidad: '',
    anestesia: ''
  };

  constructor(
    private fb: FormBuilder,
    private cirugiaService: CirugiaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.tipoCirugiaForm = this.crearFormulario();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoria: ['', Validators.required],
      duracionEstimada: [120, [Validators.required, Validators.min(15), Validators.max(600)]],
      costoBase: [0, [Validators.required, Validators.min(0)]],
      nivelComplejidad: ['', Validators.required],
      anestesia: ['', Validators.required],
      hospitalizacion: [false],
      tiempoRecuperacion: [14, [Validators.required, Validators.min(1), Validators.max(365)]],
      checklistRequisitos: this.fb.array([]),
      preparacionPreoperatoria: this.fb.array([]),
      cuidadosPostoperatorios: this.fb.array([])
    });
  }

  // Form Arrays Getters
  getChecklistRequisitos(): FormArray {
    return this.tipoCirugiaForm.get('checklistRequisitos') as FormArray;
  }

  getPreparacionPreoperatoria(): FormArray {
    return this.tipoCirugiaForm.get('preparacionPreoperatoria') as FormArray;
  }

  getCuidadosPostoperatorios(): FormArray {
    return this.tipoCirugiaForm.get('cuidadosPostoperatorios') as FormArray;
  }

  async cargarDatos() {
    try {
      // Cargar tipos de cirugía usando método sin índice
      this.cirugiaService.obtenerTiposCirugiaObservable().subscribe(tipos => {
        this.tiposCirugia.set(tipos);
        this.aplicarFiltros();
      });

      // Cargar estadísticas
      this.estadisticas = await this.cirugiaService.obtenerEstadisticasCirugias();
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  // Métodos de vista
  cambiarVista(vista: 'tipos' | 'estadisticas') {
    this.vistaActual = vista;
    if (vista === 'estadisticas') {
      this.cargarEstadisticas();
    }
  }

  async cargarEstadisticas() {
    try {
      this.estadisticas = await this.cirugiaService.obtenerEstadisticasCirugias();
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  // Métodos de filtros
  aplicarFiltros() {
    let tiposFiltrados = [...this.tiposCirugia()];

    if (this.filtros.categoria) {
      tiposFiltrados = tiposFiltrados.filter(tipo => tipo.categoria === this.filtros.categoria);
    }

    if (this.filtros.complejidad) {
      tiposFiltrados = tiposFiltrados.filter(tipo => tipo.nivelComplejidad === this.filtros.complejidad);
    }

    if (this.filtros.anestesia) {
      tiposFiltrados = tiposFiltrados.filter(tipo => tipo.anestesia === this.filtros.anestesia);
    }

    this.tiposFiltrados.set(tiposFiltrados);
  }

  limpiarFiltros() {
    this.filtros = {
      categoria: '',
      complejidad: '',
      anestesia: ''
    };
    this.aplicarFiltros();
  }

  // Métodos del modal
  abrirModalTipoCirugia() {
    this.modoEdicion.set(false);
    this.modoConsulta.set(false);
    this.tipoEditando = null;
    this.resetFormulario();
    this.mostrarModal.set(true);
  }

  editarTipo(tipo: TipoCirugia) {
    this.modoEdicion.set(true);
    this.modoConsulta.set(false);
    this.tipoEditando = tipo;
    this.cargarDatosEnFormulario(tipo);
    this.mostrarModal.set(true);
  }

  verDetalleTipo(tipo: TipoCirugia) {
    this.modoEdicion.set(false);
    this.modoConsulta.set(true);
    this.tipoEditando = tipo;
    this.cargarDatosEnFormulario(tipo);
    this.tipoCirugiaForm.disable();
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.modoConsulta.set(false);
    this.tipoCirugiaForm.enable();
  }

  // Métodos del formulario
  resetFormulario() {
    this.tipoCirugiaForm.reset({
      duracionEstimada: 120,
      costoBase: 0,
      hospitalizacion: false,
      tiempoRecuperacion: 14
    });

    // Limpiar arrays
    this.getChecklistRequisitos().clear();
    this.getPreparacionPreoperatoria().clear();
    this.getCuidadosPostoperatorios().clear();

    // Agregar elementos por defecto
    this.agregarRequisito();
    this.agregarPreparacion();
    this.agregarCuidado();
  }

  cargarDatosEnFormulario(tipo: TipoCirugia) {
    this.tipoCirugiaForm.patchValue({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      categoria: tipo.categoria,
      duracionEstimada: tipo.duracionEstimada,
      costoBase: tipo.costoBase,
      nivelComplejidad: tipo.nivelComplejidad,
      anestesia: tipo.anestesia,
      hospitalizacion: tipo.hospitalizacion,
      tiempoRecuperacion: tipo.tiempoRecuperacion
    });

    // Cargar requisitos
    this.getChecklistRequisitos().clear();
    tipo.checklistRequisitos.forEach(req => {
      this.getChecklistRequisitos().push(this.fb.group({
        id: [req.id],
        nombre: [req.nombre, Validators.required],
        descripcion: [req.descripcion],
        tipo: [req.tipo, Validators.required],
        obligatorio: [req.obligatorio],
        validezDias: [req.validezDias],
        observaciones: [req.observaciones]
      }));
    });

    // Cargar preparación
    this.getPreparacionPreoperatoria().clear();
    tipo.preparacionPreoperatoria.forEach(prep => {
      this.getPreparacionPreoperatoria().push(this.fb.control(prep));
    });

    // Cargar cuidados
    this.getCuidadosPostoperatorios().clear();
    tipo.cuidadosPostoperatorios.forEach(cuidado => {
      this.getCuidadosPostoperatorios().push(this.fb.control(cuidado));
    });
  }

  // Métodos para manejar arrays dinámicos
  agregarRequisito() {
    const requisito = this.fb.group({
      id: [this.generarIdRequisito()],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo: ['examen-laboratorio', Validators.required],
      obligatorio: [true],
      validezDias: [30],
      observaciones: ['']
    });
    this.getChecklistRequisitos().push(requisito);
  }

  eliminarRequisito(index: number) {
    if (this.getChecklistRequisitos().length > 1) {
      this.getChecklistRequisitos().removeAt(index);
    }
  }

  agregarPreparacion() {
    this.getPreparacionPreoperatoria().push(this.fb.control(''));
  }

  eliminarPreparacion(index: number) {
    if (this.getPreparacionPreoperatoria().length > 1) {
      this.getPreparacionPreoperatoria().removeAt(index);
    }
  }

  agregarCuidado() {
    this.getCuidadosPostoperatorios().push(this.fb.control(''));
  }

  eliminarCuidado(index: number) {
    if (this.getCuidadosPostoperatorios().length > 1) {
      this.getCuidadosPostoperatorios().removeAt(index);
    }
  }

  generarIdRequisito(): string {
    return 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async guardarTipoCirugia() {
    if (this.tipoCirugiaForm.invalid) return;

    this.guardando.set(true);

    try {
      const formData = this.tipoCirugiaForm.value;
      
      // Filtrar elementos vacíos de los arrays
      formData.preparacionPreoperatoria = formData.preparacionPreoperatoria.filter((item: string) => item.trim() !== '');
      formData.cuidadosPostoperatorios = formData.cuidadosPostoperatorios.filter((item: string) => item.trim() !== '');
      
      const tipoCirugia: Omit<TipoCirugia, 'id'> = {
        ...formData,
        fechaCreacion: this.modoEdicion() ? this.tipoEditando!.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        creadoPor: 'current-user-id' // TODO: Obtener del AuthService
      };

      if (this.modoEdicion() && this.tipoEditando) {
        await this.cirugiaService.actualizarTipoCirugia(this.tipoEditando.id!, tipoCirugia);
      } else {
        await this.cirugiaService.crearTipoCirugia(tipoCirugia);
      }

      this.cargarDatos();
      this.cerrarModal();
      
      const mensaje = this.modoEdicion() ? 'Tipo de cirugía actualizado exitosamente' : 'Tipo de cirugía creado exitosamente';
      alert(mensaje);
    } catch (error) {
      console.error('Error guardando tipo de cirugía:', error);
      alert('Error al guardar el tipo de cirugía');
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminarTipo(tipo: TipoCirugia) {
    if (confirm(`¿Está seguro de que desea eliminar el tipo de cirugía "${tipo.nombre}"?`)) {
      try {
        await this.cirugiaService.eliminarTipoCirugia(tipo.id!);
        this.cargarDatos();
        alert('Tipo de cirugía eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando tipo de cirugía:', error);
        alert('Error al eliminar el tipo de cirugía');
      }
    }
  }

  // Métodos de utilidad
  obtenerTextoCategoria(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'facial': 'Facial',
      'corporal': 'Corporal',
      'mamaria': 'Mamaria',
      'intima': 'Íntima',
      'reconstructiva': 'Reconstructiva'
    };
    return categorias[categoria] || categoria;
  }

  obtenerTextoComplejidad(complejidad: string): string {
    const complejidades: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'muy-alta': 'Muy Alta'
    };
    return complejidades[complejidad] || complejidad;
  }

  obtenerTextoAnestesia(anestesia: string): string {
    const anestesias: { [key: string]: string } = {
      'local': 'Local',
      'sedacion': 'Sedación',
      'regional': 'Regional',
      'general': 'General'
    };
    return anestesias[anestesia] || anestesia;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  calcularPorcentajeComplejidad(complejidad: string): number {
    const total = this.estadisticas.totalTipos || 1;
    const valor = this.estadisticas.porComplejidad?.[complejidad] || 0;
    return (valor / total) * 100;
  }
}