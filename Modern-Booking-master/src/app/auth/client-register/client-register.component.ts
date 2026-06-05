import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../../core/services/client-auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (password && confirm && password !== confirm) {
    control.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  if (control.get('confirmPassword')?.hasError('mismatch')) {
    control.get('confirmPassword')?.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './client-register.component.html'
})
export class ClientRegisterComponent {
  private clientAuth = inject(ClientAuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatch });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    this.clientAuth.register({
      fullName: this.form.value.fullName!,
      email: this.form.value.email!,
      phone: this.form.value.phone!,
      password: this.form.value.password!,
    }).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès ! Bienvenue.');
        this.router.navigate(['/reservation']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMsg.set('Un compte existe déjà avec cet email.');
        } else if (err.status === 0) {
          this.errorMsg.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
        } else {
          this.errorMsg.set('Impossible de créer le compte. Veuillez réessayer.');
        }
        this.loading.set(false);
      }
    });
  }
}
