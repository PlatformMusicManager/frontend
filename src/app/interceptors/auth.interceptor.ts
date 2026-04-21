import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Skip refresh token request from interception to avoid infinite loop
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (err.status === 401) {
        if (isRefreshing) {
          // Wait for the token update to finish
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap(() => {
              return next(req);
            }),
          );
        } else {
          isRefreshing = true;
          // Set to null so others wait
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true); // signal completion
              return next(req);
            }),
            catchError((refreshErr) => {
              cookieStore.delete('X_REFRESH');

              isRefreshing = false;

              const isAuthPage =
                router.url.includes('/login') ||
                router.url.includes('/register') ||
                router.url.includes('/verify');

              if (!isAuthPage) {
                toastService.show('Session expired. Please log in again.', 'error');
                router.navigate(['/login']);
              }

              return throwError(() => refreshErr);
            }),
            finalize(() => {
              // Ensure flag reset if something weird happens, though catchError should handle it
            }),
          );
        }
      }

      // Handle other errors (ignore 406 as it's handled by components)
      if (err.status !== 406) {
        const message = err.error?.message || err.message || 'An unexpected error occurred';
        toastService.show(message, 'error');
      }

      return throwError(() => err);
    }),
  );
};
