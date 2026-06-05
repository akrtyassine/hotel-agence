import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

export const clientAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const clientAuth = inject(ClientAuthService);
  const router = inject(Router);
  if (clientAuth.isLoggedIn()) return true;
  const targetUrl = '/' + route.url.map(s => s.toString()).join('/') || '/reservation';
  return router.createUrlTree(['/compte/connexion'], { queryParams: { redirect: targetUrl } });
};
