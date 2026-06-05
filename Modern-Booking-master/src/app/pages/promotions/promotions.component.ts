import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { PromotionService } from '../../core/services/promotion.service';
import { HotelService } from '../../core/services/hotel.service';
import { Promotion } from '../../core/models/promotion.model';
import { Hotel } from '../../core/models/hotel.model';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, HeaderComponent, FooterComponent],
  templateUrl: './promotions.component.html'
})
export class PromotionsComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private hotelService = inject(HotelService);

  allPromotions = signal<Promotion[]>([]);
  allHotels = signal<Hotel[]>([]);
  loading = signal(true);

  private readonly gradients = [
    'linear-gradient(135deg, #F5D5C0 0%, #E07040 100%)',
    'linear-gradient(135deg, #F0C8A0 0%, #C46830 100%)',
    'linear-gradient(135deg, #E8D4B4 0%, #B87840 100%)',
    'linear-gradient(135deg, #F5C4A4 0%, #CC5830 100%)',
    'linear-gradient(135deg, #EAD4C0 0%, #B46840 100%)',
    'linear-gradient(135deg, #F0D0B4 0%, #C06838 100%)',
  ];

  activePromotions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allPromotions().filter(p => p.startDate <= today && today <= p.endDate);
  });

  upcomingPromotions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allPromotions().filter(p => p.startDate > today);
  });

  ngOnInit(): void {
    forkJoin({
      promotions: this.promotionService.getAll(),
      hotels: this.hotelService.getAll(),
    }).subscribe({
      next: ({ promotions, hotels }) => {
        this.allPromotions.set(promotions);
        this.allHotels.set(hotels);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getHotel(promo: Promotion): Hotel | null {
    const hotelId = (promo.hotel as Hotel)?.id ?? (promo.hotel as { id: number }).id;
    return this.allHotels().find(h => h.id === hotelId) ?? null;
  }

  getHotelId(promo: Promotion): number {
    return (promo.hotel as Hotel)?.id ?? (promo.hotel as { id: number }).id;
  }

  getDiscountedPrice(promo: Promotion): number {
    const hotel = this.getHotel(promo);
    if (!hotel) return 0;
    return hotel.pricePerNight * (1 - promo.discountPercent / 100);
  }

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  imgSrc(url: string): string {
    return url.startsWith('http') ? url : 'http://localhost:8082' + url;
  }
}
