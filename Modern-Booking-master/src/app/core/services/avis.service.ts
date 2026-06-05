import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/avis.model';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private readonly apiUrl = 'http://localhost:8082/api/avis';
  private http = inject(HttpClient);

  getAll(): Observable<Avis[]> { return this.http.get<Avis[]>(this.apiUrl); }
  getById(id: number): Observable<Avis> { return this.http.get<Avis>(`${this.apiUrl}/${id}`); }
  create(avis: Partial<Avis>): Observable<Avis> { return this.http.post<Avis>(this.apiUrl, avis); }
  update(id: number, avis: Partial<Avis>): Observable<Avis> { return this.http.put<Avis>(`${this.apiUrl}/${id}`, avis); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
