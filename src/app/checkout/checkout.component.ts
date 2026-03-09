import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AccountService } from '../services/account.service';
import { OrderService, OrderRequest } from '../services/order.service';
import { DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';

import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';
import { SHIPPING_COSTS } from '../constants/shipping-costs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [NgClass, NgIf, DecimalPipe, ReactiveFormsModule, NgForOf],
  standalone: true
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  addressUpdateMessage = '';
  addressUpdateSuccess = false;

  shippingCost = 0;
  totalWeight = 0;
  baseShippingCost = 0;

  euCountries = Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => ({ name, code }));

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
          const countryCode = user.address?.country ?? '';
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
    const selectedCode = this.checkoutForm.get('country')?.value;
    this.baseShippingCost = SHIPPING_COSTS[selectedCode] ?? 0;

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
    return this.getSubtotal() + this.shippingCost;
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.username) {
      const addressUpdateData = {
        email: this.username,
        street: this.checkoutForm.value.street,
        postalCode: this.checkoutForm.value.postalCode,
        city: this.checkoutForm.value.city,
        country: this.checkoutForm.value.country
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

    const orderRequest: OrderRequest = {
      username: this.username,
      totalPrice: this.getTotalPrice(),
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.placeOrder(orderRequest).subscribe({
      next: order => {
        alert('Bestelling geplaatst! Ordernummer: ' + order.id);
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: err => {
        alert('Fout bij plaatsen bestelling.');
        console.error(err);
      }
    });
  }
}
