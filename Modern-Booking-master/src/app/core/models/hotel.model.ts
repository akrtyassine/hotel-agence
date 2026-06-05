import { Admin } from './admin.model';

export interface Hotel {
  id?: number;
  name: string;
  city: string;
  address: string;
  pricePerNight: number;
  imageUrl?: string;
  agent?: Admin | { id: number } | null;
}
