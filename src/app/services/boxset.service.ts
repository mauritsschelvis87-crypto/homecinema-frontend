import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Film } from './film.service';

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

  constructor(private http: HttpClient) {}

  getBoxsets(): Observable<Boxset[]> {
    return this.http.get<Boxset[]>(this.apiUrl);
  }
}
