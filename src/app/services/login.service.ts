import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return localStorage.getItem('jwt') !== null;
  }

  register(credentials: { firstname: string; lastname: string; email: string; address: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials).pipe(
      catchError(error => {
        console.error('Error during registration:', error);
        throw error;
      })
    );
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }


  logout(): void {
    localStorage.removeItem('jwt');
  }
}
