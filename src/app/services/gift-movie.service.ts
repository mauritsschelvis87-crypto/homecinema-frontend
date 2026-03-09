import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GiftMovieRequest {
  recipientEmail: string;
  allowedType: 'DVD' | 'Blu-ray' | '4K';
  address?: any;
}

export interface GiftMovieResponse {
  giftCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GiftMovieService {
  private apiUrl = 'http://localhost:8080/api/gift-codes';

  constructor(private http: HttpClient) {}

  buyGiftMovie(request: GiftMovieRequest): Observable<GiftMovieResponse> {
    return this.http.post<GiftMovieResponse>(this.apiUrl, request);
  }
}
