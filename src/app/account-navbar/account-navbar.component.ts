import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './account-navbar.component.html',
  styleUrls: ['./account-navbar.component.scss'],
})
export class AccountNavbarComponent {}
