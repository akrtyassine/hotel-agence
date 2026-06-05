import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { HotelService } from '../../core/services/hotel.service';
import { AvisService } from '../../core/services/avis.service';
import { PromotionService } from '../../core/services/promotion.service';
import { ClientAuthService } from '../../core/services/client-auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Hotel } from '../../core/models/hotel.model';
import { Avis } from '../../core/models/avis.model';
import { Promotion } from '../../core/models/promotion.model';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule, HeaderComponent, FooterComponent, StarRatingComponent],
  templateUrl: './hotel-detail.component.html'
})
export class HotelDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private hotelService = inject(HotelService);
  private avisService = inject(AvisService);
  private promotionService = inject(PromotionService);
  clientAuth = inject(ClientAuthService);
  private toast = inject(ToastService);

  hotel = signal<Hotel | null>(null);
  hotelAvis = signal<Avis[]>([]);
  hotelPromotions = signal<Promotion[]>([]);
  loading = signal(true);

  // Avis form
  showAvisForm = signal(false);
  newRating = signal(0);
  newComment = signal('');
  submittingAvis = signal(false);

  avgRating = computed(() => {
    const avis = this.hotelAvis();
    if (!avis.length) return 0;
    return avis.reduce((sum, a) => sum + a.rating, 0) / avis.length;
  });

  activePromotions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.hotelPromotions().filter(p => p.startDate <= today && today <= p.endDate);
  });

  alreadyReviewed = computed(() => {
    const clientId = this.clientAuth.currentClient()?.id;
    if (!clientId) return null;
    return this.hotelAvis().find(a => {
      const cid = typeof a.client === 'object' && 'id' in a.client ? a.client.id : null;
      return cid === clientId;
    }) ?? null;
  });

  private readonly gradients = [
    'linear-gradient(135deg, #F5D5C0 0%, #E07040 100%)',
    'linear-gradient(135deg, #F0C8A0 0%, #C46830 100%)',
    'linear-gradient(135deg, #E8D4B4 0%, #B87840 100%)',
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      hotel: this.hotelService.getById(id),
      avis: this.avisService.getAll(),
      promotions: this.promotionService.getAll(),
    }).subscribe({
      next: ({ hotel, avis, promotions }) => {
        this.hotel.set(hotel);
        this.hotelAvis.set(avis.filter(a => (a.hotel as Hotel).id === id));
        this.hotelPromotions.set(promotions.filter(p => (p.hotel as Hotel).id === id));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getGradient(): string {
    const id = this.hotel()?.id ?? 0;
    return this.gradients[id % this.gradients.length];
  }

  getClientInitial(avis: Avis): string {
    return ((avis.client as any)?.fullName ?? 'C').charAt(0).toUpperCase();
  }

  getClientName(avis: Avis): string {
    return (avis.client as any)?.fullName ?? 'Client anonyme';
  }

  getBestDiscount(): number {
    return this.activePromotions().length
      ? Math.max(...this.activePromotions().map(p => p.discountPercent))
      : 0;
  }

  submitAvis(): void {
    if (this.newRating() === 0) { this.toast.warning('Veuillez sélectionner une note.'); return; }
    if (!this.newComment().trim()) { this.toast.warning('Veuillez écrire un commentaire.'); return; }
    this.submittingAvis.set(true);
    this.avisService.create({
      rating: this.newRating(),
      comment: this.newComment().trim(),
      hotel: { id: this.hotel()!.id! },
      client: { id: this.clientAuth.currentClient()!.id! },
    }).subscribe({
      next: (created) => {
        this.hotelAvis.update(list => [...list, created]);
        this.showAvisForm.set(false);
        this.newRating.set(0);
        this.newComment.set('');
        this.submittingAvis.set(false);
        this.toast.success('Votre avis a été publié !');
      },
      error: () => {
        this.submittingAvis.set(false);
        this.toast.error('Erreur lors de la publication de l\'avis.');
      }
    });
  }
}
