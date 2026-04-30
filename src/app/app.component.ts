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
import { Subscription, switchMap } from 'rxjs';
import { NgIf } from '@angular/common';
import { CatalogSessionService } from './services/catalog-session.service';
import { DevSessionService } from './services/dev-session.service';
import { LoadingMessageComponent } from './loading-message/loading-message.component';
import { StartupPreloadService } from './services/startup-preload.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, NgIf, LoadingMessageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'HomeCinemaProject';
  protected readonly environment = environment;
  public menuOpen = false;
  public isHomepage = false;
  public isExploreRoute = false;
  public useMenuAlignment = false;
  public isSpecialEditionRoute = false;
  public isDirectorDetailRoute = false;

  public cartAnimation = false;
  private cartSub?: Subscription;
  private appBootstrapSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private cartService: CartService,
    private router: Router,
    private catalogSessionService: CatalogSessionService,
    private devSessionService: DevSessionService,
    private startupPreloadService: StartupPreloadService
  ) {
    this.initialiseTranslateService();

    this.cartSub = this.cartService.itemAdded$.subscribe(() => {
      this.triggerClapboardAnimation();
    });
  }

  ngOnInit(): void {
    this.appBootstrapSub = this.devSessionService.ensureDevelopmentSession().pipe(
      switchMap(() => this.catalogSessionService.ensureCatalogSession()),
      switchMap(() => this.startupPreloadService.warmup())
    ).subscribe({
      next: () => undefined,
      error: err => console.error('Dev session bootstrap failed:', err),
    });

    this.isHomepage = this.isHomepageRoute(this.router.url);
    this.isExploreRoute = this.isExplorePageRoute(this.router.url);
    this.useMenuAlignment = this.shouldUseMenuAlignment(this.router.url);
    this.isSpecialEditionRoute = this.isSpecialEditionPageRoute(this.router.url);
    this.isDirectorDetailRoute = this.isDirectorPageRoute(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isHomepage = this.isHomepageRoute(event.urlAfterRedirects);
        this.isExploreRoute = this.isExplorePageRoute(event.urlAfterRedirects);
        this.useMenuAlignment = this.shouldUseMenuAlignment(event.urlAfterRedirects);
        this.isSpecialEditionRoute = this.isSpecialEditionPageRoute(event.urlAfterRedirects);
        this.isDirectorDetailRoute = this.isDirectorPageRoute(event.urlAfterRedirects);
        window.scrollTo(0, 0);
      }
    });
  }

  private isHomepageRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '' || path === '/';
  }

  private shouldUseMenuAlignment(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];

    return path === ''
      || path === '/'
      || path === '/boxsets/special-edition';
  }

  private isSpecialEditionPageRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '/boxsets/special-edition';
  }

  private isDirectorPageRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path.startsWith('/director/') || path.startsWith('/directors/');
  }

  private isExplorePageRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '/explore';
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
    this.appBootstrapSub?.unsubscribe();
  }
}
