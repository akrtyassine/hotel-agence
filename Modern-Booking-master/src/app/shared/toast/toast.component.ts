import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl max-w-sm pointer-events-auto animate-in"
          [class]="toastClass(toast.type)">
          <span class="text-lg shrink-0 mt-0.5">{{ toastIcon(toast.type) }}</span>
          <p class="text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button (click)="toastService.remove(toast.id)"
                  class="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-50 text-green-800 border border-green-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-amber-50 text-amber-800 border border-amber-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200',
    };
    return map[type] || map['info'];
  }

  toastIcon(type: string): string {
    const map: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return map[type] || 'ℹ';
  }
}
