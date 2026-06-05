import { Signal, signal, computed } from '@angular/core';

export interface PaginationState<T> {
  page: ReturnType<typeof signal<number>>;
  currentPage: ReturnType<typeof computed<number>>;
  totalItems: ReturnType<typeof computed<number>>;
  totalPages: ReturnType<typeof computed<number>>;
  startItem: ReturnType<typeof computed<number>>;
  endItem: ReturnType<typeof computed<number>>;
  items: ReturnType<typeof computed<T[]>>;
  reset: () => void;
  previous: () => void;
  next: () => void;
}

export function createPagination<T>(source: Signal<T[]>, pageSize = 10): PaginationState<T> {
  const page = signal(1);
  const totalItems = computed(() => source().length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems() / pageSize)));
  const currentPage = computed(() => Math.min(page(), totalPages()));
  const startItem = computed(() => totalItems() === 0 ? 0 : (currentPage() - 1) * pageSize + 1);
  const endItem = computed(() => Math.min(currentPage() * pageSize, totalItems()));
  const items = computed(() => {
    const start = (currentPage() - 1) * pageSize;
    return source().slice(start, start + pageSize);
  });
  return {
    page,
    currentPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    items,
    reset: () => page.set(1),
    previous: () => page.update(v => Math.max(1, v - 1)),
    next: () => page.update(v => Math.min(totalPages(), v + 1)),
  };
}
