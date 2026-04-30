import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { removeSessionCache, readSessionCache, writeSessionCache } from '../utils/session-cache';

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
  private readonly storageKey = 'hcp-films-cache-v1';

  private filmsCache: Film[] | null = readSessionCache<Film[]>(this.storageKey);
  private filmsRequest$?: Observable<Film[]>;

  constructor(private http: HttpClient) {}

  getAllFilms(): Observable<Film[]> {
    if (this.filmsCache) {
      return of(this.filmsCache);
    }

    if (this.filmsRequest$) {
      return this.filmsRequest$;
    }

    this.filmsRequest$ = this.http.get<Film[]>(this.apiUrl).pipe(
      tap((films) => {
        this.setFilmsCache(films);
      }),
      finalize(() => {
        this.filmsRequest$ = undefined;
      }),
      shareReplay(1)
    );

    return this.filmsRequest$;
  }

  getFilmById(id: string): Observable<Film> {
    const filmId = Number(id);
    const cachedFilm = this.filmsCache?.find((film) => film.id === filmId);

    if (cachedFilm) {
      return of(cachedFilm);
    }

    return this.getAllFilms().pipe(
      map((films) => films.find((film) => film.id === filmId)),
      switchMap((film) => {
        if (film) {
          return of(film);
        }

        return this.http.get<Film>(`${this.apiUrl}/${id}`).pipe(
          tap((loadedFilm) => this.upsertFilmCache(loadedFilm))
        );
      })
    );
  }

  primeCache(): Observable<Film[]> {
    return this.getAllFilms();
  }

  clearCache(): void {
    this.filmsCache = null;
    this.filmsRequest$ = undefined;
    removeSessionCache(this.storageKey);
  }

  private setFilmsCache(films: Film[]): void {
    this.filmsCache = [...films];
    this.filmsRequest$ = undefined;
    writeSessionCache(this.storageKey, this.filmsCache);
  }

  private upsertFilmCache(film: Film): void {
    const currentFilms = this.filmsCache ? [...this.filmsCache] : [];
    const existingIndex = currentFilms.findIndex((entry) => entry.id === film.id);

    if (existingIndex >= 0) {
      currentFilms[existingIndex] = film;
    } else {
      currentFilms.push(film);
    }

    this.setFilmsCache(currentFilms);
  }
}
