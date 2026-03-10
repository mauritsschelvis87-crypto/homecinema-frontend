import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart.service';

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

export interface LocalOrderSummary {
  id: number;
  number: string;
  orderDate: string;
  status: string;
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
  private readonly localOrdersStorageKey = 'localSpecialOrders';

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

  createLocalOrder(username: string, cartItems: CartItem[], totalPrice: number): LocalOrderSummary {
    const storedOrders = this.getStoredLocalOrders();
    const id = Date.now();
    const orderDate = new Date().toISOString();

    const order = {
      id,
      username,
      number: `BOX-${id}`,
      orderDate,
      status: 'Placed',
      totalPrice,
      orderItems: cartItems.map(item => ({
        film: {
          id: String(item.product.id),
          title: item.product.title,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          brand: item.product.brand,
          type: item.product.type,
          stills: item.product.stills,
        },
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    storedOrders.push(order);
    localStorage.setItem(this.localOrdersStorageKey, JSON.stringify(storedOrders));

    return {
      id: order.id,
      number: order.number,
      orderDate: order.orderDate,
      status: order.status,
    };
  }

  getLocalOrderSummariesByUsername(username: string): LocalOrderSummary[] {
    return this.getStoredLocalOrders()
      .filter(order => order.username === username)
      .map(order => ({
        id: order.id,
        number: order.number,
        orderDate: order.orderDate,
        status: order.status,
      }));
  }

  getLocalOrderById(id: number): Order | null {
    const order = this.getStoredLocalOrders().find(item => item.id === id);
    if (!order) {
      return null;
    }

    return {
      id: order.id,
      orderDate: order.orderDate,
      totalPrice: order.totalPrice,
      orderItems: order.orderItems,
    };
  }

  private getStoredLocalOrders(): Array<{
    id: number;
    username: string;
    number: string;
    orderDate: string;
    status: string;
    totalPrice: number;
    orderItems: OrderItem[];
  }> {
    const stored = localStorage.getItem(this.localOrdersStorageKey);
    return stored ? JSON.parse(stored) : [];
  }
}
