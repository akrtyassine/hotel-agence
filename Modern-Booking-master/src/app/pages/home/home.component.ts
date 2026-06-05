import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { HotelService } from '../../core/services/hotel.service';
import { AvisService } from '../../core/services/avis.service';
import { PromotionService } from '../../core/services/promotion.service';
import { ClientService } from '../../core/services/client.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Hotel } from '../../core/models/hotel.model';
import { Avis } from '../../core/models/avis.model';
import { Promotion } from '../../core/models/promotion.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe, HeaderComponent, FooterComponent, StarRatingComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private hotelService = inject(HotelService);
  private avisService = inject(AvisService);
  private promotionService = inject(PromotionService);
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  searchQuery = '';
  allHotels = signal<Hotel[]>([]);
  allAvis = signal<Avis[]>([]);
  allPromotions = signal<Promotion[]>([]);
  loading = signal(true);

  stats = signal({ hotelsCount: 0, clientsCount: 0, reservationsCount: 0 });

  featuredHotels = computed(() => this.allHotels().slice(0, 6));

  activePromotions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allPromotions()
      .filter(p => p.startDate <= today && today <= p.endDate)
      .slice(0, 3);
  });

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

  getActivePromo(hotel: Hotel): Promotion | null {
    return this.activePromoMap().get(hotel.id!) ?? null;
  }

  getDiscountedPrice(hotel: Hotel): number {
    const promo = this.getActivePromo(hotel);
    return promo ? hotel.pricePerNight * (1 - promo.discountPercent / 100) : hotel.pricePerNight;
  }

  recentAvis = computed(() => this.allAvis().slice(0, 3));

  private readonly gradients = [
    'linear-gradient(135deg, #F5D5C0 0%, #E07040 100%)',
    'linear-gradient(135deg, #F0C8A0 0%, #C46830 100%)',
    'linear-gradient(135deg, #E8D4B4 0%, #B87840 100%)',
    'linear-gradient(135deg, #F5C4A4 0%, #CC5830 100%)',
    'linear-gradient(135deg, #EAD4C0 0%, #B46840 100%)',
    'linear-gradient(135deg, #F0D0B4 0%, #C06838 100%)',
  ];

  ngOnInit(): void {
    forkJoin({
      hotels: this.hotelService.getAll(),
      avis: this.avisService.getAll(),
      promotions: this.promotionService.getAll(),
      clients: this.clientService.getAll(),
      reservations: this.reservationService.getAll(),
    }).subscribe({
      next: ({ hotels, avis, promotions, clients, reservations }) => {
        this.allHotels.set(hotels);
        this.allAvis.set(avis);
        this.allPromotions.set(promotions);
        this.stats.set({
          hotelsCount: hotels.length,
          clientsCount: clients.length,
          reservationsCount: reservations.length,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search(): void {
    this.router.navigate(['/hotels'], { queryParams: { q: this.searchQuery } });
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }

  getHotelGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  getHotelName(promo: Promotion): string {
    return (promo.hotel as Hotel)?.name ?? 'Hôtel';
  }

  getHotelId(promo: Promotion): number {
    return (promo.hotel as Hotel)?.id ?? (promo.hotel as { id: number }).id;
  }

  getClientInitial(avis: Avis): string {
    const name = (avis.client as any)?.fullName ?? 'C';
    return name.charAt(0).toUpperCase();
  }

  getClientName(avis: Avis): string {
    return (avis.client as any)?.fullName ?? 'Client anonyme';
  }

  getAvisHotelName(avis: Avis): string {
    return (avis.hotel as Hotel)?.name ?? '';
  }
}
