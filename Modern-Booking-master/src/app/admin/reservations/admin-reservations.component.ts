import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ReservationService } from '../../core/services/reservation.service';
import { HotelService } from '../../core/services/hotel.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Reservation } from '../../core/models/reservation.model';
import { Hotel } from '../../core/models/hotel.model';
import { Client } from '../../core/models/client.model';
import { createPagination } from '../shared/pagination.util';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './admin-reservations.component.html'
})
export class AdminReservationsComponent implements OnInit {
  private service = inject(ReservationService);
  private hotelService = inject(HotelService);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  reservations = signal<Reservation[]>([]);
  hotels = signal<Hotel[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingItem = signal<Reservation | null>(null);
  deleteConfirmId = signal<number | null>(null);
  searchQuery = signal('');

  isAgent = computed(() => this.authService.role() === 'AGENT');
  isAdmin = computed(() => this.authService.role() === 'ADMIN');

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.reservations().filter(r => {
      if (!q) return true;
      const hotel = (r.hotel as Hotel)?.name?.toLowerCase() ?? '';
      const client = (r.client as Client)?.fullName?.toLowerCase() ?? '';
      return hotel.includes(q) || client.includes(q);
    });
  });

  pagination = createPagination(this.filtered);

  updateSearch(query: string): void { this.searchQuery.set(query); this.pagination.reset(); }

  form = this.fb.group({
    hotelId: [null as number | null, Validators.required],
    clientId: [null as number | null, Validators.required],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required],
    totalPrice: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    const agentId = this.authService.adminId();
    const reservations$ = this.isAgent() && agentId
      ? this.service.getByAgent(agentId)
      : this.service.getAll();
    const hotels$ = this.isAgent() && agentId
      ? this.hotelService.getByAgent(agentId)
      : this.hotelService.getAll();

    forkJoin({
      reservations: reservations$,
      hotels: hotels$,
      clients: this.clientService.getAll(),
    }).subscribe({
      next: ({ reservations, hotels, clients }) => {
        this.reservations.set(reservations);
        this.hotels.set(hotels);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });

    // Auto-compute total price when dates/hotel change
    this.form.valueChanges.subscribe(() => this.autoPrice());
  }

  private autoPrice(): void {
    const { checkInDate, checkOutDate, hotelId } = this.form.value;
    if (!checkInDate || !checkOutDate || !hotelId) return;
    const nights = Math.max(0, Math.floor(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const hotel = this.hotels().find(h => h.id === Number(hotelId));
    if (hotel && nights > 0) {
      this.form.get('totalPrice')?.setValue(Math.round(hotel.pricePerNight * nights * 100) / 100, { emitEvent: false });
    }
  }

  openAdd(): void {
    this.editingItem.set(null);
    this.form.reset({ totalPrice: 0 });
    this.showModal.set(true);
  }

  openEdit(item: Reservation): void {
    this.editingItem.set(item);
    this.form.patchValue({
      hotelId: (item.hotel as Hotel).id ?? null,
      clientId: (item.client as Client).id ?? null,
      checkInDate: item.checkInDate,
      checkOutDate: item.checkOutDate,
      totalPrice: item.totalPrice,
    });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingItem.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const data = {
      checkInDate: v.checkInDate!,
      checkOutDate: v.checkOutDate!,
      totalPrice: v.totalPrice!,
      hotel: { id: Number(v.hotelId) },
      client: { id: Number(v.clientId) },
    };
    const editing = this.editingItem();
    if (editing) {
      this.service.update(editing.id!, data).subscribe({
        next: updated => { this.reservations.update(l => l.map(r => r.id === updated.id ? updated : r)); this.toast.success('Réservation modifiée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.service.create(data).subscribe({
        next: created => { this.reservations.update(l => [...l, created]); this.toast.success('Réservation créée !'); this.closeModal(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  remove(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.reservations.update(l => l.filter(r => r.id !== id)); this.toast.success('Réservation supprimée.'); this.deleteConfirmId.set(null); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  validate(id: number): void {
    this.service.validate(id).subscribe({
      next: updated => { this.reservations.update(l => l.map(r => r.id === updated.id ? updated : r)); this.toast.success('Réservation validée !'); },
      error: () => this.toast.error('Erreur lors de la validation.')
    });
  }

  reject(id: number): void {
    this.service.reject(id).subscribe({
      next: updated => { this.reservations.update(l => l.map(r => r.id === updated.id ? updated : r)); this.toast.success('Réservation rejetée.'); },
      error: () => this.toast.error('Erreur lors du rejet.')
    });
  }

  getHotelName(r: Reservation): string { return (r.hotel as Hotel)?.name ?? 'N/A'; }
  getClientName(r: Reservation): string { return (r.client as Client)?.fullName ?? 'N/A'; }

  statusLabel(status?: string): string {
    switch (status) {
      case 'VALIDATED': return 'Validée';
      case 'REJECTED': return 'Rejetée';
      default: return 'En attente';
    }
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'VALIDATED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-700';
    }
  }
}
