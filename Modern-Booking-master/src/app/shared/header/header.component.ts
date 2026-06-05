import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClientAuthService } from '../../core/services/client-auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  auth = inject(AuthService);
  clientAuth = inject(ClientAuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  menuOpen = signal(false);
  userDropdownOpen = signal(false);

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  toggleUserDropdown(e: Event): void {
    e.stopPropagation();
    this.userDropdownOpen.update(v => !v);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userDropdownOpen.set(false);
  }

  logoutClient(): void {
    this.clientAuth.logout();
    this.closeMenu();
    this.userDropdownOpen.set(false);
    this.toast.info('Vous avez été déconnecté.');
    this.router.navigate(['/']);
  }
}
