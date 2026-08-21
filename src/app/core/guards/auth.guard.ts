import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, type CanActivateFn } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Bloquea rutas hasta que Firebase resuelva el estado de sesión inicial. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await firstValueFrom(
    toObservable(auth.cargando).pipe(
      filter((cargando) => !cargando),
      take(1),
    ),
  );

  if (auth.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
