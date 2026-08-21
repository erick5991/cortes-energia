import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, type CanActivateFn } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Bloquea rutas de admin hasta resolver sesión + rol (usuarios/{uid}), y exige role "admin". */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await firstValueFrom(
    toObservable(auth.resolviendoSesion).pipe(
      filter((resolviendo) => !resolviendo),
      take(1),
    ),
  );

  if (auth.esAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
