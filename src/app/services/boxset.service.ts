import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Film } from './film.service';
import { removeSessionCache, readSessionCache, writeSessionCache } from '../utils/session-cache';

export interface BoxsetSpec {
  label: string;
  value: string;
}

export interface BoxsetMediaItem {
  type: 'image' | 'video';
  url: string;
}

export interface Boxset {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  topImage: string;
  secondaryImage: string;
  description: string;
  specs: BoxsetSpec[];
  mediaItems: BoxsetMediaItem[];
  product: Film;
}

@Injectable({
  providedIn: 'root',
})
export class BoxsetService {
  private apiUrl = `${environment.apiUrl}/boxsets`;
  private readonly storageKey = 'hcp-boxsets-cache-v1';
  private boxsetsCache: Boxset[] | null = readSessionCache<Boxset[]>(this.storageKey);
  private boxsetsRequest$?: Observable<Boxset[]>;

  constructor(private http: HttpClient) {}

  getBoxsets(): Observable<Boxset[]> {
    if (this.boxsetsCache) {
      return of(this.boxsetsCache);
    }

    if (this.boxsetsRequest$) {
      return this.boxsetsRequest$;
    }

    this.boxsetsRequest$ = this.http.get<Boxset[]>(this.apiUrl).pipe(
      tap((boxsets) => {
        this.boxsetsCache = [...boxsets];
        writeSessionCache(this.storageKey, this.boxsetsCache);
      }),
      finalize(() => {
        this.boxsetsRequest$ = undefined;
      }),
      shareReplay(1)
    );

    return this.boxsetsRequest$;
  }

  primeCache(): Observable<Boxset[]> {
    return this.getBoxsets();
  }

  clearCache(): void {
    this.boxsetsCache = null;
    this.boxsetsRequest$ = undefined;
    removeSessionCache(this.storageKey);
  }
}
