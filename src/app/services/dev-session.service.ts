import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address } from '../models/user';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';

interface DevSessionConfig {
  enabled: boolean;
  email: string;
  password: string;
  address: Address;
}

@Injectable({ providedIn: 'root' })
export class DevSessionService {
  ensureDevelopmentSession(): Observable<void> {
    const config = environment.devSession as DevSessionConfig;
    if (!config.enabled) {
      return of(void 0);
    }

    const storedToken = localStorage.getItem('token') ?? localStorage.getItem('jwt');
    const storedUsername = localStorage.getItem('username');
    if (storedToken && storedUsername) {
      return of(void 0);
    }

    return this.loginOrRegister(config).pipe(
      switchMap(() => this.accountService.updateUser(config.address)),
      map(() => void 0)
    );
  }

  constructor(
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  private loginOrRegister(config: DevSessionConfig): Observable<unknown> {
    return this.authService.login(config.email, config.password).pipe(
      catchError(loginError => {
        if (loginError?.status !== 401) {
          return throwError(() => loginError);
        }

        return this.authService.register(config.email, config.password).pipe(
          catchError(registerError => {
            if (registerError?.status !== 409) {
              return throwError(() => registerError);
            }

            return this.authService.login(config.email, config.password);
          })
        );
      })
    );
  }
}
