import { Hotel } from './hotel.model';

export interface Promotion {
  id?: number;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  hotel: Hotel | { id: number };
}
