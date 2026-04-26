import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { environment } from '../../environments/environment';

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
  id?: number;
  film: Film;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  number?: string;
  status?: string;
  orderDate?: string;
  subtotalPrice?: number;
  discountAmount?: number;
  totalPrice: number;
  appliedGiftCardCode?: string | null;
  appliedGiftCode?: string | null;
  orderItems: OrderItem[];
}

export interface LocalOrderSummary {
  id: number;
  number: string;
  orderDate: string;
  status: string;
  subtotalPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface OrderRequest {
  username: string;
  totalPrice: number;
  giftCardCode?: string;
  giftCode?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orderUrl = `${environment.apiUrl}/orders`;
  private readonly localOrdersStorageKey = 'localSpecialOrders';
  private readonly latestPlacedOrderIdStorageKey = 'latestPlacedOrderId';

  constructor(private http: HttpClient) {}

  previewOrder(order: OrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.orderUrl}/preview`, order, { withCredentials: true });
  }

  placeOrder(order: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.orderUrl, order, { withCredentials: true });
  }

  getOrdersByUsername(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.orderUrl}/by-user?email=${email}`, { withCredentials: true });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.orderUrl}/${id}`, { withCredentials: true });
  }

  setLatestPlacedOrderId(id: number): void {
    sessionStorage.setItem(this.latestPlacedOrderIdStorageKey, String(id));
  }

  getLatestPlacedOrderId(): number | null {
    const stored = sessionStorage.getItem(this.latestPlacedOrderIdStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : null;
  }

  clearLatestPlacedOrderId(): void {
    sessionStorage.removeItem(this.latestPlacedOrderIdStorageKey);
  }

  createLocalOrder(username: string, cartItems: CartItem[], totalPrice: number): LocalOrderSummary {
    const storedOrders = this.getStoredLocalOrders();
    const id = Date.now();
    const orderDate = new Date().toISOString();
    const subtotalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = {
      id,
      username,
      number: `BOX-${id}`,
      orderDate,
      status: 'Placed',
      subtotalPrice,
      discountAmount: 0,
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
      subtotalPrice: order.subtotalPrice,
      discountAmount: order.discountAmount,
      totalPrice: order.totalPrice,
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
        subtotalPrice: order.subtotalPrice ?? order.totalPrice,
        discountAmount: order.discountAmount ?? 0,
        totalPrice: order.totalPrice,
      }));
  }

  getLocalOrderById(id: number): Order | null {
    const order = this.getStoredLocalOrders().find(item => item.id === id);
    if (!order) {
      return null;
    }

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      orderDate: order.orderDate,
      subtotalPrice: order.subtotalPrice ?? order.totalPrice,
      discountAmount: order.discountAmount ?? 0,
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
    subtotalPrice: number;
    discountAmount: number;
    totalPrice: number;
    orderItems: OrderItem[];
  }> {
    const stored = localStorage.getItem(this.localOrdersStorageKey);
    return stored ? JSON.parse(stored) : [];
  }
}
