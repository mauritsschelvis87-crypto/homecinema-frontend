import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { GiftMovieService, GiftMovieResponse } from '../services/gift-movie.service';

@Component({
  selector: 'app-gift-movie',
  standalone: true,
  templateUrl: './gift-movie.component.html',
  styleUrls: ['./gift-movie.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class GiftMovieComponent {
  form: FormGroup;
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  types = ['DVD', 'Blu-ray', '4K'];

  constructor(
    private fb: FormBuilder,
    private giftMovieService: GiftMovieService,
  ) {
    this.form = this.fb.group({
      allowedType: ['DVD', Validators.required], // moet allowedType zijn
      recipientEmail: ['', [Validators.required, Validators.email]],
    });
  }

  get recipientEmail(): AbstractControl | null {
    return this.form.get('recipientEmail');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.successMessage = null;
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const request = {
      recipientEmail: this.form.value.recipientEmail,
      allowedType: this.form.value.allowedType,
      address: null
    };

    this.giftMovieService.buyGiftMovie(request).subscribe({
      next: (response: GiftMovieResponse) => {
        this.successMessage = `Gift code generated: ${response.giftCode}`;
        this.submitting = false;
        this.form.reset({ allowedType: 'DVD' });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Something went wrong, please try again.';
        this.submitting = false;
      },
    });
  }
}
