import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Film } from './film.service';

export interface CartItem {
  product: Film;
  quantity: number;
}

export interface CartPromotions {
  giftCardCode: string;
  giftCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private itemAddedSubject = new Subject<void>();
  private readonly promotionsStorageKey = 'cartPromotions';
  private promotionsSubject = new BehaviorSubject<CartPromotions>(this.getStoredPromotions());

  public readonly itemAdded$ = this.itemAddedSubject.asObservable();

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCurrentCartItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  getPromotions(): Observable<CartPromotions> {
    return this.promotionsSubject.asObservable();
  }

  getCurrentPromotions(): CartPromotions {
    return this.promotionsSubject.getValue();
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
    this.clearPromotions();
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

  setGiftCardCode(code: string): void {
    this.updatePromotions({ giftCardCode: code.trim().toUpperCase() });
  }

  setGiftCode(code: string): void {
    this.updatePromotions({ giftCode: code.trim().toUpperCase() });
  }

  clearGiftCardCode(): void {
    this.updatePromotions({ giftCardCode: '' });
  }

  clearGiftCode(): void {
    this.updatePromotions({ giftCode: '' });
  }

  clearPromotions(): void {
    const emptyPromotions: CartPromotions = {
      giftCardCode: '',
      giftCode: '',
    };

    this.promotionsSubject.next(emptyPromotions);
    localStorage.setItem(this.promotionsStorageKey, JSON.stringify(emptyPromotions));
  }

  private updatePromotions(patch: Partial<CartPromotions>): void {
    const nextState = {
      ...this.promotionsSubject.getValue(),
      ...patch,
    };

    this.promotionsSubject.next(nextState);
    localStorage.setItem(this.promotionsStorageKey, JSON.stringify(nextState));
  }

  private getStoredPromotions(): CartPromotions {
    const stored = localStorage.getItem(this.promotionsStorageKey);
    if (!stored) {
      return {
        giftCardCode: '',
        giftCode: '',
      };
    }

    try {
      const parsed = JSON.parse(stored) as Partial<CartPromotions>;
      return {
        giftCardCode: parsed.giftCardCode ?? '',
        giftCode: parsed.giftCode ?? '',
      };
    } catch {
      return {
        giftCardCode: '',
        giftCode: '',
      };
    }
  }
}
