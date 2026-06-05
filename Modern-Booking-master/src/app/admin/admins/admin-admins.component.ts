import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Admin } from '../../core/models/admin.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-admins',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-admins.component.html'
})
export class AdminAdminsComponent implements OnInit {
  private service = inject(AdminService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  admins = signal<Admin[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Admin | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');
  showPassword = signal(false);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.admins().filter(a => !q || a.username.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ADMIN' as 'ADMIN' | 'AGENT', Validators.required],
  });

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: data => { this.admins.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  openAdd(): void { this.editingItem.set(null); this.form.reset({ role: 'ADMIN' }); this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]); this.form.get('password')?.updateValueAndValidity(); this.showModal.set(true); }

  openEdit(item: Admin): void {
    this.editingItem.set(item);
    this.form.patchValue({ username: item.username, password: '', role: item.role });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const editing = this.editingItem();
    const data: Partial<Admin> = { username: v.username!, role: v.role! };
    if (v.password) data.password = v.password;

    if (editing) {
      this.service.update(editing.id!, data as Admin).subscribe({
        next: updated => { this.admins.update(l => l.map(a => a.id === updated.id ? updated : a)); this.toast.success('Administrateur modifié !'); this.closeModal(); },
        error: () => this.toast.error('Erreur modification.')
      });
    } else {
      this.service.create(data as Admin).subscribe({
        next: created => { this.admins.update(l => [...l, created]); this.toast.success('Administrateur créé !'); this.closeModal(); },
        error: () => this.toast.error('Erreur création.')
      });
    }
  }

  remove(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.admins.update(l => l.filter(a => a.id !== id)); this.toast.success('Administrateur supprimé.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700';
  }
}
