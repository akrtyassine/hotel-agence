import { Component, HostListener, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  template: `
    @if (show()) {
      <button (click)="scrollToTop()"
              class="fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary-500 hover:bg-primary-600
                     text-white rounded-full shadow-lg hover:shadow-xl
                     flex items-center justify-center transition-all duration-200"
              aria-label="Retour en haut de page">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
    }
  `
})
export class ScrollToTopComponent {
  private platformId = inject(PLATFORM_ID);
  show = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.show.set(window.scrollY > 300);
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
