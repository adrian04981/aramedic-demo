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
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard(['administrador', 'administrador_medico'])]
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./components/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./components/citas/citas.component').then(m => m.CitasComponent)
      },
      {
        path: 'cirugias',
        loadComponent: () => import('./components/cirugias/cirugias.component').then(m => m.CirugiasComponent),
        canActivate: [roleGuard(['administrador', 'administrador_medico', 'medico'])]
      },
      {
        path: 'programacion-cirugias',
        loadComponent: () => import('./components/programacion-cirugia/programacion-cirugia.component').then(m => m.ProgramacionCirugiaComponent),
        canActivate: [roleGuard(['administrador', 'administrador_medico', 'medico'])]
      },
      {
        path: 'personal',
        loadComponent: () => import('./components/personal/personal.component').then(m => m.PersonalComponent),
        canActivate: [roleGuard(['administrador', 'administrador_medico'])]
      },
      {
        path: 'setup/pacientes',
        loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent),
        canActivate: [roleGuard(['administrador'])]
      },
      {
        path: 'setup/citas',
        loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent),
        canActivate: [roleGuard(['administrador'])]
      },
      {
        path: 'setup/cirugias',
        loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent),
        canActivate: [roleGuard(['administrador'])]
      },
      {
        path: 'setup/personal',
        loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent),
        canActivate: [roleGuard(['administrador'])]
      },
      {
        path: 'setup/programacion-cirugias',
        loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent),
        canActivate: [roleGuard(['administrador'])]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
