import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AvisService } from '../../core/services/avis.service';
import { HotelService } from '../../core/services/hotel.service';
import { ClientService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { Avis } from '../../core/models/avis.model';
import { Hotel } from '../../core/models/hotel.model';
import { Client } from '../../core/models/client.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [ReactiveFormsModule, StarRatingComponent],
  templateUrl: './admin-avis.component.html'
})
export class AdminAvisComponent implements OnInit {
  private service = inject(AvisService);
  private hotelService = inject(HotelService);
  private clientService = inject(ClientService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  avisList = signal<Avis[]>([]);
  hotels = signal<Hotel[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Avis | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');
  selectedRating = signal(0);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.avisList().filter(a => {
      const matchQ = !q || (a.hotel as Hotel)?.name?.toLowerCase().includes(q) || (a.client as Client)?.fullName?.toLowerCase().includes(q) || a.comment.toLowerCase().includes(q);
      const matchR = !this.selectedRating() || a.rating === this.selectedRating();
      return matchQ && matchR;
    });
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }
  updateRating(r: number): void { this.selectedRating.set(r); this.pagination.reset(); }

  form = this.fb.group({
    hotelId: [null as number | null, Validators.required],
    clientId: [null as number | null, Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    forkJoin({ avis: this.service.getAll(), hotels: this.hotelService.getAll(), clients: this.clientService.getAll() }).subscribe({
      next: ({ avis, hotels, clients }) => { this.avisList.set(avis); this.hotels.set(hotels); this.clients.set(clients); this.loading.set(false); },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  openAdd(): void { this.editingItem.set(null); this.form.reset({ rating: 5 }); this.showModal.set(true); }

  openEdit(item: Avis): void {
    this.editingItem.set(item);
    this.form.patchValue({ hotelId: (item.hotel as Hotel).id ?? null, clientId: (item.client as Client).id ?? null, rating: item.rating, comment: item.comment });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  setRating(r: number): void { this.form.get('rating')?.setValue(r); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const data = { rating: v.rating!, comment: v.comment!, hotel: { id: Number(v.hotelId) }, client: { id: Number(v.clientId) } };
    const editing = this.editingItem();
    if (editing) {
      this.service.update(editing.id!, data).subscribe({
        next: updated => { this.avisList.update(l => l.map(a => a.id === updated.id ? updated : a)); this.toast.success('Avis modifié !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.service.create(data).subscribe({
        next: created => { this.avisList.update(l => [...l, created]); this.toast.success('Avis ajouté !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  remove(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.avisList.update(l => l.filter(a => a.id !== id)); this.toast.success('Avis supprimé.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  getHotelName(a: Avis): string { return (a.hotel as Hotel)?.name ?? 'N/A'; }
  getClientName(a: Avis): string { return (a.client as Client)?.fullName ?? 'N/A'; }
  getFormRating(): number { return this.form.get('rating')?.value ?? 0; }
}
