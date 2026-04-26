import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReturnRequest {
  id?: number;
  orderItem: {
    id: number;
    order: {
      id: number;
      user: {
        email: string;
      };
    };
  };
  returnReason: string;
  otherReasonText?: string;
  status?: string;
  photoUrl?: string;
  requestDate?: string;
  backupAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnRequestService {
  private readonly baseUrl = '/api/returns';

  constructor(private http: HttpClient) {}

  createReturnRequest(returnRequest: ReturnRequest): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(this.baseUrl, returnRequest);
  }

  getReturnRequestsByUser(email: string): Observable<ReturnRequest[]> {
    return this.http.get<ReturnRequest[]>(`${this.baseUrl}/by-user`, {
      params: { email }
    });
  }

  getReturnRequestsByOrder(orderId: number): Observable<ReturnRequest[]> {
    return this.http.get<ReturnRequest[]>(`${this.baseUrl}/by-order/${orderId}`);
  }
}
