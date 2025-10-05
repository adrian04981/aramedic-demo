import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>AraMedic</h1>
          <p>Sistema de Gestión Médica</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="ejemplo@correo.com"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Ingrese su contraseña"
              >
              <button
                type="button"
                class="toggle-password"
                (click)="togglePassword()"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn-login"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="login-footer">
          <button type="button" class="btn-back" (click)="goBack()">
            ← Volver al inicio
          </button>
        </div>

        <!-- Demo Users Info -->
        <div class="demo-info">
          <h3>Usuarios de Demostración</h3>
          <div class="demo-users">
            <div class="demo-user">
              <div class="demo-user-info">
                <strong>Administrador:</strong><br>
                <span class="credentials">admin@aramedic.com / admin123</span>
              </div>
              <button 
                type="button" 
                class="btn-demo-login"
                (click)="loginWithDemo('admin@aramedic.com', 'admin123')"
                [disabled]="loading"
              >
                Login
              </button>
            </div>
            <div class="demo-user">
              <div class="demo-user-info">
                <strong>Admin Médico:</strong><br>
                <span class="credentials">adminmedico@aramedic.com / admin123</span>
              </div>
              <button 
                type="button" 
                class="btn-demo-login"
                (click)="loginWithDemo('adminmedico@aramedic.com', 'admin123')"
                [disabled]="loading"
              >
                Login
              </button>
            </div>
            <div class="demo-user">
              <div class="demo-user-info">
                <strong>Médico:</strong><br>
                <span class="credentials">medico@aramedic.com / medico123</span>
              </div>
              <button 
                type="button" 
                class="btn-demo-login"
                (click)="loginWithDemo('medico@aramedic.com', 'medico123')"
                [disabled]="loading"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 2.5rem;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      font-weight: bold;
    }

    .login-header p {
      color: #6b7280;
      margin: 0;
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    input {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    input.error {
      border-color: #ef4444;
    }

    .password-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input input {
      flex: 1;
      padding-right: 3rem;
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message span {
      display: block;
    }

    .btn-login {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-login:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-login:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
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

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .btn-back {
      background: transparent;
      color: #6b7280;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.5rem;
      transition: color 0.3s ease;
    }

    .btn-back:hover {
      color: #374151;
    }

    .demo-info {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .demo-info h3 {
      font-size: 1rem;
      color: #374151;
      margin: 0 0 1rem 0;
      text-align: center;
    }

    .demo-users {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .demo-user {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      border-left: 3px solid #3b82f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .demo-user-info {
      flex: 1;
    }

    .demo-user strong {
      color: #374151;
    }

    .credentials {
      color: #6b7280;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
    }

    .btn-demo-login {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      min-width: 60px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-demo-login:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-demo-login:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-demo-login:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem;
      }

      .login-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
      // La navegación se maneja en el servicio
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async loginWithDemo(email: string, password: string) {
    this.loading = true;
    this.errorMessage = '';
    
    // Llenar el formulario con las credenciales de demo
    this.loginForm.patchValue({
      email: email,
      password: password
    });

    try {
      await this.authService.login(email, password);
      // La navegación se maneja en el servicio
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  private getErrorMessage(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'Usuario no encontrado';
        case 'auth/wrong-password':
          return 'Contraseña incorrecta';
        case 'auth/invalid-email':
          return 'Correo electrónico inválido';
        case 'auth/user-disabled':
          return 'Usuario deshabilitado';
        case 'auth/too-many-requests':
          return 'Demasiados intentos. Intenta más tarde';
        default:
          return 'Error de autenticación';
      }
    }
    return error.message || 'Error al iniciar sesión';
  }
}