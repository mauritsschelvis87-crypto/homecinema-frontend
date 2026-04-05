import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address, User } from '../models/user';
import { AccountService } from '../services/account.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService, AuthResponse } from '../services/auth.service';

import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';
import { SHIPPING_COSTS } from '../constants/shipping-costs';

interface Order {
  id: number;
  number: string;
  orderDate: string;
  status: string;
}

interface Country {
  name: string;
  code: string;
  shippingCost: number;
}

interface LanguageOption {
  code: string;
  label: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  private readonly defaultAddress: Address = {
    street: '',
    postalCode: '',
    city: '',
    country: '',
  };

  selectedLanguage = 'en';
  languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];

  address: Address = { street: '', postalCode: '', city: '', country: '' };
  currentUser?: User;
  addressMessage = '';

  loginEmail = '';
  loginPassword = '';
  loginMessage = '';
  loginLoading = false;

  registerEmail = '';
  registerPassword = '';
  registerMessage = '';
  registerLoading = false;

  showThanksMessage = false;

  orders: Order[] = [];

  selectedCountryCode: string = "";
  shippingCost: number | null = null;
  countries: Country[] = [];

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('language') ?? this.translate.currentLang ?? 'en';
    this.countries = Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => ({
      name,
      code,
      shippingCost: SHIPPING_COSTS[code] ?? 0,
    }));

    const storedEmail = localStorage.getItem('username');
    const token = this.authService.getStoredToken();

    if (storedEmail || token) {
      this.currentUser = { username: storedEmail } as User;
      this.applyAddressDefaults();
      this.loadUserData(storedEmail ?? undefined);
      if (storedEmail) {
        this.loadOrders(storedEmail);
      }
    }
  }

  get selectedCountryName(): string | null {
    if (!this.selectedCountryCode) return null;
    const found = this.countries.find(c => c.code === this.selectedCountryCode);
    return found ? found.name : null;
  }

  login() {
    this.loginMessage = '';
    this.loginLoading = true;

    this.authService
      .login(this.loginEmail, this.loginPassword)
      .subscribe({
        next: (response) => {
          const username = response.email || this.loginEmail;
          this.loginMessage = '✅ You are logged in!.';
          this.currentUser = { username } as User;
          this.applyAddressDefaults();
          this.loadUserData(username);
          this.loadOrders(username);
        },
        error: (err) => {
          this.loginMessage =
            err.status === 401
              ? '❌ Invalid login credentials.'
              : '⚠️ Something went wrong during login.';
          this.loginLoading = false;
        },
        complete: () => {
          this.loginLoading = false;
        },
      });
  }

  register() {
    this.registerMessage = '';
    this.registerLoading = true;

    this.authService
      .register(this.registerEmail, this.registerPassword)
      .subscribe({
        next: (response: AuthResponse) => {
          const username = response.email || this.registerEmail;
          this.registerMessage = '✅ Registration successful.';
          this.currentUser = { username } as User;
          this.applyAddressDefaults();
          this.loadUserData(username);
          this.loadOrders(username);
          this.registerEmail = '';
          this.registerPassword = '';
        },
        error: (err) => {
          this.registerMessage =
            err.status === 409
              ? '✅ Test account already exists and is ready to use.'
              : '⚠️ Something went wrong during registration.';
          this.registerLoading = false;
        },
        complete: () => {
          this.registerLoading = false;
        },
      });
  }

  logout() {
    this.authService.logout();
    this.currentUser = undefined;
    this.loginEmail = '';
    this.loginPassword = '';
    this.orders = [];
    this.router.navigate(['/account']);
  }

  loadUserData(email?: string) {
    this.accountService.getUser(email).subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.address = {
          street: user.address?.street || this.defaultAddress.street,
          postalCode: user.address?.postalCode || this.defaultAddress.postalCode,
          city: user.address?.city || this.defaultAddress.city,
          country: user.address?.country || this.defaultAddress.country,
        };

        const countryCode = COUNTRY_NAME_TO_CODE[this.address.country];
        this.selectedCountryCode = countryCode ?? '';
        this.shippingCost = countryCode ? SHIPPING_COSTS[countryCode] ?? null : null;
      },
      error: (err) => {
        console.error('Error fetching user/address:', err);
        this.applyAddressDefaults();
      },
    });
  }

  saveAddress() {
    if (!this.currentUser?.username || !this.selectedCountryCode) return;

    const countryName = Object.entries(COUNTRY_NAME_TO_CODE).find(
      ([_, code]) => code === this.selectedCountryCode
    )?.[0];

    if (!countryName) {
      this.addressMessage = '❌ Invalid country selected.';
      return;
    }

    const userUpdate = {
      street: this.address.street,
      postalCode: this.address.postalCode,
      city: this.address.city,
      country: countryName,
    };

    this.accountService.updateUser(userUpdate).subscribe({
      next: () => {
        this.addressMessage = '✅ Address saved successfully.';
      },
      error: (err) => {
        console.error('ERROR SAVING ADDRESS:', err);
        this.addressMessage = '❌ Something went wrong while saving.';
      },
    });
  }

  updateShippingCost() {
    if (!this.selectedCountryCode) {
      this.shippingCost = null;
      return;
    }
    this.shippingCost = SHIPPING_COSTS[this.selectedCountryCode] ?? null;
  }

  loadOrders(email: string) {
    this.accountService.getOrders(email).subscribe({
      next: (orders) => {
        const localOrders = this.orderService.getLocalOrderSummariesByUsername(email);
        this.orders = [...orders, ...localOrders].sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.orders = this.orderService.getLocalOrderSummariesByUsername(email).sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      },
    });
  }

  changeLanguage() {
    localStorage.setItem('language', this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
  }

  confirmNewsletter() {
    this.showThanksMessage = true;
  }

  closePopup() {
    this.showThanksMessage = false;
  }

  private applyAddressDefaults() {
    this.address = { ...this.defaultAddress };
    this.selectedCountryCode = '';
    this.shippingCost = null;
  }
}
