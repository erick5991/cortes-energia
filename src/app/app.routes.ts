import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/vista-publica/vista-publica').then((m) => m.VistaPublica),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-usuario/login-usuario').then((m) => m.LoginUsuario),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login-admin/login-admin').then((m) => m.LoginAdmin),
  },
  {
    path: 'reportar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reportes/reportar-corte/reportar-corte').then((m) => m.ReportarCorte),
  },
  {
    path: 'mis-reportes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reportes/mis-reportes/mis-reportes').then((m) => m.MisReportes),
  },
  {
    path: 'admin/cortes',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-cortes/admin-cortes').then((m) => m.AdminCortes),
  },
  {
    path: 'admin/reportes',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-reportes/admin-reportes').then((m) => m.AdminReportes),
  },
];
