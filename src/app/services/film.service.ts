import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Brand {
  id: number;
  name: string;
}

export interface Film {
  id: number;
  title: string;
  genre: string;
  director: string;
  country: string;
  region?: 'A' | 'B' | 'FREE';
  year: number;
  runtime: number;
  price: number;
  imageUrl: string;
  trailerUrl: string;
  aspectRatio: string;
  colorOrBlackAndWhite: string;
  description: string;
  brand: Brand;
  type: string;
  weight?: number;
  stills: string[];
  silent: boolean;
  userRating?: number | null;
  averageCommunityRating?: number;
  communityRatingCount?: number;
  searchTerms?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private apiUrl = `${environment.apiUrl}/films`;

  private filmsCache: Film[] | null = null;

  constructor(private http: HttpClient) {}

  getAllFilms(): Observable<Film[]> {
    if (this.filmsCache) {
      return of(this.filmsCache);
    }

    return this.http.get<Film[]>(this.apiUrl).pipe(
      tap((films) => {
        this.filmsCache = films;
      })
    );
  }

  getFilmById(id: string): Observable<Film> {
    const cachedFilm = this.filmsCache?.find((film) => film.id === Number(id));

    if (cachedFilm) {
      return of(cachedFilm);
    }

    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }

  clearCache(): void {
    this.filmsCache = null;
  }
}
