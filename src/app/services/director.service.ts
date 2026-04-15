import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DirectorPerson {
  name: string;
  birthDate?: string;
  birthPlace?: string;
  birthYear?: number;
  deathDate?: string;
  deathYear?: number;
}

export interface Director {
  name: string;
  slug: string;
  birthPlace: string;
  birthYear?: number;
  deathYear?: number;
  infoLine?: string;
  bornLine?: string;
  diedLine?: string;
  people?: DirectorPerson[];
  image: string;
  bio: string;
  education: string;
}

@Injectable({ providedIn: 'root' })
export class DirectorService {
  private apiUrl = `${environment.apiUrl}/directors`;

  constructor(private http: HttpClient) {}

  getDirectors(): Observable<Director[]> {
    return this.http.get<Director[]>(this.apiUrl);
  }

  getDirectorBySlug(slug: string): Observable<Director | undefined> {
    return this.http.get<Director>(`${this.apiUrl}/${slug}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
