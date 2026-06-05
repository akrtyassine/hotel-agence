import { Hotel } from './hotel.model';
import { Client } from './client.model';

export interface Avis {
  id?: number;
  rating: number;
  comment: string;
  hotel: Hotel | { id: number };
  client: Client | { id: number };
}
