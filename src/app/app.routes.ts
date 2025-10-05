import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [authGuard, roleGuard(['administrador', 'administrador_medico'])]
  },
  {
    path: 'pacientes',
    loadComponent: () => import('./components/pacientes/pacientes.component').then(m => m.PacientesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'citas',
    loadComponent: () => import('./components/citas/citas.component').then(m => m.CitasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cirugias',
    loadComponent: () => import('./components/cirugias/cirugias.component').then(m => m.CirugiasComponent),
    canActivate: [authGuard, roleGuard(['administrador', 'administrador_medico', 'medico'])]
  },
  {
    path: 'programacion-cirugias',
    loadComponent: () => import('./components/programacion-cirugia/programacion-cirugia.component').then(m => m.ProgramacionCirugiaComponent),
    canActivate: [authGuard, roleGuard(['administrador', 'administrador_medico', 'medico'])]
  },
  {
    path: 'personal',
    loadComponent: () => import('./components/personal/personal.component').then(m => m.PersonalComponent),
    canActivate: [authGuard, roleGuard(['administrador', 'administrador_medico'])]
  },
  {
    path: 'setup/pacientes',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'setup/citas',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'setup/cirugias',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'setup/personal',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'setup/programacion-cirugias',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
