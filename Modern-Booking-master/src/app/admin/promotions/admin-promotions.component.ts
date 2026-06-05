import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SlicePipe } from '@angular/common';

import { PromotionService } from '../../core/services/promotion.service';
import { HotelService } from '../../core/services/hotel.service';
import { ToastService } from '../../core/services/toast.service';
import { Promotion } from '../../core/models/promotion.model';
import { Hotel } from '../../core/models/hotel.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './admin-promotions.component.html'
})
export class AdminPromotionsComponent implements OnInit {
  private service = inject(PromotionService);
  private hotelService = inject(HotelService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  promotions = signal<Promotion[]>([]);
  hotels = signal<Hotel[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Promotion | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.promotions().filter(p =>
      !q || p.code.toLowerCase().includes(q) || (p.hotel as Hotel)?.name?.toLowerCase().includes(q)
    );
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    discountPercent: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    hotelId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.service.getAll().subscribe({ next: p => this.promotions.set(p), error: () => this.toast.error('Erreur chargement promotions') });
    this.hotelService.getAll().subscribe({ next: h => { this.hotels.set(h); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openAdd(): void { this.editingItem.set(null); this.form.reset(); this.showModal.set(true); }

  openEdit(item: Promotion): void {
    this.editingItem.set(item);
    this.form.patchValue({ code: item.code, discountPercent: item.discountPercent, startDate: item.startDate, endDate: item.endDate, hotelId: (item.hotel as Hotel).id ?? null });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const data = { code: v.code!, discountPercent: v.discountPercent!, startDate: v.startDate!, endDate: v.endDate!, hotel: { id: Number(v.hotelId) } };
    const editing = this.editingItem();
    if (editing) {
      this.service.update(editing.id!, data).subscribe({
        next: updated => { this.promotions.update(l => l.map(p => p.id === updated.id ? updated : p)); this.toast.success('Promotion modifiée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur modification.')
      });
    } else {
      this.service.create(data).subscribe({
        next: created => { this.promotions.update(l => [...l, created]); this.toast.success('Promotion créée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur création.')
      });
    }
  }

  remove(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.promotions.update(l => l.filter(p => p.id !== id)); this.toast.success('Promotion supprimée.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }

  isActive(p: Promotion): boolean {
    const now = new Date(); const start = new Date(p.startDate); const end = new Date(p.endDate);
    return start <= now && now <= end;
  }

  isExpired(p: Promotion): boolean {
    return new Date(p.endDate) < new Date();
  }

  quickActivate(p: Promotion): void {
    const today = new Date().toISOString().split('T')[0];
    // If endDate is already past, extend to today + 30 days
    const endDate = this.isExpired(p)
      ? new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]
      : p.endDate;
    this.service.update(p.id!, { ...p, hotel: { id: (p.hotel as Hotel).id! }, startDate: today, endDate }).subscribe({
      next: updated => {
        this.promotions.update(l => l.map(x => x.id === updated.id ? updated : x));
        this.toast.success(`Promotion ${p.code} activée !`);
      },
      error: () => this.toast.error('Erreur lors de l\'activation.')
    });
  }

  quickDeactivate(p: Promotion): void {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    this.service.update(p.id!, { ...p, hotel: { id: (p.hotel as Hotel).id! }, endDate: yesterday }).subscribe({
      next: updated => {
        this.promotions.update(l => l.map(x => x.id === updated.id ? updated : x));
        this.toast.success(`Promotion ${p.code} désactivée.`);
      },
      error: () => this.toast.error('Erreur lors de la désactivation.')
    });
  }

  getHotelName(p: Promotion): string { return (p.hotel as Hotel)?.name ?? 'N/A'; }
}
