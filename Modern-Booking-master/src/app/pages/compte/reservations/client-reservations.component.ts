import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ReservationService } from '../../../core/services/reservation.service';
import { AvisService } from '../../../core/services/avis.service';
import { ClientAuthService } from '../../../core/services/client-auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { StarRatingComponent } from '../../../shared/star-rating/star-rating.component';
import { Reservation } from '../../../core/models/reservation.model';
import { Avis } from '../../../core/models/avis.model';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, FormsModule, HeaderComponent, FooterComponent, StarRatingComponent],
  templateUrl: './client-reservations.component.html'
})
export class ClientReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private avisService = inject(AvisService);
  clientAuth = inject(ClientAuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  reservations = signal<Reservation[]>([]);
  myAvis = signal<Avis[]>([]);
  loading = signal(true);
  cancelConfirmId = signal<number | null>(null);

  /** id of the reservation whose review form is currently open */
  reviewOpenId = signal<number | null>(null);
  pendingRating = signal(0);
  pendingComment = signal('');
  submittingAvis = signal(false);

  ngOnInit(): void {
    const clientId = this.clientAuth.currentClient()?.id;
    if (!clientId) { this.router.navigate(['/compte/connexion']); return; }

    forkJoin({
      reservations: this.reservationService.getAll(),
      avis: this.avisService.getAll(),
    }).subscribe({
      next: ({ reservations, avis }) => {
        const mine = reservations.filter(r => {
          const id = typeof r.client === 'object' && 'id' in r.client ? r.client.id : null;
          return id === clientId;
        });
        // Most recent stays first
        mine.sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
        this.reservations.set(mine);
        this.myAvis.set(avis.filter(a => {
          const cid = typeof a.client === 'object' && 'id' in a.client ? a.client.id : null;
          return cid === clientId;
        }));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Erreur lors du chargement des réservations.'); }
    });
  }

  getHotelName(r: Reservation): string { return (r.hotel as Hotel)?.name ?? '—'; }
  getHotelCity(r: Reservation): string { return (r.hotel as Hotel)?.city ?? ''; }
  getHotelImage(r: Reservation): string | null { return (r.hotel as Hotel)?.imageUrl ?? null; }
  getHotelId(r: Reservation): number { return (r.hotel as Hotel)?.id ?? 0; }

  getNights(r: Reservation): number {
    const ms = new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }

  getStatus(r: Reservation): 'upcoming' | 'active' | 'past' {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (today < new Date(r.checkInDate)) return 'upcoming';
    if (today > new Date(r.checkOutDate)) return 'past';
    return 'active';
  }

  getMyAvisForHotel(r: Reservation): Avis | undefined {
    const hotelId = this.getHotelId(r);
    return this.myAvis().find(a => {
      const hid = typeof a.hotel === 'object' && 'id' in a.hotel ? a.hotel.id : null;
      return hid === hotelId;
    });
  }

  openReviewForm(r: Reservation): void {
    this.reviewOpenId.set(r.id!);
    this.pendingRating.set(0);
    this.pendingComment.set('');
  }

  closeReviewForm(): void {
    this.reviewOpenId.set(null);
    this.pendingRating.set(0);
    this.pendingComment.set('');
  }

  submitAvis(r: Reservation): void {
    if (this.pendingRating() === 0) { this.toast.warning('Veuillez sélectionner une note.'); return; }
    if (!this.pendingComment().trim()) { this.toast.warning('Veuillez écrire un commentaire.'); return; }
    this.submittingAvis.set(true);
    this.avisService.create({
      rating: this.pendingRating(),
      comment: this.pendingComment().trim(),
      hotel: { id: this.getHotelId(r) },
      client: { id: this.clientAuth.currentClient()!.id! },
    }).subscribe({
      next: (created) => {
        this.myAvis.update(list => [...list, created]);
        this.submittingAvis.set(false);
        this.closeReviewForm();
        this.toast.success('Votre avis a été publié !');
      },
      error: () => {
        this.submittingAvis.set(false);
        this.toast.error('Erreur lors de la publication de l\'avis.');
      }
    });
  }

  cancel(id: number): void {
    this.reservationService.delete(id).subscribe({
      next: () => {
        this.reservations.update(list => list.filter(r => r.id !== id));
        this.cancelConfirmId.set(null);
        this.toast.success('Réservation annulée avec succès.');
      },
      error: () => this.toast.error('Impossible d\'annuler cette réservation.')
    });
  }
}
