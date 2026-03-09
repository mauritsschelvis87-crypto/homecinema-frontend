import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GiftCodeValidationResult {
  valid: boolean;
  discountAmount?: number;
  freeFilmId?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GiftCodeService {
  private apiUrl = 'http://localhost:8080/api/giftcodes';

  constructor(private http: HttpClient) {}

  validateCode(code: string): Observable<GiftCodeValidationResult> {
    return this.http.post<GiftCodeValidationResult>(`${this.apiUrl}/validate`, { code });
  }
}
