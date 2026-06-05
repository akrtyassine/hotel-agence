import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HotelService } from '../../core/services/hotel.service';
import { PromotionService } from '../../core/services/promotion.service';
import { Hotel } from '../../core/models/hotel.model';
import { Promotion } from '../../core/models/promotion.model';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, HeaderComponent, FooterComponent],
  templateUrl: './hotels.component.html'
})
export class HotelsComponent implements OnInit {
  private hotelService = inject(HotelService);
  private promotionService = inject(PromotionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allHotels = signal<Hotel[]>([]);
  allPromotions = signal<Promotion[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  selectedCity = signal('');
  maxPrice = signal<number | null>(null);
  sortBy = signal<'name' | 'price_asc' | 'price_desc'>('name');
  onlyWithPromo = signal(false);

  cities = computed(() =>
    [...new Set(this.allHotels().map(h => h.city))].sort()
  );

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

  filtered = computed(() => {
    let list = this.allHotels();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q)
    );
    if (this.selectedCity()) list = list.filter(h => h.city === this.selectedCity());
    if (this.maxPrice() !== null) list = list.filter(h => h.pricePerNight <= this.maxPrice()!);
    if (this.onlyWithPromo()) list = list.filter(h => this.activePromoMap().has(h.id!));

    const sort = this.sortBy();
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'price_asc') list = [...list].sort((a, b) => this.getDiscountedPrice(a) - this.getDiscountedPrice(b));
    else if (sort === 'price_desc') list = [...list].sort((a, b) => this.getDiscountedPrice(b) - this.getDiscountedPrice(a));

    return list;
  });

  private readonly gradients = [
    'linear-gradient(135deg, #F5D5C0 0%, #E07040 100%)',
    'linear-gradient(135deg, #F0C8A0 0%, #C46830 100%)',
    'linear-gradient(135deg, #E8D4B4 0%, #B87840 100%)',
    'linear-gradient(135deg, #F5C4A4 0%, #CC5830 100%)',
    'linear-gradient(135deg, #EAD4C0 0%, #B46840 100%)',
    'linear-gradient(135deg, #F0D0B4 0%, #C06838 100%)',
  ];

  readonly pageSize = 6;
  currentPage = signal(1);

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedHotels = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery.set(params['q']);
    });
    forkJoin({
      hotels: this.hotelService.getAll(),
      promotions: this.promotionService.getAll(),
    }).subscribe({
      next: ({ hotels, promotions }) => {
        this.allHotels.set(hotels);
        this.allPromotions.set(promotions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCity.set('');
    this.maxPrice.set(null);
    this.sortBy.set('name');
    this.onlyWithPromo.set(false);
    this.currentPage.set(1);
    this.router.navigate([], { queryParams: {} });
  }

  setCity(city: string): void { this.selectedCity.set(city); this.currentPage.set(1); }
  setMaxPrice(p: number | null): void { this.maxPrice.set(p); this.currentPage.set(1); }
  setSortBy(s: 'name' | 'price_asc' | 'price_desc'): void { this.sortBy.set(s); this.currentPage.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.currentPage.set(n); }

  getHotelGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }
}
