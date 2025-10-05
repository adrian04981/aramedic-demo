import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataSetupService } from '../../services/data-setup.service';
import { CitaSetupService } from '../../services/cita-setup.service';
import { PacienteService } from '../../services/paciente.service';
import { CitaService } from '../../services/cita.service';
import { CirugiaService } from '../../services/cirugia.service';
import { PersonalService } from '../../services/personal.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <div class="setup-header">
          <h1>🔧 Configuración de Datos de Prueba</h1>
          <p>{{setupMode() === 'citas' ? 'Sistema de setup para Citas y Agendamiento' : setupMode() === 'cirugias' ? 'Sistema de setup para Tipos de Cirugías' : setupMode() === 'personal' ? 'Sistema de setup para Personal Médico' : 'Sistema de setup para Pacientes y Usuarios'}}</p>
          
          <!-- Navegación entre modos -->
          <div class="setup-nav">
            <button 
              class="nav-btn" 
              [class.active]="setupMode() === 'pacientes'"
              (click)="cambiarModo('pacientes')">
              👥 Setup Pacientes
            </button>
            <button 
              class="nav-btn" 
              [class.active]="setupMode() === 'citas'"
              (click)="cambiarModo('citas')">
              📅 Setup Citas
            </button>
            <button 
              class="nav-btn" 
              [class.active]="setupMode() === 'cirugias'"
              (click)="cambiarModo('cirugias')">
              🏥 Setup Cirugías
            </button>
            <button 
              class="nav-btn" 
              [class.active]="setupMode() === 'personal'"
              (click)="cambiarModo('personal')">
              👨‍⚕️ Setup Personal
            </button>
          </div>
        </div>

        <div class="setup-content">
          <!-- Información del sistema -->
          <div class="info-section">
            <h3>📊 Estado Actual del Sistema</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">{{totalPacientes()}}</span>
                <span class="stat-label">Pacientes Registrados</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{totalHistoriales()}}</span>
                <span class="stat-label">Registros Médicos</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{totalCitas()}}</span>
                <span class="stat-label">Citas Programadas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{totalCirugias()}}</span>
                <span class="stat-label">Tipos de Cirugía</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{totalPersonal()}}</span>
                <span class="stat-label">Personal Médico</span>
              </div>
            </div>
          </div>

          <!-- Acciones de setup -->
          <div class="actions-section">
            <h3>⚙️ {{setupMode() === 'citas' ? 'Gestión de Citas de Prueba' : setupMode() === 'cirugias' ? 'Gestión de Tipos de Cirugías' : 'Gestión de Pacientes de Prueba'}}</h3>
            
            <!-- Sección de Pacientes (solo visible en modo pacientes) -->
            @if (setupMode() === 'pacientes') {
            <div class="action-card">
              <div class="action-info">
                <h4>🧑‍⚕️ Crear Pacientes Ficticios</h4>
                <p>Genera 8 pacientes de ejemplo con historiales médicos completos incluyendo consultas, cirugías y postoperatorios.</p>
                <ul>
                  <li>✅ Datos personales completos (contactos de emergencia, alergias, etc.)</li>
                  <li>✅ Historiales médicos diversos (rinoplastia, mamoplastia, liposucción)</li>
                  <li>✅ Medicamentos y observaciones médicas</li>
                  <li>✅ Fechas realistas de procedimientos</li>
                </ul>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-primary" 
                  (click)="crearPacientesFicticios()"
                  [disabled]="cargandoPacientes()">
                  {{cargandoPacientes() ? 'Creando...' : '+ Crear Pacientes'}}
                </button>
                <button 
                  class="btn btn-secondary" 
                  (click)="recrearDatosFicticios()"
                  [disabled]="cargandoPacientes()">
                  {{cargandoPacientes() ? 'Recreando...' : '🔄 Recrear Datos'}}
                </button>
              </div>
            </div>
            }

            <!-- Sección de Citas (solo visible en modo citas) -->
            @if (setupMode() === 'citas') {
            <div class="action-card primary">
              <div class="action-info">
                <h4>📅 Crear Datos de Citas</h4>
                <p>Genera citas médicas de prueba para diferentes fechas y estados para probar el sistema de agendamiento.</p>
                <div class="data-preview">
                  • 25-30 citas ficticias<br>
                  • Diferentes estados y tipos<br>
                  • Rangos de fechas variados<br>
                  • Asociadas a pacientes existentes
                </div>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-primary" 
                  (click)="crearDatosCitas()"
                  [disabled]="cargandoCitas()">
                  {{cargandoCitas() ? 'Creando...' : '✨ Crear Citas'}}
                </button>
                <button 
                  class="btn btn-secondary" 
                  (click)="limpiarCitas()"
                  [disabled]="cargandoCitas()">
                  {{cargandoCitas() ? 'Limpiando...' : '🗑️ Limpiar Citas'}}
                </button>
              </div>
            </div>
            }

            <!-- Sección de Cirugías (solo visible en modo cirugías) -->
            @if (setupMode() === 'cirugias') {
            <div class="action-card">
              <div class="action-info">
                <h4>🏥 Crear Tipos de Cirugías</h4>
                <p>Genera tipos de cirugías estéticas predefinidos con sus checklist de requisitos mínimos para una clínica estética.</p>
                <ul>
                  <li>✅ 10 tipos de cirugías comunes (Liposucción, Rinoplastia, Mamoplastia, etc.)</li>
                  <li>✅ Checklist de requisitos mínimos por cirugía</li>
                  <li>✅ Exámenes preoperatorios estándar</li>
                  <li>✅ Preparación y cuidados postoperatorios</li>
                  <li>✅ Niveles de complejidad y costos base</li>
                </ul>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-primary" 
                  (click)="crearTiposCirugias()"
                  [disabled]="cargandoCirugias()">
                  {{cargandoCirugias() ? 'Creando...' : '+ Crear Tipos de Cirugías'}}
                </button>
                <button 
                  class="btn btn-secondary" 
                  (click)="limpiarTiposCirugias()"
                  [disabled]="cargandoCirugias()">
                  {{cargandoCirugias() ? 'Limpiando...' : '🗑️ Limpiar Cirugías'}}
                </button>
              </div>
            </div>

            <!-- Sección de Índices de Firestore -->
            <div class="action-card">
              <div class="action-info">
                <h4>🔗 Configurar Índices de Firestore</h4>
                <p>Los índices son necesarios para consultas complejas en Firestore. Crea automáticamente los índices requeridos para el módulo de cirugías.</p>
                <div class="alert-warning">
                  <strong>⚠️ Importante:</strong> Los índices se crean en Firebase Console. Este botón te proporcionará los enlaces directos para crearlos.
                </div>
                <ul>
                  <li>🔍 Índice para tipos_cirugia (activo + nombre)</li>
                  <li>🔍 Índice para checklist_cirugias (idTipoCirugia + activo)</li>
                  <li>🔍 Índice para consultas con filtros múltiples</li>
                  <li>🔍 Enlaces directos a Firebase Console</li>
                </ul>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-info" 
                  (click)="mostrarInstruccionesIndices()">
                  📋 Mostrar Instrucciones de Índices
                </button>
                <button 
                  class="btn btn-primary" 
                  (click)="abrirEnlacesIndices()">
                  🔗 Abrir Enlaces de Índices
                </button>
              </div>
            </div>
            }

            <!-- Sección de Personal Médico (solo visible en modo personal) -->
            @if (setupMode() === 'personal') {
            <div class="action-card">
              <div class="action-info">
                <h4>👨‍⚕️ Crear Personal Médico</h4>
                <p>Genera personal médico predefinido para la clínica estética con datos realistas y experiencia variada.</p>
                <ul>
                  <li>✅ 3 enfermeras especializadas en cirugía estética</li>
                  <li>✅ 3 anestesiólogos con diferentes especialidades</li>
                  <li>✅ Certificaciones y experiencia realista</li>
                  <li>✅ Datos de contacto y información laboral</li>
                  <li>✅ Turnos de trabajo y salarios base</li>
                </ul>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-primary" 
                  (click)="crearPersonalMedico()"
                  [disabled]="cargandoPersonal()">
                  {{cargandoPersonal() ? 'Creando...' : '+ Crear Personal Médico'}}
                </button>
                <button 
                  class="btn btn-secondary" 
                  (click)="limpiarPersonalMedico()"
                  [disabled]="cargandoPersonal()">
                  {{cargandoPersonal() ? 'Limpiando...' : '🗑️ Limpiar Personal'}}
                </button>
              </div>
            </div>
            }

            <!-- Sección de limpieza (visible en ambos modos) -->
            <div class="action-card warning">
              <div class="action-info">
                <h4>🗑️ Limpiar Datos de Prueba</h4>
                <p>{{setupMode() === 'citas' ? 'Elimina todas las citas de prueba.' : setupMode() === 'cirugias' ? 'Elimina todos los tipos de cirugías.' : setupMode() === 'personal' ? 'Elimina todo el personal médico.' : 'Elimina todos los datos de pacientes y historiales.'}} <strong>Esta acción no se puede deshacer.</strong></p>
                <div class="warning-note">
                  ⚠️ <strong>Atención:</strong> {{setupMode() === 'citas' ? 'Para citas puedes usar el botón de limpiar arriba.' : setupMode() === 'cirugias' ? 'Para cirugías puedes usar el botón de limpiar arriba.' : setupMode() === 'personal' ? 'Para personal puedes usar el botón de limpiar arriba.' : 'Por seguridad, la limpieza debe realizarse manualmente desde la consola de Firebase.'}}
                </div>
              </div>
              <div class="action-buttons">
                @if (setupMode() === 'citas') {
                <button 
                  class="btn btn-danger" 
                  (click)="limpiarCitas()"
                  [disabled]="cargandoCitas()">
                  {{cargandoCitas() ? 'Limpiando...' : '🗑️ Limpiar Todas las Citas'}}
                </button>
                } @else if (setupMode() === 'cirugias') {
                <button 
                  class="btn btn-danger" 
                  (click)="limpiarTiposCirugias()"
                  [disabled]="cargandoCirugias()">
                  {{cargandoCirugias() ? 'Limpiando...' : '🗑️ Limpiar Todas las Cirugías'}}
                </button>
                } @else if (setupMode() === 'personal') {
                <button 
                  class="btn btn-danger" 
                  (click)="limpiarPersonalMedico()"
                  [disabled]="cargandoPersonal()">
                  {{cargandoPersonal() ? 'Limpiando...' : '🗑️ Limpiar Todo el Personal'}}
                </button>
                } @else {
                <button 
                  class="btn btn-danger" 
                  disabled>
                  🔒 Limpiar (Manual)
                </button>
                }
              </div>
            </div>
          </div>

          <!-- Instrucciones -->
          <div class="instructions-section">
            <h3>📋 Instrucciones de Uso</h3>
            <div class="instructions">
              <div class="instruction-item">
                <span class="step-number">1</span>
                <div class="step-content">
                  <h4>Verificar Estado</h4>
                  <p>Revisa la cantidad actual de pacientes y registros en el sistema.</p>
                </div>
              </div>
              
              <div class="instruction-item">
                <span class="step-number">2</span>
                <div class="step-content">
                  <h4>Crear Datos de Prueba</h4>
                  <p>Haz clic en "Crear Pacientes" para generar datos ficticios para testing.</p>
                </div>
              </div>
              
              <div class="instruction-item">
                <span class="step-number">3</span>
                <div class="step-content">
                  <h4>Probar Funcionalidades</h4>
                  <p>Ve a la sección de Pacientes para probar búsquedas, edición e historial médico.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Navegación -->
          <div class="navigation-section">
            <h3>🧭 Ir a Secciones</h3>
            <div class="nav-buttons">
              <button class="btn btn-outline" (click)="irAPacientes()">
                👥 Ver Pacientes
              </button>
              <button class="btn btn-outline" (click)="irADashboard()">
                📊 Dashboard
              </button>
              <button class="btn btn-secondary" (click)="irAInicio()">
                🏠 Inicio
              </button>
            </div>
          </div>
        </div>

        <!-- Log de actividades -->
        <div class="log-section" *ngIf="logs().length > 0">
          <h3>📝 Log de Actividades</h3>
          <div class="log-container">
            <div class="log-item" *ngFor="let log of logs(); trackBy: trackByLog">
              <span class="log-time">{{formatearTiempo(log.timestamp)}}</span>
              <span class="log-message" [class]="log.type">{{log.message}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .setup-card {
      background: white;
      border-radius: 1.5rem;
      max-width: 1000px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .setup-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .setup-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .setup-header p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .setup-nav {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .nav-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }

    .nav-btn.active {
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border-color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .setup-content {
      padding: 2rem;
    }

    .info-section,
    .actions-section,
    .instructions-section,
    .navigation-section {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .navigation-section {
      border-bottom: none;
      margin-bottom: 0;
    }

    .info-section h3,
    .actions-section h3,
    .instructions-section h3,
    .navigation-section h3 {
      color: #1f2937;
      margin: 0 0 1.5rem 0;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 1rem;
      text-align: center;
      border: 2px solid #e5e7eb;
    }

    .stat-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .action-card {
      background: #f8fafc;
      border: 2px solid #e5e7eb;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .action-card.warning {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .action-info {
      flex: 1;
    }

    .action-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .action-info p {
      margin: 0 0 1rem 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .action-info ul {
      margin: 0;
      padding-left: 1rem;
      color: #6b7280;
    }

    .action-info li {
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .warning-note {
      background: #feebc8;
      border: 1px solid #f6ad55;
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #92400e;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 150px;
    }

    .instructions {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .step-number {
      background: #3b82f6;
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1rem;
    }

    .step-content p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }

    .nav-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .log-section {
      background: #f8fafc;
      border-top: 2px solid #e5e7eb;
      padding: 1.5rem 2rem;
    }

    .log-section h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .log-container {
      max-height: 200px;
      overflow-y: auto;
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
    }

    .log-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.9rem;
    }

    .log-item:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #6b7280;
      min-width: 80px;
      font-family: monospace;
    }

    .log-message {
      flex: 1;
      color: #374151;
    }

    .log-message.success {
      color: #059669;
    }

    .log-message.error {
      color: #dc2626;
    }

    .log-message.info {
      color: #3b82f6;
    }

    .alert-warning {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      color: #92400e;
    }

    .alert-warning strong {
      color: #78350f;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
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

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-info {
      background: #06b6d4;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #0891b2;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover {
      background: #3b82f6;
      color: white;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #b91c1c;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    @media (max-width: 768px) {
      .setup-container {
        padding: 1rem;
      }

      .setup-content {
        padding: 1.5rem;
      }

      .action-card {
        flex-direction: column;
        gap: 1rem;
      }

      .action-buttons {
        min-width: auto;
        width: 100%;
      }

      .nav-buttons {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SetupComponent {
  totalPacientes = signal(0);
  totalHistoriales = signal(0);
  totalCitas = signal(0);
  totalCirugias = signal(0);
  totalPersonal = signal(0);
  cargandoPacientes = signal(false);
  cargandoCitas = signal(false);
  cargandoCirugias = signal(false);
  cargandoPersonal = signal(false);
  setupMode = signal<'pacientes' | 'citas' | 'cirugias' | 'personal'>('pacientes');
  logs = signal<Array<{timestamp: Date, message: string, type: 'info' | 'success' | 'error'}>>([]);
  estadisticasPersonal = signal<any>(null);

  constructor(
    private dataSetupService: DataSetupService,
    private pacienteService: PacienteService,
    private citaSetupService: CitaSetupService,
    private citaService: CitaService,
    private cirugiaService: CirugiaService,
    private personalService: PersonalService,
    private router: Router
  ) {}

  ngOnInit() {
    // Detectar el modo basado en la ruta actual
    const currentUrl = this.router.url;
    if (currentUrl.includes('setup/citas')) {
      this.setupMode.set('citas');
      this.agregarLog('Sistema de setup de citas inicializado', 'info');
    } else if (currentUrl.includes('setup/cirugias')) {
      this.setupMode.set('cirugias');
      this.agregarLog('Sistema de setup de cirugías inicializado', 'info');
    } else if (currentUrl.includes('setup/personal')) {
      this.setupMode.set('personal');
      this.agregarLog('Sistema de setup de personal médico inicializado', 'info');
    } else {
      this.setupMode.set('pacientes');
      this.agregarLog('Sistema de setup de pacientes inicializado', 'info');
    }
    
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    // Obtener total de pacientes
    this.pacienteService.obtenerContadorPacientes().then(totalPacientes => {
      this.totalPacientes.set(totalPacientes);
    }).catch(error => {
      console.error('Error obteniendo pacientes:', error);
      this.totalPacientes.set(0);
    });

    // Obtener total de citas
    this.citaService.obtenerContadorCitas().then(totalCitas => {
      this.totalCitas.set(totalCitas);
    }).catch(error => {
      console.error('Error obteniendo citas:', error);
      this.totalCitas.set(0);
    });

    // Obtener total de tipos de cirugía - usar una consulta simple sin orderBy
    this.cirugiaService.obtenerTiposCirugiaSimple().then(tipos => {
      this.totalCirugias.set(tipos.length);
    }).catch(error => {
      console.error('Error obteniendo cirugías:', error);
      this.totalCirugias.set(0);
    });

    // Obtener total de personal médico
    this.personalService.obtenerPersonalSimple().then((personal: any) => {
      this.totalPersonal.set(personal.length);
      
      // Si estamos en modo personal, también cargar estadísticas detalladas
      if (this.setupMode() === 'personal') {
        this.personalService.obtenerEstadisticasPersonal().then((estadisticas: any) => {
          this.estadisticasPersonal.set(estadisticas);
        }).catch((error: any) => {
          console.error('Error obteniendo estadísticas de personal:', error);
          this.estadisticasPersonal.set(null);
        });
      }
    }).catch((error: any) => {
      console.error('Error obteniendo personal:', error);
      this.totalPersonal.set(0);
    });

    // Para historiales, necesitarías implementar un método similar
    // Por ahora usaremos 0 como placeholder
    this.totalHistoriales.set(0);
  }

  async crearPacientesFicticios() {
    this.cargandoPacientes.set(true);
    this.agregarLog('Iniciando creación de pacientes ficticios...', 'info');

    try {
      await this.dataSetupService.crearPacientesFicticios();
      this.agregarLog('✅ Pacientes ficticios creados exitosamente', 'success');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error creando pacientes:', error);
      this.agregarLog('❌ Error creando pacientes ficticios', 'error');
    } finally {
      this.cargandoPacientes.set(false);
    }
  }

  async recrearDatosFicticios() {
    this.cargandoPacientes.set(true);
    this.agregarLog('Iniciando recreación de datos ficticios...', 'info');

    try {
      await this.dataSetupService.recrearDatosFicticios();
      this.agregarLog('✅ Datos ficticios recreados exitosamente', 'success');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error recreando datos:', error);
      this.agregarLog('❌ Error recreando datos ficticios', 'error');
    } finally {
      this.cargandoPacientes.set(false);
    }
  }

  async crearDatosCitas() {
    this.cargandoCitas.set(true);
    this.agregarLog('Iniciando creación de citas ficticias...', 'info');

    try {
      await this.citaSetupService.crearCitasDePrueba();
      this.agregarLog('✅ Citas ficticias creadas exitosamente', 'success');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error creando citas:', error);
      this.agregarLog('❌ Error creando citas ficticias', 'error');
    } finally {
      this.cargandoCitas.set(false);
    }
  }

  async limpiarCitas() {
    this.cargandoCitas.set(true);
    this.agregarLog('Iniciando limpieza de citas...', 'info');

    try {
      await this.citaSetupService.limpiarCitas();
      this.agregarLog('✅ Citas eliminadas exitosamente', 'success');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error limpiando citas:', error);
      this.agregarLog('❌ Error limpiando citas', 'error');
    } finally {
      this.cargandoCitas.set(false);
    }
  }

  async crearTiposCirugias() {
    this.cargandoCirugias.set(true);
    this.agregarLog('Iniciando creación de tipos de cirugías...', 'info');

    try {
      await this.cirugiaService.inicializarTiposCirugiasPredefinidos();
      this.agregarLog('✅ Tipos de cirugías creados exitosamente', 'success');
      this.agregarLog('Se crearon 10 tipos de cirugías estéticas con sus checklist completos', 'info');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error creando tipos de cirugías:', error);
      this.agregarLog('❌ Error creando tipos de cirugías', 'error');
    } finally {
      this.cargandoCirugias.set(false);
    }
  }

  async limpiarTiposCirugias() {
    this.cargandoCirugias.set(true);
    this.agregarLog('Iniciando limpieza de tipos de cirugías...', 'info');

    try {
      await this.cirugiaService.limpiarTiposCirugias();
      this.agregarLog('✅ Tipos de cirugías eliminados exitosamente', 'success');
      this.cargarEstadisticas();
    } catch (error) {
      console.error('Error limpiando tipos de cirugías:', error);
      this.agregarLog('❌ Error limpiando tipos de cirugías', 'error');
    } finally {
      this.cargandoCirugias.set(false);
    }
  }

  // ============ MÉTODOS PARA ÍNDICES DE FIRESTORE ============
  
  mostrarInstruccionesIndices() {
    this.agregarLog('📋 Instrucciones completas para crear índices de Firestore:', 'info');
    this.agregarLog('', 'info');
    
    // Información general
    this.agregarLog('🔍 ¿Por qué necesitas índices?', 'info');
    this.agregarLog('   • Firestore requiere índices para consultas con múltiples filtros', 'info');
    this.agregarLog('   • Los índices mejoran el rendimiento de las consultas', 'info');
    this.agregarLog('   • Sin índices, algunas consultas fallarán con error', 'info');
    this.agregarLog('', 'info');
    
    // Métodos para crear índices
    this.agregarLog('📝 3 formas de crear índices:', 'info');
    this.agregarLog('', 'info');
    this.agregarLog('1️⃣ MÉTODO AUTOMÁTICO (Recomendado):', 'success');
    this.agregarLog('   • Haz clic en el enlace del error en la consola del navegador', 'info');
    this.agregarLog('   • Firebase te lleva directamente a crear el índice', 'info');
    this.agregarLog('   • Haz clic en "Crear índice" y espera unos minutos', 'info');
    this.agregarLog('', 'info');
    
    this.agregarLog('2️⃣ MÉTODO MANUAL (Firebase Console):', 'info');
    this.agregarLog('   • Usa el botón "Abrir Enlaces de Índices" de abajo', 'info');
    this.agregarLog('   • Ve a Firebase Console > Firestore > Índices', 'info');
    this.agregarLog('   • Crea índices manualmente para las colecciones', 'info');
    this.agregarLog('', 'info');
    
    this.agregarLog('3️⃣ MÉTODO CLI (Firebase CLI):', 'info');
    this.agregarLog('   • El proyecto ya tiene firestore.indexes.json configurado', 'info');
    this.agregarLog('   • Ejecuta: firebase deploy --only firestore:indexes', 'info');
    this.agregarLog('   • Esto despliega todos los índices automáticamente', 'info');
    this.agregarLog('', 'info');
    
    // Índices específicos necesarios
    this.agregarLog('� Índices requeridos para el módulo de cirugías:', 'success');
    this.agregarLog('', 'info');
    this.agregarLog('🏥 Collection: tipos_cirugia', 'info');
    this.agregarLog('   • activo (Ascendente) + nombre (Ascendente)', 'info');
    this.agregarLog('   • activo (Ascendente) + categoria (Ascendente)', 'info');
    this.agregarLog('   • activo (Ascendente) + fechaCreacion (Descendente)', 'info');
    this.agregarLog('', 'info');
    
    this.agregarLog('📋 Collection: checklist_cirugias', 'info');
    this.agregarLog('   • idTipoCirugia (Ascendente) + activo (Ascendente)', 'info');
    this.agregarLog('   • categoria (Ascendente) + activo (Ascendente)', 'info');
    this.agregarLog('', 'info');
    
    this.agregarLog('⏰ Tiempo de creación: Los índices tardan 2-5 minutos en estar listos', 'info');
    this.agregarLog('🔄 Después de crear los índices, recarga la página para usar las consultas ordenadas', 'success');
  }

  abrirEnlacesIndices() {
    this.agregarLog('🔍 Verificando estado de índices de Firestore...', 'info');
    
    // Obtener enlaces desde el servicio
    const enlaces = this.cirugiaService.generarEnlacesIndices();
    
    // Verificar índices existentes
    this.cirugiaService.verificarIndicesRequeridos().then(resultados => {
      this.agregarLog('📊 Estado actual de índices:', 'info');
      this.agregarLog(`   • Tipos ordenados: ${resultados.tiposOrdenados ? '✅' : '❌'}`, resultados.tiposOrdenados ? 'success' : 'error');
      this.agregarLog(`   • Checklist por tipo: ${resultados.checklistPorTipo ? '✅' : '❌'}`, resultados.checklistPorTipo ? 'success' : 'error');
      
      if (!resultados.tiposOrdenados || !resultados.checklistPorTipo) {
        this.agregarLog('⚠️ Algunos índices faltan. Abriendo enlaces para crearlos...', 'info');
      } else {
        this.agregarLog('🎉 Todos los índices principales están disponibles', 'success');
      }
    });

    this.agregarLog('🔗 Abriendo enlaces para gestionar índices...', 'info');
    
    enlaces.forEach((enlace, index) => {
      setTimeout(() => {
        window.open(enlace.url, '_blank');
        this.agregarLog(`✅ Abierto: ${enlace.nombre}`, 'success');
        this.agregarLog(`   ${enlace.descripcion}`, 'info');
      }, index * 1500); // Esperar 1.5 segundos entre cada apertura
    });

    this.agregarLog('💡 Los enlaces se abren con intervalos para evitar bloqueo del navegador', 'info');
    this.agregarLog('� En Firebase Console, haz clic en "Crear índice" y confirma', 'info');
    this.agregarLog('⏰ Los índices tardan unos minutos en crearse', 'info');
  }

  cambiarModo(modo: 'pacientes' | 'citas' | 'cirugias' | 'personal') {
    this.setupMode.set(modo);
    const ruta = modo === 'citas' ? '/setup/citas' : 
                 modo === 'cirugias' ? '/setup/cirugias' : 
                 modo === 'personal' ? '/setup/personal' : 
                 '/setup/pacientes';
    this.router.navigate([ruta]);
  }

  // Métodos para Personal Médico
  async crearPersonalMedico() {
    try {
      this.cargandoPersonal.set(true);
      this.agregarLog('🚀 Iniciando creación de personal médico...', 'info');

      // Crear personal predefinido
      await this.personalService.inicializarPersonalPredefinido();
      
      this.agregarLog('✅ Personal médico creado exitosamente', 'success');
      this.agregarLog('   • 3 enfermeras especializadas', 'info');
      this.agregarLog('   • 3 anestesiólogos certificados', 'info');
      this.agregarLog('   • Datos completos y certificaciones', 'info');

      // Recargar estadísticas
      this.cargarEstadisticas();
      
    } catch (error: any) {
      console.error('Error creando personal médico:', error);
      this.agregarLog('❌ Error creando personal médico: ' + error.message, 'error');
    } finally {
      this.cargandoPersonal.set(false);
    }
  }

  async limpiarPersonalMedico() {
    try {
      this.cargandoPersonal.set(true);
      this.agregarLog('🗑️ Iniciando limpieza de personal médico...', 'info');

      // Obtener todo el personal para eliminar
      const personal = await this.personalService.obtenerPersonalSimple();
      
      if (personal.length === 0) {
        this.agregarLog('ℹ️ No hay personal médico para eliminar', 'info');
        return;
      }

      // Eliminar cada miembro del personal
      for (const persona of personal) {
        if (persona.id) {
          await this.personalService.eliminarPersonal(persona.id);
        }
      }
      
      this.agregarLog(`✅ ${personal.length} miembros del personal médico eliminados`, 'success');

      // Recargar estadísticas
      this.cargarEstadisticas();
      
    } catch (error: any) {
      console.error('Error limpiando personal médico:', error);
      this.agregarLog('❌ Error limpiando personal médico: ' + error.message, 'error');
    } finally {
      this.cargandoPersonal.set(false);
    }
  }

  agregarLog(message: string, type: 'info' | 'success' | 'error') {
    const nuevosLogs = [...this.logs(), {
      timestamp: new Date(),
      message,
      type
    }];
    this.logs.set(nuevosLogs);
  }

  formatearTiempo(timestamp: Date): string {
    return timestamp.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  trackByLog(index: number, log: any): any {
    return log.timestamp.getTime();
  }

  // Navegación
  irAPacientes() {
    this.router.navigate(['/pacientes']);
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAInicio() {
    this.router.navigate(['/']);
  }
}