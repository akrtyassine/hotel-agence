import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="flex gap-0.5" [attr.aria-label]="rating + ' étoiles sur 5'">
      @for (star of [1,2,3,4,5]; track star) {
        <span
          [class]="starClass(star)"
          [class.cursor-pointer]="interactive"
          (click)="onClick(star)"
          (mouseenter)="interactive && hoveredStar.set(star)"
          (mouseleave)="interactive && hoveredStar.set(0)">
          ★
        </span>
      }
    </div>
  `
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoveredStar = signal(0);

  starClass(star: number): string {
    const active = star <= (this.hoveredStar() > 0 ? this.hoveredStar() : this.rating);
    const color = active ? 'text-amber-400' : 'text-warm-300';
    const sizeMap = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
    return `${color} ${sizeMap[this.size]} transition-colors select-none`;
  }

  onClick(star: number): void {
    if (this.interactive) {
      this.ratingChange.emit(star);
    }
  }
}
