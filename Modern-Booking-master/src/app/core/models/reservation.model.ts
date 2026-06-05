import { Hotel } from './hotel.model';
import { Client } from './client.model';

export type ReservationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface Reservation {
  id?: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status?: ReservationStatus;
  hotel: Hotel | { id: number };
  client: Client | { id: number };
}
