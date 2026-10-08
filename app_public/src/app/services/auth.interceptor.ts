import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Attaches the JWT to outgoing requests. If the server rejects a token we sent
 * (expired / invalid), log the user out so they aren't stuck in a broken session.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const request = token ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (token && error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
