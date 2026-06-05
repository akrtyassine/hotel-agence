import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agence } from '../models/agence.model';

@Injectable({ providedIn: 'root' })
export class AgenceService {
  private readonly apiUrl = 'http://localhost:8082/api/agences';
  private http = inject(HttpClient);

  getAll(): Observable<Agence[]> { return this.http.get<Agence[]>(this.apiUrl); }
  getById(id: number): Observable<Agence> { return this.http.get<Agence>(`${this.apiUrl}/${id}`); }
  create(agence: Partial<Agence>): Observable<Agence> { return this.http.post<Agence>(this.apiUrl, agence); }
  update(id: number, agence: Partial<Agence>): Observable<Agence> { return this.http.put<Agence>(`${this.apiUrl}/${id}`, agence); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
