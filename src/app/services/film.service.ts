import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private apiUrl = `${environment.apiUrl}/films`;

  constructor(private http: HttpClient) {}

  getAllFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(this.apiUrl);
  }

  getFilmById(id: string): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }
}
