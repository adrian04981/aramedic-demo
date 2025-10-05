import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataSetupService } from '../../services/data-setup.service';
import { PacienteService } from '../../services/paciente.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <div class="setup-header">
          <h1>🔧 Configuración de Datos de Prueba</h1>
          <p>Sistema de configuración para AraMedic - Datos ficticios para testing</p>
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
            </div>
          </div>

          <!-- Acciones de setup -->
          <div class="actions-section">
            <h3>⚙️ Acciones Disponibles</h3>
            
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

            <div class="action-card warning">
              <div class="action-info">
                <h4>🗑️ Limpiar Datos de Prueba</h4>
                <p>Elimina todos los datos de pacientes y historiales. <strong>Esta acción no se puede deshacer.</strong></p>
                <div class="warning-note">
                  ⚠️ <strong>Atención:</strong> Por seguridad, la limpieza debe realizarse manualmente desde la consola de Firebase.
                </div>
              </div>
              <div class="action-buttons">
                <button 
                  class="btn btn-danger" 
                  disabled>
                  🔒 Limpiar (Manual)
                </button>
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
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
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
  cargandoPacientes = signal(false);
  logs = signal<Array<{timestamp: Date, message: string, type: 'info' | 'success' | 'error'}>>([]);

  constructor(
    private dataSetupService: DataSetupService,
    private pacienteService: PacienteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.agregarLog('Sistema de setup inicializado', 'info');
  }

  async cargarEstadisticas() {
    try {
      // Obtener total de pacientes
      this.pacienteService.obtenerPacientes().subscribe(pacientes => {
        this.totalPacientes.set(pacientes.length);
      });

      // Para historiales, necesitarías implementar un método similar
      // Por ahora usaremos 0 como placeholder
      this.totalHistoriales.set(0);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
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