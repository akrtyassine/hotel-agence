import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { AgenceService } from '../../core/services/agence.service';
import { ToastService } from '../../core/services/toast.service';
import { Agence } from '../../core/models/agence.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-agences',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-agences.component.html'
})
export class AdminAgencesComponent implements OnInit {
  private service = inject(AgenceService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  agences = signal<Agence[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Agence | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.agences().filter(a => !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.address.toLowerCase().includes(q));
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: data => { this.agences.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  openAdd(): void { this.editingItem.set(null); this.form.reset(); this.showModal.set(true); }

  openEdit(item: Agence): void {
    this.editingItem.set(item);
    this.form.patchValue({ name: item.name, address: item.address, email: item.email });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.value as Agence;
    const editing = this.editingItem();
    if (editing) {
      this.service.update(editing.id!, data).subscribe({
        next: updated => { this.agences.update(l => l.map(a => a.id === updated.id ? updated : a)); this.toast.success('Agence modifiée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur modification.')
      });
    } else {
      this.service.create(data).subscribe({
        next: created => { this.agences.update(l => [...l, created]); this.toast.success('Agence créée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur création.')
      });
    }
  }

  remove(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.agences.update(l => l.filter(a => a.id !== id)); this.toast.success('Agence supprimée.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }
}
