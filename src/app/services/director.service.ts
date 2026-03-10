import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Director {
  name: string;
  slug: string;
  birthPlace: string;
  birthYear: number;
  deathYear?: number;
  image: string;
  bio: string;
  education: string;
}

@Injectable({ providedIn: 'root' })
export class DirectorService {
  private url = '/assets/covers/directors.json';

  constructor(private http: HttpClient) {}

  getDirectors(): Observable<Director[]> {
    return this.http.get<(Director | Director[])[]>(this.url).pipe(
      map(directors => directors.flat() as Director[])
    );
  }

  getDirectorBySlug(slug: string): Observable<Director | undefined> {
    return this.getDirectors().pipe(
      map(directors => directors.find(d => this.matchesSlug(d.slug, slug)))
    );
  }

  private matchesSlug(directorSlug: string, routeSlug: string): boolean {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const normalizedDirector = normalize(directorSlug);
    const normalizedRoute = normalize(routeSlug);

    return normalizedDirector === normalizedRoute
      || normalizedDirector.replace('-w-', '-') === normalizedRoute
      || normalizedRoute.replace('-w-', '-') === normalizedDirector;
  }
}
