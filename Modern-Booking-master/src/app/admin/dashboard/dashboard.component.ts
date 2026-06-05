import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { HotelService } from '../../core/services/hotel.service';
import { ClientService } from '../../core/services/client.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AvisService } from '../../core/services/avis.service';
import { Hotel } from '../../core/models/hotel.model';
import { Client } from '../../core/models/client.model';
import { Reservation } from '../../core/models/reservation.model';
import { Avis } from '../../core/models/avis.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private avisService = inject(AvisService);

  hotels = signal<Hotel[]>([]);
  clients = signal<Client[]>([]);
  reservations = signal<Reservation[]>([]);
  avis = signal<Avis[]>([]);
  loading = signal(true);

  stats = computed(() => {
    const avsList = this.avis();
    const avgRating = avsList.length
      ? avsList.reduce((s, a) => s + a.rating, 0) / avsList.length
      : 0;
    const totalRevenue = this.reservations().reduce((s, r) => s + r.totalPrice, 0);
    return {
      hotels: this.hotels().length,
      clients: this.clients().length,
      reservations: this.reservations().length,
      avgRating: Math.round(avgRating * 10) / 10,
      totalRevenue,
    };
  });

  recentReservations = computed(() =>
    [...this.reservations()]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 6)
  );

  ngOnInit(): void {
    forkJoin({
      hotels: this.hotelService.getAll(),
      clients: this.clientService.getAll(),
      reservations: this.reservationService.getAll(),
      avis: this.avisService.getAll(),
    }).subscribe({
      next: ({ hotels, clients, reservations, avis }) => {
        this.hotels.set(hotels);
        this.clients.set(clients);
        this.reservations.set(reservations);
        this.avis.set(avis);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getReservationHotel(r: Reservation): string {
    return (r.hotel as Hotel)?.name ?? 'N/A';
  }

  getReservationClient(r: Reservation): string {
    return (r.client as Client)?.fullName ?? 'N/A';
  }
}
