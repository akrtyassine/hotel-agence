import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { clientAuthGuard } from './core/guards/client-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'hotels',
    loadComponent: () => import('./pages/hotels/hotels.component').then(m => m.HotelsComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () => import('./pages/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },
  {
    path: 'promotions',
    loadComponent: () => import('./pages/promotions/promotions.component').then(m => m.PromotionsComponent)
  },
  {
    path: 'reservation',
    canActivate: [clientAuthGuard],
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'login',
    redirectTo: 'login/admin',
    pathMatch: 'full'
  },
  {
    path: 'login/admin',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'compte/connexion',
    loadComponent: () => import('./auth/client-login/client-login.component').then(m => m.ClientLoginComponent)
  },
  {
    path: 'compte/inscription',
    loadComponent: () => import('./auth/client-register/client-register.component').then(m => m.ClientRegisterComponent)
  },
  {
    path: 'compte/reservations',
    canActivate: [clientAuthGuard],
    loadComponent: () => import('./pages/compte/reservations/client-reservations.component').then(m => m.ClientReservationsComponent)
  },
  {
    path: 'compte/profil',
    canActivate: [clientAuthGuard],
    loadComponent: () => import('./pages/compte/profil/client-profil.component').then(m => m.ClientProfilComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'hotels', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'hotels', loadComponent: () => import('./admin/hotels/admin-hotels.component').then(m => m.AdminHotelsComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./admin/utilisateurs/admin-utilisateurs.component').then(m => m.AdminUtilisateursComponent) },
      { path: 'clients', loadComponent: () => import('./admin/clients/admin-clients.component').then(m => m.AdminClientsComponent) },
      { path: 'reservations', loadComponent: () => import('./admin/reservations/admin-reservations.component').then(m => m.AdminReservationsComponent) },
      { path: 'avis', loadComponent: () => import('./admin/avis/admin-avis.component').then(m => m.AdminAvisComponent) },
      { path: 'promotions', loadComponent: () => import('./admin/promotions/admin-promotions.component').then(m => m.AdminPromotionsComponent) },
      { path: 'agences', loadComponent: () => import('./admin/agences/admin-agences.component').then(m => m.AdminAgencesComponent) },
      { path: 'admins', loadComponent: () => import('./admin/admins/admin-admins.component').then(m => m.AdminAdminsComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
