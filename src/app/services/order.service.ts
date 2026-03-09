import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Brand {
  id?: string | number;
  name: string;
}

export interface Film {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  brand: Brand;
  type: string;
  stills?: string[];
}

export interface OrderItem {
  film: Film;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalPrice: number;
  orderItems: OrderItem[];
}

export interface OrderRequest {
  username: string;
  totalPrice: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orderUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(order: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.orderUrl, order, { withCredentials: true });
  }

  getOrdersByUsername(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.orderUrl}/by-user?email=${email}`, { withCredentials: true });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.orderUrl}/${id}`, { withCredentials: true });
  }
}
