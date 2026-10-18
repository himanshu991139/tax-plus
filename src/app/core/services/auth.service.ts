import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

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
    this.checkAuthStatus();
  }

  checkAuthStatus(): Observable<UserProfile> {
    this.isLoading.set(true);
    return this.http.get<UserProfile>('/api/auth/user', { withCredentials: true }).pipe(
      tap((user) => {
        if (user && user.authenticated) {
          this.currentUser.set(user);
        } else {
          this.currentUser.set(null);
        }
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isLoading.set(false);
        return of({ authenticated: false });
      })
    );
  }

  loginWithGoogle(): void {
    // Redirect browser to backend OAuth2 initiation endpoint which redirects to Google
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser()?.authenticated;
  }
}
