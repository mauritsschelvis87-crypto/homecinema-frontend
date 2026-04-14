import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService, CartItem } from '../services/cart.service';
import { AccountService } from '../services/account.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';
import { ShippingCostService } from '../services/shipping-cost.service';
import { Film } from '../services/film.service';
import { Order, OrderRequest, OrderService } from '../services/order.service';
import { Subscription } from 'rxjs';
import { getDiscountSummaryLabel } from '../utils/discount-code-display';
import { CollectionService } from '../services/collection.service';

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
export class CartComponent implements OnInit, OnDestroy {
  private static readonly invalidCodeMessage = 'The code is invalid.';

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

  voucherInput: string = '';
  isVoucherApplied: boolean = false;
  voucherError: string = '';
  previewErrorMessage = '';
  previewLoading = false;
  pricingPreview: Order | null = null;

  shippingCost: number = 0;
  country: string = '';
  totalWeightInGrams: number = 0;
  username = localStorage.getItem('username') ?? '';
  private previewSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private accountService: AccountService,
    private shippingCostService: ShippingCostService,
    private orderService: OrderService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotalWeight();
      this.updateShippingCost();
      this.refreshPreview();
    });

    const promotions = this.cartService.getCurrentPromotions();
    this.giftCodeInput = promotions.giftCardCode;
    this.isGiftCodeApplied = !!promotions.giftCardCode;
    this.voucherInput = promotions.giftCode;
    this.isVoucherApplied = !!promotions.giftCode;

    if (this.username) {
      this.accountService.getUser(this.username).subscribe({
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
  }

  ngOnDestroy(): void {
    this.previewSubscription?.unsubscribe();
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
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.calculateTotalWeight();
    this.updateShippingCost();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.totalWeightInGrams = 0;
    this.shippingCost = 0;
    this.resetGiftCode();
    this.resetVoucher();
    this.clearPreviewState();
  }

  getSubtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  getTotalPriceAfterDiscount(): number {
    return this.getDisplayedTotalPrice();
  }

  getDisplayedSubtotal(): number {
    return this.pricingPreview?.subtotalPrice ?? this.getSubtotal();
  }

  getDisplayedDiscountAmount(): number {
    return this.pricingPreview?.discountAmount ?? 0;
  }

  getDisplayedTotalPrice(): number {
    return this.pricingPreview?.totalPrice ?? this.getSubtotal();
  }

  hasDiscountPreview(): boolean {
    return this.getDisplayedDiscountAmount() > 0;
  }

  getDiscountLabel(): string {
    return getDiscountSummaryLabel(
      this.pricingPreview?.appliedGiftCardCode,
      this.pricingPreview?.appliedGiftCode
    );
  }

  isGiftCardConfirmedByPreview(): boolean {
    return this.pricingPreview?.appliedGiftCardCode === this.giftCodeInput;
  }

  isVoucherConfirmedByPreview(): boolean {
    return this.pricingPreview?.appliedGiftCode === this.voucherInput;
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

  isInCollection(productId: number): boolean {
    return this.collectionService.isInCollection(productId);
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
      this.giftCodeError = 'Enter a gift card code.';
      return;
    }
    if (!this.username) {
      this.giftCodeError = 'Log in to apply a code.';
      return;
    }

    this.giftCodeError = '';
    this.previewErrorMessage = '';
    this.validatePreview(
      { giftCardCode: code },
      () => {
        this.giftCodeInput = code;
        this.isGiftCodeApplied = true;
        this.cartService.setGiftCardCode(code);
      },
      () => {
        this.isGiftCodeApplied = false;
        this.giftCodeError = CartComponent.invalidCodeMessage;
        this.refreshPreview();
      }
    );
  }

  removeGiftCode(): void {
    this.giftCodeInput = '';
    this.resetGiftCode();
  }

  private resetGiftCode(): void {
    this.isGiftCodeApplied = false;
    this.giftCodeError = '';
    this.cartService.clearGiftCardCode();
    this.refreshPreview();
  }

  applyVoucher(): void {
    const code = this.voucherInput.trim().toUpperCase();
    if (!code) {
      this.voucherError = 'Enter a voucher code.';
      return;
    }
    if (!this.username) {
      this.voucherError = 'Log in to apply a code.';
      return;
    }

    this.voucherError = '';
    this.previewErrorMessage = '';
    this.validatePreview(
      { giftCode: code },
      () => {
        this.voucherInput = code;
        this.isVoucherApplied = true;
        this.cartService.setGiftCode(code);
      },
      () => {
        this.isVoucherApplied = false;
        this.voucherError = CartComponent.invalidCodeMessage;
        this.refreshPreview();
      }
    );
  }

  removeVoucher(): void {
    this.voucherInput = '';
    this.resetVoucher();
  }

  private resetVoucher(): void {
    this.isVoucherApplied = false;
    this.voucherError = '';
    this.cartService.clearGiftCode();
    this.refreshPreview();
  }

  private refreshPreview(): void {
    if (!this.username || !this.cartItems.length || this.hasSpecialBoxset()) {
      this.clearPreviewState();
      return;
    }

    const request = this.buildOrderRequest();
    if (!request) {
      this.clearPreviewState();
      return;
    }

    this.previewLoading = true;
    this.previewErrorMessage = '';
    this.previewSubscription?.unsubscribe();
    this.previewSubscription = this.orderService.previewOrder(request).subscribe({
      next: preview => {
        this.pricingPreview = preview;
        this.previewLoading = false;
        this.previewErrorMessage = '';
        this.giftCodeError = '';
        this.voucherError = '';
      },
      error: err => {
        this.pricingPreview = null;
        this.previewLoading = false;
        const apiErrorMessage = this.getApiErrorMessage(err);
        const assignedPromotionError = this.assignPromotionErrors(
          request.giftCardCode,
          request.giftCode,
          apiErrorMessage,
          err?.status
        );

        this.previewErrorMessage = assignedPromotionError
          ? ''
          : apiErrorMessage ?? 'Could not load the price preview.';
      },
    });
  }

  private validatePreview(
    overrides: Partial<OrderRequest>,
    onSuccess: () => void,
    onError: () => void
  ): void {
    const request = this.buildOrderRequest(overrides);
    if (!request) {
      onError();
      return;
    }

    this.previewLoading = true;
    this.previewSubscription?.unsubscribe();
    this.previewSubscription = this.orderService.previewOrder(request).subscribe({
      next: preview => {
        onSuccess();
        this.pricingPreview = preview;
        this.previewLoading = false;
        this.previewErrorMessage = '';
      },
      error: () => {
        this.previewLoading = false;
        onError();
      },
    });
  }

  private buildOrderRequest(overrides: Partial<OrderRequest> = {}): OrderRequest | null {
    if (!this.username || !this.cartItems.length) {
      return null;
    }

    const promotions = this.cartService.getCurrentPromotions();
    return {
      username: this.username,
      totalPrice: this.getSubtotal(),
      giftCardCode: (overrides.giftCardCode ?? promotions.giftCardCode) || undefined,
      giftCode: (overrides.giftCode ?? promotions.giftCode) || undefined,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };
  }

  private hasSpecialBoxset(): boolean {
    return this.cartItems.some(item => item.product.id >= 900000);
  }

  private clearPreviewState(): void {
    this.previewSubscription?.unsubscribe();
    this.previewLoading = false;
    this.previewErrorMessage = '';
    this.pricingPreview = null;
  }

  private getApiErrorMessage(err: unknown): string | null {
    const maybeError = err as { error?: { error?: string } | string };
    if (typeof maybeError?.error === 'string') {
      return maybeError.error;
    }

    if (typeof maybeError?.error?.error === 'string') {
      return maybeError.error.error;
    }

    return null;
  }

  private assignPromotionErrors(
    giftCardCode?: string,
    giftCode?: string,
    backendMessage?: string | null,
    status?: number
  ): boolean {
    if (status !== 400 || (!giftCardCode && !giftCode)) {
      return false;
    }

    const normalizedMessage = backendMessage?.toLowerCase() ?? '';
    let assigned = false;

    this.giftCodeError = '';
    this.voucherError = '';

    if (giftCardCode && (!giftCode || this.isGiftCardErrorMessage(normalizedMessage))) {
      this.giftCodeError = CartComponent.invalidCodeMessage;
      assigned = true;
    }

    if (giftCode && (!giftCardCode || this.isVoucherErrorMessage(normalizedMessage))) {
      this.voucherError = CartComponent.invalidCodeMessage;
      assigned = true;
    }

    if (!assigned) {
      if (giftCardCode) {
        this.giftCodeError = CartComponent.invalidCodeMessage;
        assigned = true;
      }

      if (giftCode) {
        this.voucherError = CartComponent.invalidCodeMessage;
        assigned = true;
      }
    }

    return assigned;
  }

  private isGiftCardErrorMessage(message: string): boolean {
    return message.includes('giftcard') || message.includes('gift card');
  }

  private isVoucherErrorMessage(message: string): boolean {
    return message.includes('gift code')
      || message.includes('voucher')
      || message.includes('eligible film');
  }
}
