import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private add(message: string, type: ToastType): void {
    const id = Math.random().toString(36).slice(2);
    this._toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), 4500);
  }

  success(message: string): void { this.add(message, 'success'); }
  error(message: string): void { this.add(message, 'error'); }
  info(message: string): void { this.add(message, 'info'); }
  warning(message: string): void { this.add(message, 'warning'); }

  remove(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
