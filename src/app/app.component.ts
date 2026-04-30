import { ViewportScroller, NgIf } from '@angular/common';
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
  private routerEventsSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private cartService: CartService,
    private router: Router,
    private viewportScroller: ViewportScroller,
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
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    this.appBootstrapSub = this.devSessionService.ensureDevelopmentSession().pipe(
      switchMap(() => this.catalogSessionService.ensureCatalogSession()),
      switchMap(() => this.startupPreloadService.warmup())
    ).subscribe({
      next: () => undefined,
      error: err => console.error('Dev session bootstrap failed:', err),
    });

    this.updateRouteState(this.router.url);

    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
        this.scheduleNavigationScrollReset(event.urlAfterRedirects);
      }
    });
  }

  private scheduleNavigationScrollReset(url: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const shouldResetViewport = !url.includes('#');
    const reset = () => {
      if (shouldResetViewport) {
        this.viewportScroller.scrollToPosition([0, 0]);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      this.resetScrollableContainers();
    };

    reset();
    queueMicrotask(reset);
    requestAnimationFrame(() => {
      reset();
      requestAnimationFrame(reset);
    });
    window.setTimeout(reset, 0);
    window.setTimeout(reset, 120);
  }

  private resetScrollableContainers(): void {
    const scrollableElements = Array.from(document.querySelectorAll<HTMLElement>('*')).filter((element) => {
      if (element.scrollTop === 0 && element.scrollLeft === 0) {
        return false;
      }

      const styles = window.getComputedStyle(element);
      const canScrollY = /(auto|scroll)/.test(styles.overflowY) && element.scrollHeight > element.clientHeight;
      const canScrollX = /(auto|scroll)/.test(styles.overflowX) && element.scrollWidth > element.clientWidth;

      return canScrollY || canScrollX;
    });

    scrollableElements.forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
  }

  private updateRouteState(url: string): void {
    this.isHomepage = this.isHomepageRoute(url);
    this.isExploreRoute = this.isExplorePageRoute(url);
    this.useMenuAlignment = this.shouldUseMenuAlignment(url);
    this.isSpecialEditionRoute = this.isSpecialEditionPageRoute(url);
    this.isDirectorDetailRoute = this.isDirectorPageRoute(url);
  }

  private getPath(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private isHomepageRoute(url: string): boolean {
    const path = this.getPath(url);
    return path === '' || path === '/';
  }

  private shouldUseMenuAlignment(url: string): boolean {
    const path = this.getPath(url);

    return path === ''
      || path === '/'
      || path === '/boxsets/special-edition';
  }

  private isSpecialEditionPageRoute(url: string): boolean {
    const path = this.getPath(url);
    return path === '/boxsets/special-edition';
  }

  private isDirectorPageRoute(url: string): boolean {
    const path = this.getPath(url);
    return path.startsWith('/director/') || path.startsWith('/directors/');
  }

  private isExplorePageRoute(url: string): boolean {
    const path = this.getPath(url);
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
    this.routerEventsSub?.unsubscribe();
  }
}
