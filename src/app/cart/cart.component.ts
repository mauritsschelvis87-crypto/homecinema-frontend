import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../services/cart.service';
import { AccountService } from '../services/account.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';
import { ShippingCostService } from '../services/shipping-cost.service';
import { Film } from '../services/film.service';

interface Currency {
  code: string;
  label: string;
  rate: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, NgForOf],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  private readonly specialBoxsetSlugs: Record<number, string> = {
    900001: 'bergman',
    900002: 'wong-kar-wai',
    900003: 'world-cinema-project',
    900004: 'john-cassavetes',
    900005: 'abbas-kiarostami',
  };

  currencies: Currency[] = [
    { code: '€', label: 'EUR - Euro', rate: 1 },
    { code: '$', label: 'USD - US Dollar', rate: 1.1 },
    { code: '£', label: 'GBP - British Pound', rate: 0.85 },
    { code: '¥', label: 'JPY - Japanese Yen', rate: 140 },
  ];
  selectedCurrency: string = '€';

  giftCodeInput: string = '';
  isGiftCodeApplied: boolean = false;
  giftCodeError: string = '';
  discountAmount: number = 0;

  voucherInput: string = '';
  isVoucherApplied: boolean = false;
  voucherError: string = '';

  shippingCost: number = 0;
  country: string = '';
  totalWeightInGrams: number = 0;

  private validGiftCodes: { [code: string]: number } = {
    'GIFT10': 10,
    'GIFT20': 20,
    'MOVIE5': 5,
  };

  private validVouchers: string[] = [
    'MOVIEBUFF',
    'SUMMER25',
    'VIPACCESS'
  ];

  constructor(
    private cartService: CartService,
    private accountService: AccountService,
    private shippingCostService: ShippingCostService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotalWeight();
      this.updateShippingCost();
      if (this.isGiftCodeApplied) this.applyGiftCode();
    });

    const username = localStorage.getItem('username');
    if (username) {
      this.accountService.getUser(username).subscribe({
        next: user => {
          this.country = user.address?.country ?? '';
          this.updateShippingCost();
        },
        error: err => {
          console.error('Error loading user address:', err);
          this.shippingCost = 0;
        },
      });
    }
  }

  calculateTotalWeight(): void {
    this.totalWeightInGrams = this.cartItems.reduce(
      (total, item) => total + (item.product.weight ?? 0) * item.quantity,
      0
    );
  }

  updateShippingCost(): void {
    const countryCode = COUNTRY_NAME_TO_CODE[this.country];
    if (!countryCode) {
      this.shippingCost = 8.99;
      return;
    }
    this.shippingCost = this.shippingCostService.calculateShippingCost(
      countryCode,
      this.totalWeightInGrams
    );
  }

  onCountryChange(newCountry: string): void {
    this.country = newCountry;
    this.updateShippingCost();
    this.resetGiftCode();
    this.resetVoucher();
  }

  onQuantityChange(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const qty = Number(input.value);
    if (qty < 1 || isNaN(qty)) return;
    this.updateQuantity(productId, qty);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(productId, quantity);
    this.calculateTotalWeight();
    this.updateShippingCost();
    this.resetGiftCode();
    this.resetVoucher();
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.calculateTotalWeight();
    this.updateShippingCost();
    this.resetGiftCode();
    this.resetVoucher();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.totalWeightInGrams = 0;
    this.shippingCost = 0;
    this.resetGiftCode();
    this.resetVoucher();
  }

  getSubtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  getTotalPriceAfterDiscount(): number {
    const subtotal = this.getSubtotal();
    let discounted = subtotal - this.discountAmount;
    if (discounted < 0) discounted = 0;
    return discounted + this.shippingCost;
  }

  trackItem(index: number, item: CartItem): number {
    return item.product.id;
  }

  getProductLink(product: Film): string[] {
    return product.id >= 900000
      ? ['/boxsets/special-edition']
      : ['/films', product.id.toString()];
  }

  getProductFragment(product: Film): string | undefined {
    return this.specialBoxsetSlugs[product.id] ?? undefined;
  }

  convertPrice(priceInEuro: number): string {
    const currency = this.currencies.find(c => c.code === this.selectedCurrency);
    if (!currency) return priceInEuro.toFixed(2);
    const converted = priceInEuro * currency.rate;
    return converted.toFixed(2);
  }

  onCurrencyChange(): void {
    // Niks nodig hier voor nu
  }

  applyGiftCode(): void {
    const code = this.giftCodeInput.trim().toUpperCase();
    if (!code) {
      this.giftCodeError = 'Voer een cadeauboncode in.';
      return;
    }

    if (this.validGiftCodes.hasOwnProperty(code)) {
      this.discountAmount = this.validGiftCodes[code];
      if (this.discountAmount > this.getSubtotal()) {
        this.discountAmount = this.getSubtotal();
      }
      this.isGiftCodeApplied = true;
      this.giftCodeError = '';
    } else {
      this.giftCodeError = 'Ongeldige code.';
      this.isGiftCodeApplied = false;
      this.discountAmount = 0;
    }
  }

  removeGiftCode(): void {
    this.giftCodeInput = '';
    this.resetGiftCode();
  }

  private resetGiftCode(): void {
    this.isGiftCodeApplied = false;
    this.giftCodeError = '';
    this.discountAmount = 0;
  }

  applyVoucher(): void {
    const code = this.voucherInput.trim().toUpperCase();
    if (!code) {
      this.voucherError = 'Voer een voucher in.';
      return;
    }

    if (this.validVouchers.includes(code)) {
      this.isVoucherApplied = true;
      this.voucherError = '';
    } else {
      this.voucherError = 'Ongeldige voucher.';
      this.isVoucherApplied = false;
    }
  }

  removeVoucher(): void {
    this.voucherInput = '';
    this.resetVoucher();
  }

  private resetVoucher(): void {
    this.isVoucherApplied = false;
    this.voucherError = '';
  }
}
