import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { matchesDirectorSlug } from '../utils/director-filter';
import { removeSessionCache, readSessionCache, writeSessionCache } from '../utils/session-cache';

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
  private readonly storageKey = 'hcp-directors-cache-v1';
  private directorsCache: Director[] | null = readSessionCache<Director[]>(this.storageKey);
  private directorsRequest$?: Observable<Director[]>;

  constructor(private http: HttpClient) {}

  getDirectors(): Observable<Director[]> {
    if (this.directorsCache) {
      return of(this.directorsCache);
    }

    if (this.directorsRequest$) {
      return this.directorsRequest$;
    }

    this.directorsRequest$ = this.http.get<Director[]>(this.apiUrl).pipe(
      tap((directors) => {
        this.directorsCache = [...directors];
        writeSessionCache(this.storageKey, this.directorsCache);
      }),
      finalize(() => {
        this.directorsRequest$ = undefined;
      }),
      shareReplay(1)
    );

    return this.directorsRequest$;
  }

  getDirectorBySlug(slug: string): Observable<Director | undefined> {
    return this.getDirectors().pipe(
      tap((directors) => {
        if (!this.directorsCache) {
          this.directorsCache = [...directors];
          writeSessionCache(this.storageKey, this.directorsCache);
        }
      }),
      map((directors) =>
        directors.find((entry) => entry.slug === slug || matchesDirectorSlug(entry.name, slug))
      )
    );
  }

  primeCache(): Observable<Director[]> {
    return this.getDirectors();
  }

  clearCache(): void {
    this.directorsCache = null;
    this.directorsRequest$ = undefined;
    removeSessionCache(this.storageKey);
  }
}
