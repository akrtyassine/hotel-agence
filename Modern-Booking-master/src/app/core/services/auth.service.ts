import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { StorageService } from './storage.service';
import { AdminRole } from '../models/admin.model';

export interface AdminSession {
  id: number;
  username: string;
  role: AdminRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8082/api/auth';
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  private _token = signal<string | null>(null);
  private _role = signal<AdminRole | null>(null);
  private _adminId = signal<number | null>(null);
  private _adminUsername = signal<string | null>(null);

  readonly isAuthenticated = () => !!this._token();
  readonly role = this._role.asReadonly();
  readonly adminId = this._adminId.asReadonly();

  readonly currentAdmin = computed<AdminSession | null>(() => {
    const id = this._adminId();
    const username = this._adminUsername();
    const role = this._role();
    if (!id || !username || !role) return null;
    return { id, username, role };
  });

  constructor() {
    const stored = this.storageService.getItem('mb_token');
    if (stored) {
      this._token.set(stored);
      const role = this.storageService.getItem('mb_role') as AdminRole | null;
      const id = this.storageService.getItem('mb_admin_id');
      const username = this.storageService.getItem('mb_admin_username');
      if (role) this._role.set(role);
      if (id) this._adminId.set(Number(id));
      if (username) this._adminUsername.set(username);
    }
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<{ token: string; role: string; id: number; username: string }>(
      `${this.API_URL}/login`, { username, password }
    ).pipe(
      tap(res => {
        this._token.set(res.token);
        this._role.set(res.role as AdminRole);
        this._adminId.set(res.id);
        this._adminUsername.set(res.username);
        this.storageService.setItem('mb_token', res.token);
        this.storageService.setItem('mb_role', res.role);
        this.storageService.setItem('mb_admin_id', String(res.id));
        this.storageService.setItem('mb_admin_username', res.username);
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    this._token.set(null);
    this._role.set(null);
    this._adminId.set(null);
    this._adminUsername.set(null);
    this.storageService.removeItem('mb_token');
    this.storageService.removeItem('mb_role');
    this.storageService.removeItem('mb_admin_id');
    this.storageService.removeItem('mb_admin_username');
  }
}
