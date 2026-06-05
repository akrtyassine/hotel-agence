import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { Client } from '../../core/models/client.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-clients.component.html'
})
export class AdminClientsComponent implements OnInit {
  private clientService = inject(ClientService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  clients = signal<Client[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Client | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.clients().filter(c =>
      !q || c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,}$/)]],
    password: [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: data => { this.clients.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  openAdd(): void {
    this.editingItem.set(null);
    this.form.reset();
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')!.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(item: Client): void {
    this.editingItem.set(item);
    this.form.patchValue({ ...item, password: '' });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.value;
    const editing = this.editingItem();
    if (editing) {
      const data: Client = { fullName: raw.fullName!, email: raw.email!, phone: raw.phone! };
      if (raw.password) data.password = raw.password;
      this.clientService.update(editing.id!, data).subscribe({
        next: updated => { this.clients.update(l => l.map(c => c.id === updated.id ? updated : c)); this.toast.success('Client modifié !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.clientService.create(raw as Client).subscribe({
        next: created => { this.clients.update(l => [...l, created]); this.toast.success('Client ajouté !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  remove(id: number): void {
    this.clientService.delete(id).subscribe({
      next: () => { this.clients.update(l => l.filter(c => c.id !== id)); this.toast.success('Client supprimé.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }
}
