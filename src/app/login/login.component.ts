import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


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

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.message = '';
    this.loading = true;

    this.http.post('http://localhost:8080/api/auth/login', {
      email: this.email,
      password: this.password,
    }, { withCredentials: true }).subscribe({
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
