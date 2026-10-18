import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';

export interface UserProfile {
  authenticated: boolean;
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.processUrlToken();
  }

  /**
   * Captures ?token= from OAuth2 redirect URL and stores it in localStorage.
   */
  processUrlToken(): void {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      if (token) {
        localStorage.setItem('jwt', token);
        // Clean token from the URL query params without reloading the page
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.pathname + (url.search || '') + (url.hash || ''));
      }
    } catch (_) {}
  }

  /**
   * Checks if user is authenticated:
   * 1. If JWT is in localStorage, calls /api/auth/user with Bearer token.
   * 2. If no JWT or token fails, tries cookie session /api/auth/user and retrieves /api/auth/token if authenticated.
   */
  checkAuthStatus(): Observable<UserProfile> {
    this.processUrlToken();
    this.isLoading.set(true);

    const token = localStorage.getItem('jwt');

    return this.http.get<UserProfile>('/api/auth/user', { withCredentials: true }).pipe(
      switchMap(user => {
        if (user && user.authenticated) {
          this.currentUser.set(user);
          // If token wasn't saved yet, fetch it from backend
          if (!localStorage.getItem('jwt')) {
            return this.http.get<{ token: string }>('/api/auth/token', { withCredentials: true }).pipe(
              tap(res => {
                if (res?.token) {
                  localStorage.setItem('jwt', res.token);
                }
              }),
              switchMap(() => of(user)),
              catchError(() => of(user))
            );
          }
          return of(user);
        } else {
          this.currentUser.set(null);
          localStorage.removeItem('jwt');
          return of({ authenticated: false } as UserProfile);
        }
      }),
      tap(() => this.isLoading.set(false)),
      catchError(() => {
        this.currentUser.set(null);
        localStorage.removeItem('jwt');
        this.isLoading.set(false);
        return of({ authenticated: false } as UserProfile);
      })
    );
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.currentUser.set(null);
        localStorage.removeItem('jwt');
        this.router.navigate(['/login']);
      });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser()?.authenticated || !!localStorage.getItem('jwt');
  }
}
