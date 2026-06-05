import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly apiUrl = 'http://localhost:8082/api/hotels';
  private http = inject(HttpClient);

  getAll(): Observable<Hotel[]> { return this.http.get<Hotel[]>(this.apiUrl); }
  getByAgent(agentId: number): Observable<Hotel[]> { return this.http.get<Hotel[]>(`${this.apiUrl}/agent/${agentId}`); }
  getById(id: number): Observable<Hotel> { return this.http.get<Hotel>(`${this.apiUrl}/${id}`); }
  create(hotel: Partial<Hotel>): Observable<Hotel> { return this.http.post<Hotel>(this.apiUrl, hotel); }
  update(id: number, hotel: Partial<Hotel>): Observable<Hotel> { return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotel); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  uploadImage(id: number, file: File): Observable<Hotel> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Hotel>(`${this.apiUrl}/${id}/image`, fd);
  }
}
