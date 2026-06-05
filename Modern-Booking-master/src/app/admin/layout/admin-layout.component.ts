import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  pageTitle = signal('Tableau de bord');

  readonly role = this.auth.role;
  readonly currentAdmin = this.auth.currentAdmin;
  readonly isAdmin = computed(() => this.role() === 'ADMIN');

  private allNavItems: NavItem[] = [
    { path: '/admin/dashboard',    label: 'Tableau de bord', icon: 'dashboard',  adminOnly: true },
    { path: '/admin/hotels',       label: 'Hôtels',          icon: 'hotel' },
    { path: '/admin/utilisateurs', label: 'Utilisateurs',    icon: 'users',      adminOnly: true },
    { path: '/admin/reservations', label: 'Réservations',    icon: 'calendar' },
    { path: '/admin/avis',         label: 'Avis',            icon: 'star',       adminOnly: true },
  ];

  navItems = computed(() =>
    this.allNavItems.filter(item => !item.adminOnly || this.isAdmin())
  );

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url;
      const matched = this.allNavItems.find(n => url.startsWith(n.path));
      this.pageTitle.set(matched?.label ?? 'Administration');
      this.sidebarOpen.set(false);
    });

    // Redirect agents away from admin-only pages
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url;
      const adminOnlyPaths = ['/admin/dashboard', '/admin/utilisateurs', '/admin/avis'];
      if (this.role() === 'AGENT' && adminOnlyPaths.some(p => url.startsWith(p))) {
        this.router.navigate(['/admin/hotels']);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
