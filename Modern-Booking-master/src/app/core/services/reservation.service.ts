import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = 'http://localhost:8082/api/reservations';
  private http = inject(HttpClient);

  getAll(): Observable<Reservation[]> { return this.http.get<Reservation[]>(this.apiUrl); }
  getByAgent(agentId: number): Observable<Reservation[]> { return this.http.get<Reservation[]>(`${this.apiUrl}/agent/${agentId}`); }
  getById(id: number): Observable<Reservation> { return this.http.get<Reservation>(`${this.apiUrl}/${id}`); }
  create(reservation: Partial<Reservation>): Observable<Reservation> { return this.http.post<Reservation>(this.apiUrl, reservation); }
  update(id: number, reservation: Partial<Reservation>): Observable<Reservation> { return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation); }
  validate(id: number): Observable<Reservation> { return this.http.put<Reservation>(`${this.apiUrl}/${id}/validate`, {}); }
  reject(id: number): Observable<Reservation> { return this.http.put<Reservation>(`${this.apiUrl}/${id}/reject`, {}); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
