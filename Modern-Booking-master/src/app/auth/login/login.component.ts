import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.toast.success('Connexion réussie ! Bienvenue.');
        this.router.navigate(['/admin']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.errorMsg.set('Nom d’utilisateur ou mot de passe incorrect.');
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
