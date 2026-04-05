import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Address } from '../models/user';
import { environment } from '../../environments/environment';

export interface Order {
  id: number;
  number: string;
  orderDate: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getUser(email?: string): Observable<User> {
    const url = localStorage.getItem('token')
      ? `${this.baseUrl}/account/me`
      : `${this.baseUrl}/account?email=${encodeURIComponent(email ?? '')}`;

    return this.http.get<User>(url, {
      withCredentials: true,
    });
  }

  updateUser(address: Address): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/account/me/address`, address, {
      withCredentials: true,
    });
  }

  getOrders(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/by-user?email=${email}`, {
      withCredentials: true,
    });
  }
}
