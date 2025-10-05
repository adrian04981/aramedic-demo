import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <h1>AraMedic</h1>
          </div>
          <div class="user-info">
            <span class="welcome">Bienvenido, {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <span class="role-badge" [ngClass]="currentUser?.role">{{ getRoleDisplay(currentUser?.role) }}</span>
            <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          <p>Panel de control - {{ getRoleDisplay(currentUser?.role) }}</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card" *ngIf="canViewUserStats()">
            <div class="stat-icon users">👥</div>
            <div class="stat-content">
              <h3>{{ totalUsers }}</h3>
              <p>Usuarios Totales</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon appointments">📅</div>
            <div class="stat-content">
              <h3>{{ todayAppointments }}</h3>
              <p>Citas Hoy</p>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="isMedico()">
            <div class="stat-icon patients">🩺</div>
            <div class="stat-content">
              <h3>{{ myPatients }}</h3>
              <p>Mis Pacientes</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon active">✅</div>
            <div class="stat-content">
              <h3>{{ activeUsers }}</h3>
              <p>Usuarios Activos</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Acciones Rápidas</h3>
          <div class="actions-grid">
            <!-- Admin Actions -->
            <div class="action-card" *ngIf="isAdmin()" (click)="goToUsers()">
              <div class="action-icon">👥</div>
              <h4>Gestionar Usuarios</h4>
              <p>Crear, editar y administrar usuarios del sistema</p>
            </div>

            <div class="action-card" *ngIf="isAdmin()" (click)="goToSetup()">
              <div class="action-icon">🔧</div>
              <h4>Setup de Datos</h4>
              <p>Configurar datos de prueba y sistema</p>
            </div>

            <!-- Admin Medico Actions -->
            <div class="action-card" *ngIf="isAdminMedico()" (click)="goToMedicos()">
              <div class="action-icon">👨‍⚕️</div>
              <h4>Gestionar Médicos</h4>
              <p>Administrar información de médicos y especialidades</p>
            </div>

            <!-- Common Actions -->
            <div class="action-card" (click)="goToPacientes()">
              <div class="action-icon">👤</div>
              <h4>Pacientes</h4>
              <p>Gestionar información de pacientes</p>
            </div>

            <div class="action-card" (click)="goToAppointments()">
              <div class="action-icon">📅</div>
              <h4>Citas</h4>
              <p>Gestionar citas médicas y horarios</p>
            </div>

            <div class="action-card" *ngIf="isMedico()" (click)="goToPatients()">
              <div class="action-icon">🩺</div>
              <h4>Historial Médico</h4>
              <p>Revisar expedientes médicos detallados</p>
            </div>

            <div class="action-card" (click)="goToReports()">
              <div class="action-icon">📊</div>
              <h4>Reportes</h4>
              <p>Generar reportes y estadísticas</p>
            </div>

            <div class="action-card" (click)="goToSettings()">
              <div class="action-icon">⚙️</div>
              <h4>Configuración</h4>
              <p>Configurar preferencias del sistema</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h3>Actividad Reciente</h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [ngClass]="activity.type">{{ getActivityIcon(activity.type) }}</div>
              <div class="activity-content">
                <p>{{ activity.description }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    /* Header */
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h1 {
      color: #3b82f6;
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome {
      color: #374151;
      font-weight: 500;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
    }

    .role-badge.administrador {
      background: #dc2626;
    }

    .role-badge.administrador_medico {
      background: #7c3aed;
    }

    .role-badge.medico {
      background: #059669;
    }

    .btn-logout {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-logout:hover {
      background: #dc2626;
    }

    /* Main Content */
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h2 {
      font-size: 2.5rem;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-header p {
      color: #6b7280;
      margin: 0;
      font-size: 1.1rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 3rem;
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.users { background: #dbeafe; }
    .stat-icon.appointments { background: #fef3c7; }
    .stat-icon.patients { background: #d1fae5; }
    .stat-icon.active { background: #e0e7ff; }

    .stat-content h3 {
      font-size: 2rem;
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .stat-content p {
      color: #6b7280;
      margin: 0;
      font-size: 0.875rem;
    }

    /* Quick Actions */
    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h4 {
      font-size: 1.25rem;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .action-card p {
      color: #6b7280;
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Recent Activity */
    .recent-activity h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    .activity-list {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .activity-item {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .activity-icon.login { background: #dbeafe; }
    .activity-icon.create { background: #d1fae5; }
    .activity-icon.update { background: #fef3c7; }

    .activity-content {
      flex: 1;
    }

    .activity-content p {
      margin: 0 0 0.25rem 0;
      color: #374151;
      font-size: 0.875rem;
    }

    .activity-time {
      color: #6b7280;
      font-size: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .user-info {
        flex-direction: column;
        text-align: center;
      }

      .main-content {
        padding: 1rem;
      }

      .dashboard-header h2 {
        font-size: 2rem;
      }

      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: UserRole | null = null;
  totalUsers = 0;
  activeUsers = 0;
  todayAppointments = 0;
  myPatients = 0;

  recentActivities = [
    {
      type: 'login',
      description: 'Usuario admin@aramedic.com inició sesión',
      time: 'Hace 5 minutos'
    },
    {
      type: 'create',
      description: 'Nuevo paciente registrado: Juan Pérez',
      time: 'Hace 15 minutos'
    },
    {
      type: 'update',
      description: 'Actualización de información médica',
      time: 'Hace 30 minutos'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      if (this.canViewUserStats()) {
        const users = await this.authService.getAllUsers();
        this.totalUsers = users.length;
        this.activeUsers = users.filter(u => u.isActive).length;
      }
      
      // Simular datos para demo
      this.todayAppointments = 12;
      this.myPatients = 45;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  getRoleDisplay(role?: string): string {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'administrador_medico':
        return 'Administrador Médico';
      case 'medico':
        return 'Médico';
      default:
        return 'Usuario';
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'administrador';
  }

  isAdminMedico(): boolean {
    return this.currentUser?.role === 'administrador_medico';
  }

  isMedico(): boolean {
    return this.currentUser?.role === 'medico' || this.currentUser?.role === 'administrador_medico';
  }

  canViewUserStats(): boolean {
    return this.isAdmin() || this.isAdminMedico();
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'login':
        return '👤';
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      default:
        return '📝';
    }
  }

  // Navigation methods
  goToUsers() {
    this.router.navigate(['/usuarios']);
  }

  goToPacientes() {
    this.router.navigate(['/pacientes']);
  }

  goToSetup() {
    this.router.navigate(['/setup/pacientes']);
  }

  goToMedicos() {
    this.router.navigate(['/medicos']);
  }

  goToAppointments() {
    this.router.navigate(['/citas']);
  }

  goToPatients() {
    console.log('Ir a pacientes');
  }

  goToReports() {
    console.log('Ir a reportes');
  }

  goToSettings() {
    console.log('Ir a configuración');
  }

  async logout() {
    await this.authService.logout();
  }
}