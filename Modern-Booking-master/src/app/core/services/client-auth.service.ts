import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private readonly API_URL = 'http://localhost:8082/api/clients';
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private _client = signal<Client | null>(null);
  readonly currentClient = this._client.asReadonly();
  readonly isLoggedIn = () => !!this._client();

  constructor() {
    const stored = this.storage.getItem('mb_client');
    if (stored) {
      try { this._client.set(JSON.parse(stored)); } catch { /* invalid data */ }
    }
  }

  /** Login via dedicated server-side endpoint — validates email+password and returns client (no password in response) */
  login(email: string, password: string): Observable<Client> {
    return this.http.post<Client>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(client => {
        this._client.set(client);
        this.storage.setItem('mb_client', JSON.stringify(client));
      })
    );
  }

  /** Create new client account */
  register(data: Omit<Client, 'id'> & { password: string }): Observable<Client> {
    return this.http.post<Client>(this.API_URL, data).pipe(
      tap(client => {
        this._client.set(client);
        this.storage.setItem('mb_client', JSON.stringify(client));
      })
    );
  }

  logout(): void {
    this._client.set(null);
    this.storage.removeItem('mb_client');
  }

  /** Refresh the stored client (e.g. after a profile update) */
  setClient(client: Client): void {
    this._client.set(client);
    this.storage.setItem('mb_client', JSON.stringify(client));
  }
}
