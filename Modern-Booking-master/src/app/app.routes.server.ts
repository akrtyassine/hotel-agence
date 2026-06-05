import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'hotels/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'reservation',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'compte/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'login/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'promotions',
    renderMode: RenderMode.Client
  },
  {
    path: 'hotels',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
