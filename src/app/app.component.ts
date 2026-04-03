import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { environment } from '../environments/environment';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TranslateService } from '@ngx-translate/core';
import translationsEN from '../locale/en.json';
import translationsNL from '../locale/nl.json';
import translationsDE from '../locale/de.json';
import translationsFR from '../locale/fr.json';
import translationsES from '../locale/es.json';
import { RouterModule } from '@angular/router';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly testEmail = 'dev@test.local';
  private readonly testPassword = 'test';

  title = 'HomeCinemaProject';
  protected readonly environment = environment;
  public menuOpen = false;
  public isHomepage = false;

  public cartAnimation = false;
  private cartSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {
    this.initialiseTranslateService();

    this.cartSub = this.cartService.itemAdded$.subscribe(() => {
      this.triggerClapboardAnimation();
    });
  }

  ngOnInit(): void {
    this.ensureTestUserExists();
    this.isHomepage = this.isHomepageRoute(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isHomepage = this.isHomepageRoute(event.urlAfterRedirects);
        window.scrollTo(0, 0);
      }
    });
  }

  private isHomepageRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '' || path === '/';
  }

  private ensureTestUserExists(): void {
    this.authService.register(this.testEmail, this.testPassword).subscribe({
      error: () => {
        // Ignore failures here so the app keeps loading even if the user already exists.
      },
    });
  }

  private initialiseTranslateService(): void {
    const storedLanguage = localStorage.getItem('language') ?? 'en';

    this.translate.addLangs(['en', 'nl', 'de', 'fr', 'es']);
    this.translate.setTranslation('en', translationsEN);
    this.translate.setTranslation('nl', translationsNL);
    this.translate.setTranslation('de', translationsDE);
    this.translate.setTranslation('fr', translationsFR);
    this.translate.setTranslation('es', translationsES);
    this.translate.setDefaultLang('en');
    this.translate.use(storedLanguage);
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
