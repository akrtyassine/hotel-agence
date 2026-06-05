import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion } from '../models/promotion.model';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private readonly apiUrl = 'http://localhost:8082/api/promotions';
  private http = inject(HttpClient);

  getAll(): Observable<Promotion[]> { return this.http.get<Promotion[]>(this.apiUrl); }
  getById(id: number): Observable<Promotion> { return this.http.get<Promotion>(`${this.apiUrl}/${id}`); }
  create(promo: Partial<Promotion>): Observable<Promotion> { return this.http.post<Promotion>(this.apiUrl, promo); }
  update(id: number, promo: Partial<Promotion>): Observable<Promotion> { return this.http.put<Promotion>(`${this.apiUrl}/${id}`, promo); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
