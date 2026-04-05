import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email en wachtwoord zijn verplicht.';
      return;
    }

    this.authService.register(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage =
          err.status === 409
            ? 'Testaccount bestaat al en is klaar voor gebruik.'
            : err.error?.message || 'Registratie mislukt.';
      }
    });
  }
}
