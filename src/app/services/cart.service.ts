import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Film } from './film.service';

export interface CartItem {
  product: Film;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private itemAddedSubject = new Subject<void>();

  public readonly itemAdded$ = this.itemAddedSubject.asObservable();

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCurrentCartItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  addToCart(product: Film): void {
    const items = [...this.cartItemsSubject.getValue()];
    const index = items.findIndex(i => i.product.id === product.id);

    if (index >= 0) {
      items[index] = {
        ...items[index],
        quantity: items[index].quantity + 1,
      };
    } else {
      items.push({ product, quantity: 1 });
    }

    console.log('Adding to cart:', product.title);
    this.cartItemsSubject.next(items);
    this.itemAddedSubject.next();
  }

  removeFromCart(productId: number): void {
    console.log('Removing from cart productId:', productId);
    const updatedItems = this.cartItemsSubject.getValue().filter(
      (item) => item.product.id !== productId
    );
    this.cartItemsSubject.next(updatedItems);
  }

  clearCart(): void {
    console.log('Clearing cart items');
    this.cartItemsSubject.next([]);
  }

  getTotalPrice(): number {
    const items = this.cartItemsSubject.getValue();
    const total = items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    console.log('Total price calculated:', total);
    return total;
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = [...this.cartItemsSubject.getValue()];
    const index = items.findIndex((item) => item.product.id === productId);
    if (index !== -1) {
      if (quantity <= 0) {
        items.splice(index, 1);
        console.log(`Removed product ${productId} from cart because quantity was set to 0 or less`);
      } else {
        items[index] = {
          ...items[index],
          quantity,
        };
        console.log(`Updated quantity for product ${productId} to ${quantity}`);
      }
      this.cartItemsSubject.next(items);
    }
  }

  getTotalWeight(): number {
    const items = this.cartItemsSubject.getValue();
    const totalWeight = items.reduce((totalWeight, item) => {
      const weight = item.product.weight ?? 0;
      return totalWeight + weight * item.quantity;
    }, 0);

    console.log('Total weight calculated (grams):', totalWeight);
    return totalWeight;
  }

  getShippingCost(): number {
    const weight = this.getTotalWeight();

    let shippingCost = 0;
    if (weight === 0) shippingCost = 0;
    else if (weight <= 500) shippingCost = 4.95;
    else if (weight <= 2000) shippingCost = 6.95;
    else shippingCost = 9.95;

    console.log(`Shipping cost calculated for weight ${weight}g: €${shippingCost.toFixed(2)}`);
    return shippingCost;
  }
}
