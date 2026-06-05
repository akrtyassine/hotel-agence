import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'http://localhost:8082/api/admins';
  private http = inject(HttpClient);

  getAll(): Observable<Admin[]> { return this.http.get<Admin[]>(this.apiUrl); }
  getAgents(): Observable<Admin[]> { return this.http.get<Admin[]>(`${this.apiUrl}/agents`); }
  getById(id: number): Observable<Admin> { return this.http.get<Admin>(`${this.apiUrl}/${id}`); }
  create(admin: Partial<Admin>): Observable<Admin> { return this.http.post<Admin>(this.apiUrl, admin); }
  update(id: number, admin: Partial<Admin>): Observable<Admin> { return this.http.put<Admin>(`${this.apiUrl}/${id}`, admin); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
