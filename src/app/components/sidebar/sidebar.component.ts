import { Component, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

type RoleType = 'administrador' | 'administrador_medico' | 'medico';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: RoleType[];
  badge?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Header del Sidebar -->
      <div class="sidebar-header">
        <div class="logo" [class.collapsed]="isCollapsed()">
          <span class="logo-icon">🏥</span>
          <span class="logo-text" *ngIf="!isCollapsed()">AraMedic</span>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()">
          {{isCollapsed() ? '→' : '←'}}
        </button>
      </div>

      <!-- Información del Usuario -->
      <div class="user-info" *ngIf="!isCollapsed() && currentUser()">
        <div class="user-avatar">
          {{getCurrentUserInitials()}}
        </div>
        <div class="user-details">
          <h4>{{currentUser()?.firstName}} {{currentUser()?.lastName}}</h4>
          <span class="user-role" [ngClass]="currentUser()?.role">
            {{getRoleDisplay(currentUser()?.role)}}
          </span>
        </div>
      </div>

      <!-- Navegación Principal -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h5 *ngIf="!isCollapsed()" class="section-title">Principal</h5>
          
          <div class="nav-item" 
               *ngFor="let item of getVisibleMenuItems()" 
               [class.active]="isActiveRoute(item.route)"
               (click)="navigateTo(item.route)">
            <div class="nav-link">
              <span class="nav-icon">{{item.icon}}</span>
              <span class="nav-label" *ngIf="!isCollapsed()">{{item.label}}</span>
              <span class="nav-badge" *ngIf="item.badge && !isCollapsed()">{{item.badge}}</span>
            </div>
          </div>
        </div>

        <!-- Sección de Administración (solo para admins) -->
        <div class="nav-section" *ngIf="showAdminSection()">
          <h5 *ngIf="!isCollapsed()" class="section-title">Administración</h5>
          
          <div class="nav-item" 
               *ngFor="let item of getAdminMenuItems()" 
               [class.active]="isActiveRoute(item.route)"
               (click)="navigateTo(item.route)">
            <div class="nav-link">
              <span class="nav-icon">{{item.icon}}</span>
              <span class="nav-label" *ngIf="!isCollapsed()">{{item.label}}</span>
              <span class="nav-badge" *ngIf="item.badge && !isCollapsed()">{{item.badge}}</span>
            </div>
          </div>
        </div>

        <!-- Sección de Gestión Médica -->
        <div class="nav-section" *ngIf="showMedicalSection()">
          <h5 *ngIf="!isCollapsed()" class="section-title">Gestión Médica</h5>
          
          <div class="nav-item" 
               *ngFor="let item of getMedicalMenuItems()" 
               [class.active]="isActiveRoute(item.route)"
               (click)="navigateTo(item.route)">
            <div class="nav-link">
              <span class="nav-icon">{{item.icon}}</span>
              <span class="nav-label" *ngIf="!isCollapsed()">{{item.label}}</span>
              <span class="nav-badge" *ngIf="item.badge && !isCollapsed()">{{item.badge}}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Footer del Sidebar -->
      <div class="sidebar-footer">
        <div class="nav-item" (click)="logout()">
          <div class="nav-link">
            <span class="nav-icon">🚪</span>
            <span class="nav-label" *ngIf="!isCollapsed()">Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: width 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar.collapsed {
      width: 70px;
    }

    /* Header */
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
    }

    .logo.collapsed {
      justify-content: center;
    }

    .logo-icon {
      font-size: 1.5rem;
      min-width: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: bold;
      white-space: nowrap;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* User Info */
    .user-info {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.875rem;
    }

    .user-details h4 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
    }

    .user-role.administrador {
      background: rgba(220, 38, 38, 0.3);
    }

    .user-role.administrador_medico {
      background: rgba(124, 58, 237, 0.3);
    }

    .user-role.medico {
      background: rgba(5, 150, 105, 0.3);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
      margin: 0 0 0.75rem 1rem;
    }

    .nav-item {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 0 2px 2px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: inherit;
      position: relative;
    }

    .nav-icon {
      font-size: 1.25rem;
      min-width: 1.25rem;
      text-align: center;
    }

    .nav-label {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-badge {
      background: rgba(239, 68, 68, 0.8);
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* Footer */
    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 0;
    }

    .sidebar-footer .nav-item:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }

    /* Scrollbar */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  isCollapsed = signal(false);
  currentUser = signal<UserRole | null>(null);
  currentRoute = '';

  private menuItems: MenuItem[] = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/dashboard',
      roles: ['administrador', 'administrador_medico', 'medico']
    },
    {
      icon: '👤',
      label: 'Pacientes',
      route: '/pacientes',
      roles: ['administrador', 'administrador_medico', 'medico']
    },
    {
      icon: '📅',
      label: 'Citas',
      route: '/citas',
      roles: ['administrador', 'administrador_medico', 'medico']
    },
    {
      icon: '🏥',
      label: 'Cirugías',
      route: '/cirugias',
      roles: ['administrador', 'administrador_medico', 'medico']
    },
    {
      icon: '🗓️',
      label: 'Programación Cirugías',
      route: '/programacion-cirugias',
      roles: ['administrador', 'administrador_medico', 'medico']
    }
  ];

  private adminMenuItems: MenuItem[] = [
    {
      icon: '👥',
      label: 'Usuarios',
      route: '/usuarios',
      roles: ['administrador']
    },
    {
      icon: '🔧',
      label: 'Setup Sistema',
      route: '/setup/pacientes',
      roles: ['administrador']
    }
  ];

  private medicalMenuItems: MenuItem[] = [
    {
      icon: '👨‍⚕️',
      label: 'Personal Médico',
      route: '/personal',
      roles: ['administrador', 'administrador_medico']
    },
    {
      icon: '⚕️',
      label: 'Gestión Médicos',
      route: '/medicos',
      roles: ['administrador_medico']
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    // Escuchar cambios de ruta para actualizar el estado activo
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });

    // Obtener la ruta actual
    this.currentRoute = this.router.url;
  }

  toggleSidebar() {
    this.isCollapsed.update(value => {
      const newValue = !value;
      this.sidebarToggled.emit(newValue);
      return newValue;
    });
  }

  getCurrentUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  getRoleDisplay(role?: RoleType): string {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'administrador_medico':
        return 'Admin. Médico';
      case 'medico':
        return 'Médico';
      default:
        return 'Usuario';
    }
  }

  getVisibleMenuItems(): MenuItem[] {
    const userRole = this.currentUser()?.role;
    if (!userRole) return [];

    return this.menuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  getAdminMenuItems(): MenuItem[] {
    const userRole = this.currentUser()?.role;
    if (!userRole) return [];

    return this.adminMenuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  getMedicalMenuItems(): MenuItem[] {
    const userRole = this.currentUser()?.role;
    if (!userRole) return [];

    return this.medicalMenuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  showAdminSection(): boolean {
    const userRole = this.currentUser()?.role;
    return userRole === 'administrador';
  }

  showMedicalSection(): boolean {
    const userRole = this.currentUser()?.role;
    return userRole === 'administrador' || userRole === 'administrador_medico';
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}