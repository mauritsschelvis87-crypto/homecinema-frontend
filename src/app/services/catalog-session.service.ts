import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface CatalogSessionConfig {
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogSessionService {
  private readonly emailStorageKey = 'hcp_catalog_session_email';
  private readonly passwordStorageKey = 'hcp_catalog_session_password';

  constructor(private authService: AuthService) {}

  ensureCatalogSession(): Observable<void> {
    const config = environment.catalogSession as CatalogSessionConfig | undefined;

    if (!config?.enabled) {
      return of(void 0);
    }

    const storedToken = localStorage.getItem('token') ?? localStorage.getItem('jwt');
    const storedUsername = localStorage.getItem('username');
    if (storedToken && storedUsername) {
      return of(void 0);
    }

    const credentials = this.getOrCreateCredentials();

    return this.loginOrRegister(credentials.email, credentials.password).pipe(
      map(() => void 0)
    );
  }

  private loginOrRegister(email: string, password: string): Observable<unknown> {
    return this.authService.login(email, password).pipe(
      catchError((loginError) => {
        if (loginError?.status !== 401) {
          return throwError(() => loginError);
        }

        return this.authService.register(email, password).pipe(
          catchError((registerError) => {
            if (registerError?.status !== 409) {
              return throwError(() => registerError);
            }

            return this.authService.login(email, password);
          })
        );
      })
    );
  }

  private getOrCreateCredentials(): { email: string; password: string } {
    const storedEmail = localStorage.getItem(this.emailStorageKey);
    const storedPassword = localStorage.getItem(this.passwordStorageKey);

    if (storedEmail && storedPassword) {
      return { email: storedEmail, password: storedPassword };
    }

    const id = this.generateSessionId();
    const email = `catalog-session-${id}@homecinemaproject.local`;
    const password = `Catalog-${id}-Access!`;

    localStorage.setItem(this.emailStorageKey, email);
    localStorage.setItem(this.passwordStorageKey, password);

    return { email, password };
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
