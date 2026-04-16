import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AccountService } from '../services/account.service';
import { Order, OrderService, OrderRequest } from '../services/order.service';
import { DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { getDiscountSummaryLabel } from '../utils/discount-code-display';
import { EU_COUNTRIES, getShippingCountryCode, getShippingCountryName, getShippingCostByCountryValue } from '../utils/shipping-utils';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [NgClass, NgIf, DecimalPipe, ReactiveFormsModule, NgForOf],
  standalone: true
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private static readonly invalidCodeMessage = 'The code is invalid.';

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  addressUpdateMessage = '';
  addressUpdateSuccess = false;
  orderErrorMessage = '';
  previewErrorMessage = '';
  previewLoading = false;
  pricingPreview: Order | null = null;

  shippingCost = 0;
  totalWeight = 0;
  baseShippingCost = 0;
  private previewSubscription?: Subscription;

  euCountries = EU_COUNTRIES;

  paymentOptions = [
    { value: 'creditcard', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'ideal', label: 'iDEAL' }
  ];

  username = localStorage.getItem('username') ?? '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private accountService: AccountService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Winkelmand-items ophalen
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.totalWeight = this.cartService.getTotalWeight();
      this.updateShippingCost(); // trigger bij init
      this.refreshPreview();
    });

    this.cartService.getPromotions().subscribe(() => {
      this.refreshPreview();
    });


    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      street: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      paymentMethod: ['creditcard', Validators.required]
    });

    if (this.username) {
      this.accountService.getUser(this.username).subscribe({
        next: user => {
          const countryCode = getShippingCountryCode(user.address?.country);
          this.checkoutForm.patchValue({
            email: user.email ?? '',
            street: user.address?.street ?? '',
            postalCode: user.address?.postalCode ?? '',
            city: user.address?.city ?? '',
            country: countryCode
          });

          this.updateShippingCost();
        },
        error: err => console.error('Fout bij ophalen gebruiker:', err)
      });
    }

    this.checkoutForm.get('country')?.valueChanges.subscribe(() => {
      this.updateShippingCost();
    });
  }

  updateShippingCost(): void {
    const selectedCode = getShippingCountryCode(this.checkoutForm.get('country')?.value);
    this.baseShippingCost = getShippingCostByCountryValue(selectedCode) ?? 0;

    const weightSurcharge = this.calculateWeightSurcharge(this.totalWeight);

    this.shippingCost = this.baseShippingCost + weightSurcharge;
  }

  calculateWeightSurcharge(weight: number): number {
    if (weight === 0) return 0;
    if (weight <= 500) return 0;
    if (weight <= 2000) return 2.00;
    return 5.00;
  }

  getSubtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.getDisplayedTotalPrice();
  }

  ngOnDestroy(): void {
    this.previewSubscription?.unsubscribe();
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

  getDiscountLabel(): string {
    return getDiscountSummaryLabel(
      this.pricingPreview?.appliedGiftCardCode,
      this.pricingPreview?.appliedGiftCode
    );
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.orderErrorMessage = '';

    if (this.username) {
      const countryName = getShippingCountryName(this.checkoutForm.value.country);
      if (!countryName) {
        this.orderErrorMessage = 'Select a supported European shipping country.';
        return;
      }

      const addressUpdateData = {
        email: this.username,
        street: this.checkoutForm.value.street,
        postalCode: this.checkoutForm.value.postalCode,
        city: this.checkoutForm.value.city,
        country: countryName
      };

      this.accountService.updateUser(addressUpdateData).subscribe({
        next: () => {
          this.addressUpdateSuccess = true;
          this.addressUpdateMessage = 'Adres succesvol opgeslagen.';
        },
        error: (err) => {
          this.addressUpdateSuccess = false;
          this.addressUpdateMessage = 'Fout bij opslaan adres.';
          console.error('❌ Error saving address:', err);
        }
      });
    }

    const promotions = this.cartService.getCurrentPromotions();

    const orderRequest: OrderRequest = {
      username: this.username,
      totalPrice: this.getDisplayedTotalPrice(),
      giftCardCode: promotions.giftCardCode || undefined,
      giftCode: promotions.giftCode || undefined,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    const hasSpecialBoxset = this.cartItems.some(item => item.product.id >= 900000);

    if (hasSpecialBoxset) {
      this.orderService.clearLatestPlacedOrderId();
      const order = this.orderService.createLocalOrder(
        this.username,
        this.cartItems,
        this.getSubtotal() + this.shippingCost
      );
      this.cartService.clearCart();
      this.router.navigate(['/order-confirmation']);
      return;
    }

    this.orderService.placeOrder(orderRequest).subscribe({
      next: order => {
        if (order.id != null) {
          this.orderService.setLatestPlacedOrderId(order.id);
        }
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation']);
      },
      error: err => {
        this.orderErrorMessage = err?.error?.error ?? 'Fout bij plaatsen bestelling.';
        console.error(err);
      }
    });
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
      },
      error: err => {
        this.pricingPreview = null;
        this.previewLoading = false;
        const hasPromotionCode = Boolean(request.giftCardCode || request.giftCode);
        this.previewErrorMessage = hasPromotionCode && err?.status === 400
          ? CheckoutComponent.invalidCodeMessage
          : err?.error?.error ?? 'Could not load the price preview.';
      },
    });
  }

  private buildOrderRequest(): OrderRequest | null {
    if (!this.username || !this.cartItems.length) {
      return null;
    }

    const promotions = this.cartService.getCurrentPromotions();
    return {
      username: this.username,
      totalPrice: this.getSubtotal(),
      giftCardCode: promotions.giftCardCode || undefined,
      giftCode: promotions.giftCode || undefined,
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
}
