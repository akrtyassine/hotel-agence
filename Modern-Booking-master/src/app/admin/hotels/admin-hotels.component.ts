import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HotelService } from '../../core/services/hotel.service';
import { AdminService } from '../../core/services/admin.service';
import { PromotionService } from '../../core/services/promotion.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Hotel } from '../../core/models/hotel.model';
import { Admin } from '../../core/models/admin.model';
import { Promotion } from '../../core/models/promotion.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-hotels',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-hotels.component.html'
})
export class AdminHotelsComponent implements OnInit {
  private hotelService = inject(HotelService);
  private adminService = inject(AdminService);
  private promotionService = inject(PromotionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  hotels = signal<Hotel[]>([]);
  agents = signal<Admin[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Hotel | null>(null);
  deleteConfirmId = signal<number | null>(null);
  uploadingId = signal<number | null>(null);
  readonly backendBase = 'http://localhost:8082';
  searchQuery = signal('');

  // Promotions modal
  showPromosModal = signal(false);
  selectedHotel = signal<Hotel | null>(null);
  hotelPromotions = signal<Promotion[]>([]);
  showPromoModal = signal(false);
  editingPromo = signal<Promotion | null>(null);
  deletePromoConfirmId = signal<number | null>(null);
  allPromotions = signal<Promotion[]>([]);

  isAdmin = computed(() => this.authService.role() === 'ADMIN');

  activePromoMap = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const map = new Map<number, Promotion>();
    for (const p of this.allPromotions()) {
      if (p.startDate <= today && today <= p.endDate) {
        const hotelId = (p.hotel as Hotel)?.id ?? (p.hotel as { id: number }).id;
        if (!map.has(hotelId)) map.set(hotelId, p);
      }
    }
    return map;
  });

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.hotels().filter(h =>
      !q || h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q)
    );
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', Validators.required],
    address: ['', Validators.required],
    pricePerNight: [0, [Validators.required, Validators.min(1)]],
    agentId: [null as number | null],
  });

  promoForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    discountPercent: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
    this.promotionService.getAll().subscribe({ next: p => this.allPromotions.set(p) });
    if (this.isAdmin()) {
      this.adminService.getAgents().subscribe({ next: a => this.agents.set(a) });
    }
  }

  getActivePromo(hotel: Hotel): Promotion | null {
    return this.activePromoMap().get(hotel.id!) ?? null;
  }

  getDiscountedPrice(hotel: Hotel): number {
    const promo = this.getActivePromo(hotel);
    return promo ? hotel.pricePerNight * (1 - promo.discountPercent / 100) : hotel.pricePerNight;
  }

  load(): void {
    this.loading.set(true);
    const agentId = this.authService.adminId();
    const req = this.isAdmin() ? this.hotelService.getAll() : this.hotelService.getByAgent(agentId!);
    req.subscribe({
      next: data => { this.hotels.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  openAdd(): void { this.editingItem.set(null); this.form.reset({ pricePerNight: 0 }); this.showModal.set(true); }

  openEdit(item: Hotel): void {
    this.editingItem.set(item);
    const agentId = (item.agent as Admin)?.id ?? (item.agent as { id: number })?.id ?? null;
    this.form.patchValue({ ...item, agentId });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    // Agents are always assigned to themselves
    const agentId = this.isAdmin() ? v.agentId : this.authService.adminId();
    const data: Partial<Hotel> = {
      name: v.name!,
      city: v.city!,
      address: v.address!,
      pricePerNight: v.pricePerNight!,
      agent: agentId ? { id: agentId } : null,
    };
    const editing = this.editingItem();
    if (editing) {
      this.hotelService.update(editing.id!, data as Hotel).subscribe({
        next: updated => { this.hotels.update(l => l.map(h => h.id === updated.id ? updated : h)); this.toast.success('Hôtel modifié !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.hotelService.create(data as Hotel).subscribe({
        next: created => { this.hotels.update(l => [...l, created]); this.toast.success('Hôtel ajouté !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  remove(id: number): void {
    this.hotelService.delete(id).subscribe({
      next: () => { this.hotels.update(l => l.filter(h => h.id !== id)); this.toast.success('Hôtel supprimé.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  imgSrc(url: string): string {
    return url.startsWith('http') ? url : this.backendBase + url;
  }

  getAgentName(hotel: Hotel): string {
    const a = hotel.agent as Admin;
    return a?.username ?? '—';
  }

  onImageSelected(hotelId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadingId.set(hotelId);
    this.hotelService.uploadImage(hotelId, file).subscribe({
      next: updated => {
        this.hotels.update(l => l.map(h => h.id === updated.id ? updated : h));
        if (this.editingItem()?.id === hotelId) this.editingItem.set(updated);
        this.toast.success('Image mise à jour !');
        this.uploadingId.set(null);
        input.value = '';
      },
      error: () => { this.toast.error('Erreur lors de l\'upload.'); this.uploadingId.set(null); }
    });
  }

  // ── Promotions ──────────────────────────────────────────────────
  openHotelPromos(hotel: Hotel): void {
    this.selectedHotel.set(hotel);
    this.showPromosModal.set(true);
    this.loadHotelPromos(hotel.id!);
  }

  private loadHotelPromos(hotelId: number): void {
    this.promotionService.getAll().subscribe({
      next: all => this.hotelPromotions.set(all.filter(p => (p.hotel as { id: number }).id === hotelId || (p.hotel as Hotel).id === hotelId)),
    });
  }

  closePromosModal(): void { this.showPromosModal.set(false); this.selectedHotel.set(null); this.hotelPromotions.set([]); this.closePromoModal(); }

  openAddPromo(): void { this.editingPromo.set(null); this.promoForm.reset(); this.showPromoModal.set(true); }

  openEditPromo(p: Promotion): void {
    this.editingPromo.set(p);
    this.promoForm.patchValue({ code: p.code, discountPercent: p.discountPercent, startDate: p.startDate, endDate: p.endDate });
    this.showPromoModal.set(true);
  }

  closePromoModal(): void { this.showPromoModal.set(false); this.editingPromo.set(null); }

  savePromo(): void {
    if (this.promoForm.invalid) { this.promoForm.markAllAsTouched(); return; }
    const v = this.promoForm.value;
    const hotel = this.selectedHotel()!;
    const data: Partial<Promotion> = { code: v.code!, discountPercent: v.discountPercent!, startDate: v.startDate!, endDate: v.endDate!, hotel: { id: hotel.id! } };
    const editing = this.editingPromo();
    if (editing) {
      this.promotionService.update(editing.id!, data).subscribe({
        next: updated => { this.hotelPromotions.update(l => l.map(p => p.id === updated.id ? updated : p)); this.toast.success('Promotion modifiée !'); this.closePromoModal(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.promotionService.create(data).subscribe({
        next: created => { this.hotelPromotions.update(l => [...l, created]); this.toast.success('Promotion créée !'); this.closePromoModal(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  removePromo(id: number): void {
    this.promotionService.delete(id).subscribe({
      next: () => { this.hotelPromotions.update(l => l.filter(p => p.id !== id)); this.toast.success('Promotion supprimée.'); this.deletePromoConfirmId.set(null); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }
}
