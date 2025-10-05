import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FileUploadComponent],
  template: `
    <div class="usuarios-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <button class="btn-back" (click)="goBack()">← Dashboard</button>
          <h1>Gestión de Usuarios</h1>
          <button class="btn-primary" (click)="showCreateForm = true">
            Nuevo Usuario
          </button>
        </div>
      </header>

      <!-- Create User Modal -->
      <div class="modal-overlay" *ngIf="showCreateForm" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Nombre"
                >
                <div class="error-message" *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched">
                  El nombre es requerido
                </div>
              </div>

              <div class="form-group">
                <label for="lastName">Apellidos</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Apellidos"
                >
                <div class="error-message" *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched">
                  Los apellidos son requeridos
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="ejemplo@correo.com"
                [disabled]="!!editingUser"
              >
              <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                <span *ngIf="userForm.get('email')?.errors?.['required']">El correo es requerido</span>
                <span *ngIf="userForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
              </div>
            </div>

            <div class="form-group" *ngIf="!editingUser">
              <label for="password">Contraseña</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="Contraseña (mínimo 6 caracteres)"
              >
              <div class="error-message" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
                <span *ngIf="userForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="userForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="role">Rol</label>
                <select id="role" formControlName="role">
                  <option value="">Seleccionar rol</option>
                  <option value="administrador" *ngIf="canCreateAdmin()">Administrador</option>
                  <option value="administrador_medico">Administrador Médico</option>
                  <option value="medico">Médico</option>
                </select>
                <div class="error-message" *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                  El rol es requerido
                </div>
              </div>

              <div class="form-group">
                <label for="phone">Teléfono (Opcional)</label>
                <input
                  type="tel"
                  id="phone"
                  formControlName="phone"
                  placeholder="Número de teléfono"
                >
              </div>
            </div>

            <!-- Campos específicos para médicos -->
            <div *ngIf="isMedicoRole()" class="medico-fields">
              <div class="form-row">
                <div class="form-group">
                  <label for="specialty">Especialidad</label>
                  <input
                    type="text"
                    id="specialty"
                    formControlName="specialty"
                    placeholder="Especialidad médica"
                  >
                </div>

                <div class="form-group">
                  <label for="licenseNumber">Número de Licencia</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    formControlName="licenseNumber"
                    placeholder="Número de licencia médica"
                  >
                </div>
              </div>
            </div>

            <!-- Sección de Foto de Perfil -->
            <div class="image-section">
              <h3>Foto de Perfil</h3>
              <app-file-upload
                label="foto de perfil"
                [currentImageUrl]="editingUser?.profileImageUrl || null"
                [userId]="editingUser?.uid || ''"
                fileType="profile"
                (fileUploaded)="onProfileImageUploaded($event)"
                (fileRemoved)="onProfileImageRemoved()">
              </app-file-upload>
            </div>

            <!-- Sección de Firma (solo para médicos) -->
            <div class="image-section" *ngIf="isMedicoRole()">
              <h3>Firma Digital</h3>
              <app-file-upload
                label="firma"
                hint="Sube tu firma digital (JPG, PNG, WebP - máx. 5MB)"
                [currentImageUrl]="editingUser?.signatureImageUrl || null"
                [userId]="editingUser?.uid || ''"
                fileType="signature"
                (fileUploaded)="onSignatureImageUploaded($event)"
                (fileRemoved)="onSignatureImageRemoved()">
              </app-file-upload>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="userForm.invalid || loading"
              >
                <span *ngIf="loading" class="spinner"></span>
                {{ loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Filtrar por rol:</label>
            <select [(ngModel)]="filterRole" (change)="filterUsers()">
              <option value="">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="administrador_medico">Administrador Médico</option>
              <option value="medico">Médico</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Estado:</label>
            <select [(ngModel)]="filterStatus" (change)="filterUsers()">
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div class="search-group">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
            >
          </div>
        </div>

        <!-- Users Table -->
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers" [class.inactive]="!user.isActive">
                <td>
                  <div class="user-info">
                    <!-- Avatar con iniciales cuando no hay foto -->
                    <div class="user-avatar" *ngIf="!user.profileImageUrl">
                      {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                    </div>
                    <!-- Foto de perfil cuando existe -->
                    <div class="user-avatar-container" *ngIf="user.profileImageUrl">
                      <img [src]="user.profileImageUrl" 
                           [alt]="user.firstName + ' ' + user.lastName"
                           class="user-avatar-image"
                           (error)="onImageError($event, user)"
                           (load)="onImageLoad($event)">
                      <!-- Fallback en caso de error de carga -->
                      <div class="user-avatar user-avatar-fallback" 
                           style="display: none;">
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div>
                      <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="role-container">
                    <span class="role-badge" [ngClass]="user.role">
                      {{ getRoleDisplay(user.role) }}
                    </span>
                    <div class="user-badges">
                      <span *ngIf="user.signatureImageUrl" class="signature-badge" title="Tiene firma digital">
                        ✍️
                      </span>
                      <span *ngIf="user.profileImageUrl" class="photo-badge" title="Tiene foto de perfil">
                        📷
                      </span>
                    </div>
                  </div>
                  <div *ngIf="user.specialty" class="specialty">{{ user.specialty }}</div>
                </td>
                <td>
                  <div>{{ user.phone || 'No especificado' }}</div>
                  <div *ngIf="user.licenseNumber" class="license">Lic: {{ user.licenseNumber }}</div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="user.isActive ? 'active' : 'inactive'">
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-action edit" (click)="editUser(user)">
                      ✏️
                    </button>
                    <button 
                      class="btn-action toggle"
                      [ngClass]="user.isActive ? 'deactivate' : 'activate'"
                      (click)="toggleUserStatus(user)"
                      [disabled]="user.uid === currentUser?.uid"
                    >
                      {{ user.isActive ? '🔒' : '🔓' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredUsers.length === 0" class="no-results">
            <p>No se encontraron usuarios con los filtros aplicados.</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .usuarios-container {
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
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      color: #1f2937;
      margin: 0;
      font-size: 1.5rem;
    }

    .btn-back {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-back:hover {
      background: #4b5563;
    }

    /* Main Content */
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Filters */
    .filters {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      display: flex;
      gap: 2rem;
      align-items: end;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .search-group {
      flex: 1;
      max-width: 300px;
    }

    .search-group input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    /* Table */
    .table-container {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th {
      background: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .users-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .users-table tr:hover {
      background: #f9fafb;
    }

    .users-table tr.inactive {
      opacity: 0.6;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }

    .user-avatar-container {
      position: relative;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    .user-avatar-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e5e7eb;
      display: block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      transition: box-shadow 0.3s ease;
    }

    .user-avatar-image:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
    }

    .user-avatar-fallback {
      position: absolute;
      top: 0;
      left: 0;
      background: #6b7280;
    }

    .user-name {
      font-weight: 500;
      color: #1f2937;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
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

    .role-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .user-badges {
      display: flex;
      gap: 0.25rem;
    }

    .signature-badge,
    .photo-badge {
      font-size: 0.75rem;
      opacity: 0.8;
      cursor: help;
    }

    .specialty {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .license {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      padding: 0.5rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-action.edit {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .btn-action.edit:hover {
      background: #bfdbfe;
    }

    .btn-action.toggle.activate {
      background: #d1fae5;
      color: #059669;
    }

    .btn-action.toggle.deactivate {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 1rem;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
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

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .user-form {
      padding: 1.5rem;
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
      margin-bottom: 1rem;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .medico-fields {
      background: #f0f9ff;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    .image-section {
      margin: 1.5rem 0;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #fafafa;
    }

    .image-section h3 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
      font-weight: 600;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .users-table {
        font-size: 0.875rem;
      }

      .users-table th,
      .users-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  users: UserRole[] = [];
  filteredUsers: UserRole[] = [];
  currentUser: UserRole | null = null;
  showCreateForm = false;
  editingUser: UserRole | null = null;
  loading = false;
  errorMessage = '';

  // Filters
  filterRole = '';
  filterStatus = '';
  searchTerm = '';

  // Image URLs for updates
  pendingProfileImageUrl: string | null = null;
  pendingSignatureImageUrl: string | null = null;

  userForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      phone: [''],
      specialty: [''],
      licenseNumber: ['']
    });

    // Limpiar campos médicos cuando se cambie a rol no médico
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      if (role !== 'medico' && role !== 'administrador_medico') {
        this.userForm.patchValue({
          specialty: '',
          licenseNumber: ''
        });
      }
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.authService.canManageUsers()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.authService.getAllUsers();
      this.filterUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      const matchesStatus = !this.filterStatus || 
        (this.filterStatus === 'active' && user.isActive) || 
        (this.filterStatus === 'inactive' && !user.isActive);
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });
  }

  getRoleDisplay(role: string): string {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'administrador_medico':
        return 'Admin Médico';
      case 'medico':
        return 'Médico';
      default:
        return role;
    }
  }

  formatDate(date: Date | any): string {
    if (date?.toDate) {
      date = date.toDate();
    }
    return new Date(date).toLocaleDateString('es-ES');
  }

  canCreateAdmin(): boolean {
    return this.currentUser?.role === 'administrador';
  }

  isMedicoRole(): boolean {
    const role = this.userForm.get('role')?.value;
    return role === 'medico' || role === 'administrador_medico';
  }

  editUser(user: UserRole) {
    this.editingUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      specialty: user.specialty,
      licenseNumber: user.licenseNumber
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showCreateForm = true;
  }

  async toggleUserStatus(user: UserRole) {
    try {
      await this.authService.updateUserStatus(user.uid, !user.isActive);
      user.isActive = !user.isActive;
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      const formData = this.userForm.value;
      
      if (this.editingUser) {
        // Actualizar usuario existente
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber
        };

        // Agregar URLs de imágenes si se han subido
        if (this.pendingProfileImageUrl) {
          updateData.profileImageUrl = this.pendingProfileImageUrl;
        }
        if (this.pendingSignatureImageUrl) {
          updateData.signatureImageUrl = this.pendingSignatureImageUrl;
        }

        await this.authService.updateUser(this.editingUser.uid, updateData);
        
        // Actualizar el usuario en la lista local
        const userIndex = this.users.findIndex(u => u.uid === this.editingUser!.uid);
        if (userIndex !== -1) {
          this.users[userIndex] = {
            ...this.users[userIndex],
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            phone: formData.phone,
            specialty: formData.specialty,
            licenseNumber: formData.licenseNumber,
            ...(this.pendingProfileImageUrl && { profileImageUrl: this.pendingProfileImageUrl }),
            ...(this.pendingSignatureImageUrl && { signatureImageUrl: this.pendingSignatureImageUrl })
          };
        }
        
        this.filterUsers(); // Actualizar la vista filtrada
      } else {
        // Crear nuevo usuario
        await this.authService.register(formData);
        await this.loadUsers();
      }
      
      this.closeModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al procesar la solicitud';
    } finally {
      this.loading = false;
    }
  }

  // Métodos para manejar imágenes
  onProfileImageUploaded(imageUrl: string) {
    this.pendingProfileImageUrl = imageUrl;
  }

  onProfileImageRemoved() {
    this.pendingProfileImageUrl = null;
    if (this.editingUser) {
      // Actualizar inmediatamente en la base de datos
      this.authService.updateUser(this.editingUser.uid, { profileImageUrl: null });
      this.editingUser.profileImageUrl = undefined;
    }
  }

  onSignatureImageUploaded(imageUrl: string) {
    this.pendingSignatureImageUrl = imageUrl;
  }

  onSignatureImageRemoved() {
    this.pendingSignatureImageUrl = null;
    if (this.editingUser) {
      // Actualizar inmediatamente en la base de datos
      this.authService.updateUser(this.editingUser.uid, { signatureImageUrl: null });
      this.editingUser.signatureImageUrl = undefined;
    }
  }

  closeModal() {
    this.showCreateForm = false;
    this.editingUser = null;
    this.pendingProfileImageUrl = null;
    this.pendingSignatureImageUrl = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.errorMessage = '';
  }

  // Métodos para manejar errores de carga de imagen
  onImageError(event: any, user: UserRole) {
    console.log('Error loading image for user:', user.email);
    // Ocultar la imagen con error
    event.target.style.display = 'none';
    // Mostrar el fallback
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }

  onImageLoad(event: any) {
    // La imagen se cargó exitosamente
    console.log('Image loaded successfully');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}