import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

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
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}


  getUser(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/account?email=${email}`, {
      withCredentials: true,
    });
  }

  updateUser(data: {
    email: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/account`, data, {
      withCredentials: true,
    });
  }

  getOrders(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/by-user?email=${email}`, {
      withCredentials: true,
    });
  }
}
