import { Component } from '@angular/core';
import { GiftCodeService, GiftCodeValidationResult } from '../services/gift-code.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-gift-code',
  standalone: true,
  templateUrl: './gift-code.component.html',
  styleUrls: ['./gift-code.component.scss'],
  imports: [FormsModule, NgIf],
})
export class GiftCodeComponent {
  giftCode: string = '';
  validationResult: GiftCodeValidationResult | null = null;
  loading = false;
  errorMessage: string | null = null;

  constructor(private giftCodeService: GiftCodeService) {}

  onValidateCode(): void {
    if (!this.giftCode.trim()) {
      this.errorMessage = 'Please enter a gift code.';
      this.validationResult = null;
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.validationResult = null;

    this.giftCodeService.validateCode(this.giftCode.trim()).subscribe({
      next: (result) => {
        this.validationResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to validate the gift code. Please try again later.';
        this.loading = false;
      },
    });
  }
}
