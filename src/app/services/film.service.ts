import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
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

export const MOCK_FILM_ID = 999999;

export const MOCK_FILM: Film = {
  id: MOCK_FILM_ID,
  title: '000 Mock Film',
  genre: 'Drama',
  director: 'Jane Doe',
  country: 'United States',
  region: 'B',
  year: 2024,
  runtime: 112,
  price: 24.99,
  imageUrl: 'assets/gifts/blu-ray.png',
  trailerUrl: '',
  aspectRatio: '1.85:1',
  colorOrBlackAndWhite: 'Color',
  description: 'This is a frontend-only mock film used to verify catalog rendering without changing backend data.',
  brand: {
    id: 1,
    name: 'Criterion'
  },
  type: 'Blu-ray',
  weight: 150,
  stills: ['assets/gifts/blu-ray.png'],
  silent: false,
  userRating: null,
  averageCommunityRating: 4.2,
  communityRatingCount: 12,
  searchTerms: ['mock', 'test film', 'frontend demo']
};

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private apiUrl = `${environment.apiUrl}/films`;

  private filmsCache: Film[] | null = null;

  constructor(private http: HttpClient) {}

  getAllFilms(): Observable<Film[]> {
    if (this.filmsCache) {
      const filmsWithMock = this.withMockFilm(this.filmsCache);
      this.filmsCache = filmsWithMock;
      return of(filmsWithMock);
    }

    return this.http.get<Film[]>(this.apiUrl).pipe(
      map((films) => this.withMockFilm(films)),
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

  private withMockFilm(films: Film[]): Film[] {
    if (films.some((film) => film.id === MOCK_FILM_ID)) {
      return films;
    }

    return [MOCK_FILM, ...films];
  }
}
