import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address, User } from '../models/user';
import { AccountService } from '../services/account.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  selectedLanguage = '';
  languages = ['Dutch', 'English'];

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
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.countries = Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => ({
      name,
      code,
      shippingCost: SHIPPING_COSTS[code] ?? 0,
    }));

    const storedEmail = localStorage.getItem('username');
    if (storedEmail) {
      this.currentUser = { username: storedEmail } as User;
      this.loadUserData(storedEmail);
      this.loadOrders(storedEmail);
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

    this.http
      .post<{ username: string }>(
        'http://localhost:8080/api/auth/login',
        {
          email: this.loginEmail,
          password: this.loginPassword,
        },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          localStorage.setItem('username', this.loginEmail);
          this.loginMessage = '✅ You are logged in!.';
          this.currentUser = { username: this.loginEmail } as User;
          this.loadUserData(this.loginEmail);
          this.loadOrders(this.loginEmail);
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

    this.http
      .post(
        'http://localhost:8080/api/auth/register',
        {
          email: this.registerEmail,
          password: this.registerPassword,
        },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          localStorage.setItem('username', this.registerEmail);
          this.registerMessage = '✅ Registration successful.';
          this.currentUser = { username: this.registerEmail } as User;
          this.loadUserData(this.registerEmail);
          this.loadOrders(this.registerEmail);
        },
        error: (err) => {
          this.registerMessage =
            err.status === 409
              ? '⚠️ User already exists.'
              : '⚠️ Something went wrong during registration.';
          this.registerLoading = false;
        },
        complete: () => {
          this.registerLoading = false;
        },
      });
  }

  logout() {
    localStorage.removeItem('username');
    this.currentUser = undefined;
    this.loginEmail = '';
    this.loginPassword = '';
    this.orders = [];
    this.router.navigate(['/account']);
  }

  loadUserData(email: string) {
    this.accountService.getUser(email).subscribe({
      next: (user: User) => {
        this.currentUser = user;

        if (user.address?.country) {
          const countryName = user.address.country;
          const countryCode = COUNTRY_NAME_TO_CODE[countryName];
          this.selectedCountryCode = countryCode ?? null;
          this.shippingCost = countryCode ? SHIPPING_COSTS[countryCode] ?? null : null;

          this.address = {
            street: user.address.street || '',
            postalCode: user.address.postalCode || '',
            city: user.address.city || '',
            country: countryName,
          };
        }
      },
      error: (err) => console.error('Error fetching user/address:', err),
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
      email: this.currentUser.username,
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
        this.orders = orders;
      },
      error: (err) => console.error('Error loading orders:', err),
    });
  }

  changeLanguage() {
    // Language change logic here (optional)
  }

  confirmNewsletter() {
    this.showThanksMessage = true;
  }

  closePopup() {
    this.showThanksMessage = false;
  }
}
