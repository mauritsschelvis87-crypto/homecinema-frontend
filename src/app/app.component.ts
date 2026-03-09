import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { environment } from '../environments/environment';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TranslateService } from '@ngx-translate/core';
import translationsEN from "../locale/en.json";
import translationsNL from "../locale/nl.json";
import { RouterModule } from '@angular/router';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'infirfs-angular-code-along-week5-les1';
  protected readonly environment = environment;
  public menuOpen = false;

  public cartAnimation = false;
  private cartSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private cartService: CartService,
    private router: Router
  ) {
    translate.setDefaultLang('en');
    this.initialiseTranslateService();

    this.cartSub = this.cartService.itemAdded$.subscribe(() => {
      this.triggerClapboardAnimation();
    });
  }

  ngOnInit(): void {
    // Scroll naar boven bij elke navigatie
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  private initialiseTranslateService(): void {
    this.translate.addLangs(['nl', 'en']);
    this.translate.setTranslation('en', translationsEN);
    this.translate.setTranslation('nl', translationsNL);
    this.translate.setDefaultLang('nl');
  }

  onMenuToggle(open: boolean): void {
    this.menuOpen = open;
  }

  triggerClapboardAnimation(): void {
    if (this.cartAnimation) return;
    this.cartAnimation = true;
    setTimeout(() => {
      this.cartAnimation = false;
    }, 2400);
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }
}
