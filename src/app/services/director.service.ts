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
  private url = '/assets/directors.json';

  constructor(private http: HttpClient) {}

  getDirectors(): Observable<Director[]> {
    return this.http.get<Director[]>(this.url);
  }

  getDirectorBySlug(slug: string): Observable<Director | undefined> {
    return this.getDirectors().pipe(
      map(directors => directors.find(d => d.slug === slug))
    );
  }
}
