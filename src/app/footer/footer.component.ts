import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
  subscribeNewsletter(email: string): void {
    if (email) {
      console.log('Subscribed with:', email);
      alert(`Thanks for subscribing with ${email}!`);
    }
  }

}
