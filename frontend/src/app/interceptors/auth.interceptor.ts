// Afegim el token a les peticions al backend

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken(); // Agafem el token del localStorage

  // Si l'usuari té un token, clonem la petició i li afegim la "clau" (capçalera)
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.removeToken();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    ); // Enviem la petició modificada al Laravel
  }

  // Si no hi ha token (com quan fem login o registre), l'enviem normal
  return next(req);
};