import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface UserProfile {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userProfile: UserProfile | null = null;
  private apiUrl = 'http://localhost:8080/api/auth';

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

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password }, {
      withCredentials: true
    });
  }

  login(email: string, password: string): Observable<UserProfile> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${email}:${password}`)
    });

    return this.http.post<UserProfile>(`${this.apiUrl}/login`, {}, {
      headers,
      withCredentials: true
    }).pipe(
      tap(user => {
        this.userProfile = user;
        this.loggedIn.next(true);
      })
    );
  }

  logout(): void {
    this.userProfile = null;
    this.loggedIn.next(false);
    // eventueel: backend call om sessie ongeldig te maken
  }
}
