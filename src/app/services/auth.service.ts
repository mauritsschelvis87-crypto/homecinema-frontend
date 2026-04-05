import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserProfile {
  email: string;
}

export interface AuthResponse extends UserProfile {
  token?: string;
  tokenType?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasStoredToken());
  private userProfile: UserProfile | null = null;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUserProfile(): Observable<UserProfile | null> {
    return new Observable(subscriber => {
      subscriber.next(this.userProfile);
      subscriber.complete();
    });
  }

  register(email: string, password: string, persistSession = true): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password }, {
      withCredentials: true
    }).pipe(
      tap(response => this.applyAuthResponse(response, email, persistSession))
    );
  }

  login(email: string, password: string, persistSession = true): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, {
      withCredentials: true
    }).pipe(
      tap(response => this.applyAuthResponse(response, email, persistSession))
    );
  }

  logout(): void {
    this.userProfile = null;
    this.loggedIn.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token') ?? localStorage.getItem('jwt');
  }

  private applyAuthResponse(response: AuthResponse, fallbackEmail: string, persistSession: boolean): void {
    this.userProfile = {
      email: response.email || fallbackEmail,
    };

    if (persistSession && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('jwt', response.token);
      localStorage.setItem('tokenType', response.tokenType ?? 'Bearer');
      localStorage.setItem('username', response.email || fallbackEmail);
    }

    this.loggedIn.next(Boolean(this.getStoredToken()));
  }

  private hasStoredToken(): boolean {
    return Boolean(localStorage.getItem('token') ?? localStorage.getItem('jwt'));
  }
}
