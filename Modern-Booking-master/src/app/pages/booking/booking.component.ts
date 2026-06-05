import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HotelService } from '../../core/services/hotel.service';
import { ClientAuthService } from '../../core/services/client-auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { PromotionService } from '../../core/services/promotion.service';
import { ToastService } from '../../core/services/toast.service';
import { Hotel } from '../../core/models/hotel.model';
import { Promotion } from '../../core/models/promotion.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe, DatePipe, HeaderComponent, FooterComponent],
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hotelService = inject(HotelService);
  private clientAuth = inject(ClientAuthService);
  private reservationService = inject(ReservationService);
  private promotionService = inject(PromotionService);
  private toast = inject(ToastService);

  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  activePromotion = signal<Promotion | null>(null);
  step = signal<1 | 2>(1);
  loading = signal(false);
  confirmed = signal(false);
  today = new Date().toISOString().split('T')[0];

  // Signal-backed date values so computed() tracks them reactively
  checkInVal  = signal('');
  checkOutVal = signal('');

  minCheckOut = computed(() => {
    const checkIn = this.checkInVal();
    if (!checkIn) return this.today;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  /** Client is guaranteed to exist (route is guarded by clientAuthGuard) */
  client = this.clientAuth.currentClient;

  form = this.fb.group({
    hotelId: [null as number | null, Validators.required],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required],
  });

  nights = computed(() => {
    const checkIn  = this.checkInVal();
    const checkOut = this.checkOutVal();
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });

  basePrice = computed(() => {
    const h = this.selectedHotel();
    if (!h) return 0;
    return this.nights() * h.pricePerNight;
  });

  discountedPrice = computed(() => {
    const promo = this.activePromotion();
    if (!promo) return this.basePrice();
    return this.basePrice() * (1 - promo.discountPercent / 100);
  });

  ngOnInit(): void {
    this.hotelService.getAll().subscribe(hotels => {
      this.hotels.set(hotels);
      const preselectedId = this.route.snapshot.queryParamMap.get('hotelId');
      if (preselectedId) {
        this.form.get('hotelId')?.setValue(Number(preselectedId));
        const h = hotels.find(h => h.id === Number(preselectedId));
        if (h) this.selectedHotel.set(h);
        this.loadPromotions(Number(preselectedId));
      }
    });

    this.form.get('checkInDate')?.valueChanges.subscribe(checkIn => {
      this.checkInVal.set(checkIn ?? '');
      // Clear checkout if it's no longer after checkin
      const checkOut = this.form.get('checkOutDate')?.value;
      if (checkIn && checkOut && checkOut <= checkIn) {
        this.form.get('checkOutDate')?.setValue('');
      }
    });

    this.form.get('checkOutDate')?.valueChanges.subscribe(v => this.checkOutVal.set(v ?? ''));

    this.form.get('hotelId')?.valueChanges.subscribe(id => {
      if (id) {
        const h = this.hotels().find(h => h.id === Number(id));
        this.selectedHotel.set(h ?? null);
        this.loadPromotions(Number(id));
      } else {
        this.selectedHotel.set(null);
        this.activePromotion.set(null);
      }
    });
  }

  private loadPromotions(hotelId: number): void {
    this.promotionService.getAll().subscribe(promos => {
      const today = new Date().toISOString().split('T')[0];
      const active = promos.find(p =>
        (p.hotel as Hotel).id === hotelId &&
        p.startDate <= today && today <= p.endDate
      );
      this.activePromotion.set(active ?? null);
    });
  }

  goToStep2(): void {
    const g = this.form;
    if (!g.get('hotelId')?.valid) { this.toast.warning('Veuillez sélectionner un hôtel.'); return; }
    if (!g.get('checkInDate')?.valid || !g.get('checkOutDate')?.valid) { this.toast.warning('Veuillez sélectionner les dates.'); return; }
    if (this.nights() < 1) { this.toast.warning('La date de départ doit être après la date d\'arrivée.'); return; }
    this.step.set(2);
  }

  async confirm(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    const v = this.form.value;
    try {
      await this.reservationService.create({
        checkInDate: v.checkInDate!,
        checkOutDate: v.checkOutDate!,
        totalPrice: Math.round(this.discountedPrice() * 100) / 100,
        hotel: { id: Number(v.hotelId) },
        client: { id: this.client()!.id! },
      }).toPromise();
      this.confirmed.set(true);
      this.toast.success('Réservation confirmée avec succès !');
    } catch {
      this.toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.loading.set(false);
    }
  }
}
