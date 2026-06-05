import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../../core/services/client-auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './client-login.component.html'
})
export class ClientLoginComponent {
  private clientAuth = inject(ClientAuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.form.value;

    this.clientAuth.login(email!, password!).subscribe({
      next: () => {
        this.toast.success('Connexion réussie ! Bienvenue.');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.errorMsg.set('Email ou mot de passe incorrect.');
        } else if (err.status === 0) {
          this.errorMsg.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
        } else {
          this.errorMsg.set('Une erreur est survenue. Veuillez réessayer.');
        }
        this.loading.set(false);
      }
    });
  }
}
