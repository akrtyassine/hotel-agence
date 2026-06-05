import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = 'http://localhost:8082/api/clients';
  private http = inject(HttpClient);

  getAll(): Observable<Client[]> { return this.http.get<Client[]>(this.apiUrl); }
  getById(id: number): Observable<Client> { return this.http.get<Client>(`${this.apiUrl}/${id}`); }
  create(client: Partial<Client>): Observable<Client> { return this.http.post<Client>(this.apiUrl, client); }
  update(id: number, client: Partial<Client>): Observable<Client> { return this.http.put<Client>(`${this.apiUrl}/${id}`, client); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
