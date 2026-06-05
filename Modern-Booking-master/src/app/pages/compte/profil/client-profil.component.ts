import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClientService } from '../../../core/services/client.service';
import { ClientAuthService } from '../../../core/services/client-auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-client-profil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './client-profil.component.html'
})
export class ClientProfilComponent implements OnInit {
  clientAuth = inject(ClientAuthService);
  private clientService = inject(ClientService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  saving = signal(false);
  editMode = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  ngOnInit(): void {
    const client = this.clientAuth.currentClient();
    if (client) {
      this.form.patchValue({ fullName: client.fullName, email: client.email, phone: client.phone });
    }
  }

  get initials(): string {
    const name = this.clientAuth.currentClient()?.fullName ?? '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  startEdit(): void {
    this.editMode.set(true);
  }

  cancelEdit(): void {
    const client = this.clientAuth.currentClient();
    if (client) {
      this.form.patchValue({ fullName: client.fullName, email: client.email, phone: client.phone });
    }
    this.form.markAsPristine();
    this.editMode.set(false);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.clientAuth.currentClient()?.id;
    if (!id) return;

    this.saving.set(true);
    const { fullName, email, phone } = this.form.getRawValue();
    this.clientService.update(id, { fullName: fullName!, email: email!, phone: phone! }).subscribe({
      next: (updated) => {
        this.clientAuth.setClient(updated);
        this.saving.set(false);
        this.editMode.set(false);
        this.toast.success('Profil mis à jour avec succès.');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erreur lors de la mise à jour du profil.');
      }
    });
  }
}
