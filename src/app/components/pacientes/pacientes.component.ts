import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { FileUploadService } from '../../services/file-upload.service';
import { Paciente, HistorialMedico } from '../../models/paciente.interface';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="pacientes-container">
      <div class="header">
        <h1>Gestión de Pacientes</h1>
        <div class="header-actions">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              [(ngModel)]="terminoBusqueda"
              (input)="filtrarPacientes()"
              class="search-input">
            <span class="search-icon">🔍</span>
          </div>
          <button class="btn btn-primary" (click)="abrirModalPaciente()">
            + Nuevo Paciente
          </button>
        </div>
      </div>

      <!-- Lista de Pacientes -->
      <div class="pacientes-grid">
        <div class="paciente-card" *ngFor="let paciente of pacientesFiltrados()" (click)="seleccionarPaciente(paciente)">
          <div class="paciente-info">
            <div class="paciente-avatar">
              <img *ngIf="paciente.fotoPerfilUrl" [src]="paciente.fotoPerfilUrl" alt="Foto">
              <span *ngIf="!paciente.fotoPerfilUrl" class="avatar-placeholder">{{obtenerIniciales(paciente)}}</span>
            </div>
            <div class="paciente-datos">
              <h3>{{paciente.nombres}} {{paciente.apellidos}}</h3>
              <p class="documento">{{paciente.tipoDocumento}}: {{paciente.numeroDocumento}}</p>
              <p class="edad">{{paciente.edad}} años</p>
              <p class="telefono">📞 {{paciente.telefono}}</p>
            </div>
          </div>
          <div class="paciente-actions">
            <button class="btn btn-sm btn-outline" (click)="verHistorial(paciente); $event.stopPropagation()">
              Historial
            </button>
            <button class="btn btn-sm btn-secondary" (click)="editarPaciente(paciente); $event.stopPropagation()">
              Editar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Paciente -->
      <div class="modal" [class.active]="mostrarModal()" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{modoEdicion() ? 'Editar Paciente' : 'Nuevo Paciente'}}</h2>
            <button class="close-btn" (click)="cerrarModal()">×</button>
          </div>

          <form [formGroup]="pacienteForm" (ngSubmit)="guardarPaciente()" class="paciente-form">
            <!-- Datos Personales -->
            <div class="form-section">
              <h3>Datos Personales</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Nombres *</label>
                  <input type="text" formControlName="nombres" placeholder="Nombres">
                  <div class="error" *ngIf="pacienteForm.get('nombres')?.invalid && pacienteForm.get('nombres')?.touched">
                    Los nombres son obligatorios
                  </div>
                </div>
                <div class="form-group">
                  <label>Apellidos *</label>
                  <input type="text" formControlName="apellidos" placeholder="Apellidos">
                  <div class="error" *ngIf="pacienteForm.get('apellidos')?.invalid && pacienteForm.get('apellidos')?.touched">
                    Los apellidos son obligatorios
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tipo de Documento *</label>
                  <select formControlName="tipoDocumento">
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PP">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Número de Documento *</label>
                  <input type="text" formControlName="numeroDocumento" placeholder="Número de documento">
                  <div class="error" *ngIf="errorDocumento()">
                    {{errorDocumento()}}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input type="date" formControlName="fechaNacimiento" (change)="calcularEdad()">
                </div>
                <div class="form-group">
                  <label>Género *</label>
                  <select formControlName="genero">
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Peso (kg) *</label>
                  <input type="number" formControlName="peso" placeholder="Peso en kg" min="1" max="300">
                </div>
                <div class="form-group">
                  <label>Altura (cm) *</label>
                  <input type="number" formControlName="altura" placeholder="Altura en cm" min="50" max="250">
                </div>
              </div>
            </div>

            <!-- Contacto -->
            <div class="form-section">
              <h3>Información de Contacto</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Teléfono *</label>
                  <input type="tel" formControlName="telefono" placeholder="Número de teléfono">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="email" placeholder="Correo electrónico">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Dirección</label>
                  <input type="text" formControlName="direccion" placeholder="Dirección completa">
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <input type="text" formControlName="ciudad" placeholder="Ciudad">
                </div>
              </div>
            </div>

            <!-- Contacto de Emergencia -->
            <div class="form-section" formGroupName="contactoEmergencia">
              <h3>Contacto de Emergencia</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre *</label>
                  <input type="text" formControlName="nombre" placeholder="Nombre completo">
                </div>
                <div class="form-group">
                  <label>Teléfono *</label>
                  <input type="tel" formControlName="telefono" placeholder="Teléfono">
                </div>
              </div>
              <div class="form-group">
                <label>Relación *</label>
                <input type="text" formControlName="relacion" placeholder="Padre, madre, esposo/a, hermano/a, etc.">
              </div>
            </div>

            <!-- Información Médica -->
            <div class="form-section">
              <h3>Información Médica</h3>
              
              <div class="form-group">
                <label>Alergias</label>
                <div class="tags-input">
                  <div class="tags" formArrayName="alergias">
                    <span class="tag" *ngFor="let alergia of alergias.controls; let i = index">
                      {{alergia.value}}
                      <button type="button" (click)="eliminarAlergia(i)" class="tag-remove">×</button>
                    </span>
                  </div>
                  <input type="text" #nuevaAlergia placeholder="Agregar alergia..." 
                         (keyup.enter)="agregarAlergia(nuevaAlergia.value); nuevaAlergia.value = ''">
                </div>
              </div>

              <div class="form-group">
                <label>Medicamentos Actuales</label>
                <div class="tags-input">
                  <div class="tags" formArrayName="medicamentosActuales">
                    <span class="tag" *ngFor="let medicamento of medicamentosActuales.controls; let i = index">
                      {{medicamento.value}}
                      <button type="button" (click)="eliminarMedicamento(i)" class="tag-remove">×</button>
                    </span>
                  </div>
                  <input type="text" #nuevoMedicamento placeholder="Agregar medicamento..." 
                         (keyup.enter)="agregarMedicamento(nuevoMedicamento.value); nuevoMedicamento.value = ''">
                </div>
              </div>

              <div class="form-group">
                <label>Antecedentes Médicos</label>
                <div class="tags-input">
                  <div class="tags" formArrayName="antecedentesMedicos">
                    <span class="tag" *ngFor="let antecedente of antecedentesMedicos.controls; let i = index">
                      {{antecedente.value}}
                      <button type="button" (click)="eliminarAntecedente(i)" class="tag-remove">×</button>
                    </span>
                  </div>
                  <input type="text" #nuevoAntecedente placeholder="Agregar antecedente..." 
                         (keyup.enter)="agregarAntecedente(nuevoAntecedente.value); nuevoAntecedente.value = ''">
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="pacienteForm.invalid || guardando()">
                {{guardando() ? 'Guardando...' : (modoEdicion() ? 'Actualizar' : 'Crear')}}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Historial -->
      <div class="modal" [class.active]="mostrarHistorial()" (click)="cerrarHistorial()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Historial Médico - {{pacienteSeleccionado()?.nombres}} {{pacienteSeleccionado()?.apellidos}}</h2>
            <button class="close-btn" (click)="cerrarHistorial()">×</button>
          </div>

          <div class="historial-content">
            <div class="paciente-resumen">
              <div class="paciente-datos-basic">
                <h4>Información del Paciente</h4>
                <p><strong>Documento:</strong> {{pacienteSeleccionado()?.tipoDocumento}} {{pacienteSeleccionado()?.numeroDocumento}}</p>
                <p><strong>Edad:</strong> {{pacienteSeleccionado()?.edad}} años</p>
                <p><strong>Peso:</strong> {{pacienteSeleccionado()?.peso}} kg</p>
                <p><strong>Altura:</strong> {{pacienteSeleccionado()?.altura}} cm</p>
                <p><strong>Teléfono:</strong> {{pacienteSeleccionado()?.telefono}}</p>
              </div>
              
              <div class="info-medica">
                <div *ngIf="pacienteSeleccionado()?.alergias?.length">
                  <strong>Alergias:</strong>
                  <span class="tag" *ngFor="let alergia of pacienteSeleccionado()?.alergias">{{alergia}}</span>
                </div>
                <div *ngIf="pacienteSeleccionado()?.medicamentosActuales?.length">
                  <strong>Medicamentos:</strong>
                  <span class="tag" *ngFor="let medicamento of pacienteSeleccionado()?.medicamentosActuales">{{medicamento}}</span>
                </div>
                <div *ngIf="pacienteSeleccionado()?.antecedentesMedicos?.length">
                  <strong>Antecedentes:</strong>
                  <span class="tag" *ngFor="let antecedente of pacienteSeleccionado()?.antecedentesMedicos">{{antecedente}}</span>
                </div>
              </div>
            </div>

            <div class="historial-lista">
              <h4>Historial de Procedimientos</h4>
              <div class="historial-item" *ngFor="let item of historialMedico()">
                <div class="historial-header">
                  <span class="historial-tipo" [class]="item.tipo">{{obtenerTipoTexto(item.tipo)}}</span>
                  <span class="historial-fecha">{{formatearFecha(item.fecha)}}</span>
                </div>
                <h5>{{item.titulo}}</h5>
                <p>{{item.descripcion}}</p>
                <div class="historial-medico" *ngIf="item.medico">
                  <strong>Médico:</strong> {{item.medico}}
                </div>
                <div class="historial-fotos" *ngIf="item.fotosAntesUrls?.length || item.fotosDespuesUrls?.length">
                  <div *ngIf="item.fotosAntesUrls?.length">
                    <strong>Fotos Antes:</strong>
                    <div class="fotos-grid">
                      <img *ngFor="let foto of item.fotosAntesUrls" [src]="foto" alt="Antes" class="historial-foto">
                    </div>
                  </div>
                  <div *ngIf="item.fotosDespuesUrls?.length">
                    <strong>Fotos Después:</strong>
                    <div class="fotos-grid">
                      <img *ngFor="let foto of item.fotosDespuesUrls" [src]="foto" alt="Después" class="historial-foto">
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="no-historial" *ngIf="historialMedico().length === 0">
                <p>No hay registros en el historial médico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pacientes-container {
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

    .search-box {
      position: relative;
    }

    .search-input {
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      width: 300px;
      font-size: 1rem;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }

    .pacientes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .paciente-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .paciente-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .paciente-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .paciente-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .paciente-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      font-size: 1.5rem;
      font-weight: bold;
      color: #6b7280;
    }

    .paciente-datos h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.2rem;
    }

    .paciente-datos p {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .paciente-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 1200px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .paciente-form {
      padding: 1.5rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.1rem;
      border-left: 4px solid #3b82f6;
      padding-left: 0.75rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .tags-input {
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      padding: 0.5rem;
      min-height: 3rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .tag {
      background: #e5e7eb;
      color: #374151;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .tag-remove {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      font-size: 1rem;
    }

    .tags-input input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 1rem;
      padding: 0.25rem;
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .btn-outline:hover {
      background: #3b82f6;
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Historial Styles */
    .historial-content {
      padding: 1.5rem;
    }

    .paciente-resumen {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }

    .paciente-datos-basic {
      margin-bottom: 1rem;
    }

    .paciente-datos-basic h4 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }

    .paciente-datos-basic p {
      margin: 0.5rem 0;
      color: #374151;
    }

    .info-medica > div {
      margin: 1rem 0;
    }

    .info-medica .tag {
      background: #dbeafe;
      color: #1e40af;
      margin-right: 0.5rem;
    }

    .historial-lista h4 {
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .historial-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .historial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .historial-tipo {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .historial-tipo.consulta {
      background: #dbeafe;
      color: #1e40af;
    }

    .historial-tipo.cirugia {
      background: #fecaca;
      color: #dc2626;
    }

    .historial-tipo.postoperatorio {
      background: #d1fae5;
      color: #065f46;
    }

    .historial-fecha {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .historial-item h5 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .historial-item p {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .historial-medico {
      color: #374151;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .fotos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .historial-foto {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .no-historial {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
      }

      .search-input {
        width: 100%;
      }

      .pacientes-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class PacientesComponent implements OnInit {
  pacienteForm: FormGroup;
  pacientes = signal<Paciente[]>([]);
  pacientesFiltrados = signal<Paciente[]>([]);
  pacienteSeleccionado = signal<Paciente | null>(null);
  historialMedico = signal<HistorialMedico[]>([]);
  
  mostrarModal = signal(false);
  mostrarHistorial = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  
  terminoBusqueda = '';
  pacienteEditando: Paciente | null = null;
  errorDocumento = signal('');

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private router: Router
  ) {
    this.pacienteForm = this.crearFormulario();
  }

  ngOnInit() {
    this.cargarPacientes();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(1), Validators.max(300)]],
      altura: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', Validators.email],
      direccion: [''],
      ciudad: [''],
      contactoEmergencia: this.fb.group({
        nombre: ['', Validators.required],
        telefono: ['', [Validators.required, Validators.minLength(10)]],
        relacion: ['', Validators.required]
      }),
      alergias: this.fb.array([]),
      medicamentosActuales: this.fb.array([]),
      antecedentesMedicos: this.fb.array([])
    });
  }

  get alergias() {
    return this.pacienteForm.get('alergias') as FormArray;
  }

  get medicamentosActuales() {
    return this.pacienteForm.get('medicamentosActuales') as FormArray;
  }

  get antecedentesMedicos() {
    return this.pacienteForm.get('antecedentesMedicos') as FormArray;
  }

  cargarPacientes() {
    this.pacienteService.obtenerPacientes().subscribe(pacientes => {
      this.pacientes.set(pacientes);
      this.filtrarPacientes();
    });
  }

  filtrarPacientes() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    const todos = this.pacientes();
    
    if (!termino) {
      this.pacientesFiltrados.set(todos);
      return;
    }

    const filtrados = todos.filter(paciente => 
      paciente.nombres.toLowerCase().includes(termino) ||
      paciente.apellidos.toLowerCase().includes(termino) ||
      paciente.numeroDocumento.includes(termino) ||
      paciente.telefono.includes(termino)
    );
    
    this.pacientesFiltrados.set(filtrados);
  }

  abrirModalPaciente() {
    this.modoEdicion.set(false);
    this.pacienteEditando = null;
    this.pacienteForm.reset();
    this.limpiarArrays();
    this.mostrarModal.set(true);
    this.errorDocumento.set('');
  }

  editarPaciente(paciente: Paciente) {
    this.modoEdicion.set(true);
    this.pacienteEditando = paciente;
    
    // Llenar el formulario
    this.pacienteForm.patchValue({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      fechaNacimiento: new Date(paciente.fechaNacimiento).toISOString().split('T')[0],
      genero: paciente.genero,
      peso: paciente.peso,
      altura: paciente.altura,
      telefono: paciente.telefono,
      email: paciente.email,
      direccion: paciente.direccion,
      ciudad: paciente.ciudad,
      contactoEmergencia: paciente.contactoEmergencia
    });

    // Llenar arrays
    this.limpiarArrays();
    paciente.alergias?.forEach(alergia => this.agregarAlergia(alergia));
    paciente.medicamentosActuales?.forEach(medicamento => this.agregarMedicamento(medicamento));
    paciente.antecedentesMedicos?.forEach(antecedente => this.agregarAntecedente(antecedente));

    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.pacienteForm.reset();
    this.errorDocumento.set('');
  }

  async guardarPaciente() {
    if (this.pacienteForm.invalid) return;

    this.guardando.set(true);
    this.errorDocumento.set('');

    try {
      const formData = this.pacienteForm.value;
      
      // Validar documento único
      const esUnico = await this.pacienteService.validarDocumentoUnico(
        formData.tipoDocumento,
        formData.numeroDocumento,
        this.pacienteEditando?.id
      );

      if (!esUnico) {
        this.errorDocumento.set('Ya existe un paciente con este documento');
        this.guardando.set(false);
        return;
      }

      // Calcular edad
      const edad = this.pacienteService.calcularEdad(new Date(formData.fechaNacimiento));

      const pacienteData: Omit<Paciente, 'id'> = {
        ...formData,
        edad,
        fechaNacimiento: new Date(formData.fechaNacimiento),
        estado: 'activo' as const,
        fechaCreacion: this.pacienteEditando?.fechaCreacion || new Date(),
        fechaActualizacion: new Date()
      };

      if (this.modoEdicion() && this.pacienteEditando) {
        await this.pacienteService.actualizarPaciente(this.pacienteEditando.id!, pacienteData);
      } else {
        await this.pacienteService.crearPaciente(pacienteData);
      }

      this.cerrarModal();
      this.cargarPacientes();
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      alert('Error al guardar el paciente. Intente nuevamente.');
    } finally {
      this.guardando.set(false);
    }
  }

  calcularEdad() {
    const fechaNac = this.pacienteForm.get('fechaNacimiento')?.value;
    if (fechaNac) {
      const edad = this.pacienteService.calcularEdad(new Date(fechaNac));
      // Solo para mostrar, no se guarda en el formulario
    }
  }

  // Métodos para manejar arrays
  agregarAlergia(valor: string) {
    if (valor.trim()) {
      this.alergias.push(this.fb.control(valor.trim()));
    }
  }

  eliminarAlergia(index: number) {
    this.alergias.removeAt(index);
  }

  agregarMedicamento(valor: string) {
    if (valor.trim()) {
      this.medicamentosActuales.push(this.fb.control(valor.trim()));
    }
  }

  eliminarMedicamento(index: number) {
    this.medicamentosActuales.removeAt(index);
  }

  agregarAntecedente(valor: string) {
    if (valor.trim()) {
      this.antecedentesMedicos.push(this.fb.control(valor.trim()));
    }
  }

  eliminarAntecedente(index: number) {
    this.antecedentesMedicos.removeAt(index);
  }

  limpiarArrays() {
    while (this.alergias.length !== 0) {
      this.alergias.removeAt(0);
    }
    while (this.medicamentosActuales.length !== 0) {
      this.medicamentosActuales.removeAt(0);
    }
    while (this.antecedentesMedicos.length !== 0) {
      this.antecedentesMedicos.removeAt(0);
    }
  }

  // Historial médico
  verHistorial(paciente: Paciente) {
    this.pacienteSeleccionado.set(paciente);
    this.pacienteService.obtenerHistorialPaciente(paciente.id!).subscribe(historial => {
      this.historialMedico.set(historial);
      this.mostrarHistorial.set(true);
    });
  }

  cerrarHistorial() {
    this.mostrarHistorial.set(false);
    this.pacienteSeleccionado.set(null);
  }

  seleccionarPaciente(paciente: Paciente) {
    // Aquí podrías navegar a una vista detallada del paciente
    console.log('Paciente seleccionado:', paciente);
  }

  // Utilidades
  obtenerIniciales(paciente: Paciente): string {
    return (paciente.nombres.charAt(0) + paciente.apellidos.charAt(0)).toUpperCase();
  }

  obtenerTipoTexto(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'consulta': 'Consulta',
      'cirugia': 'Cirugía',
      'postoperatorio': 'Postoperatorio',
      'otro': 'Otro'
    };
    return tipos[tipo] || tipo;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}