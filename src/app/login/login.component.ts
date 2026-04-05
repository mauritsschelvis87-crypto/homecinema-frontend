import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.message = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/splash-screen']);
      },
      error: (err) => {
        if (err.status === 401) {
          this.message = 'Ongeldige inloggegevens.';
        } else {
          this.message = 'Er ging iets mis tijdens het inloggen.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
