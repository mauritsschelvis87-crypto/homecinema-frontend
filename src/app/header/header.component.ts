import { Component, ElementRef, EventEmitter, Output, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IsActiveMatchOptions, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilmService, Film } from '../services/film.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '../services/collection.service';
import { getFilmSearchScore } from '../utils/film-search';
import { getGiftCardSearchFilms } from '../giftcards-page/giftcard-catalog';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';
import {
  getSearchResultDetails,
  getSearchResultTitle,
} from '../utils/search-result-display';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, NgIf, NgForOf, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public readonly activeNavLinkOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };
  public menuOpen = false;
  public showSearch = false;
  public searchQuery = '';
  public allFilms: Film[] = [];
  public filteredFilms: Film[] = [];

  @ViewChild('searchInput')
  private searchInput?: ElementRef<HTMLInputElement>;

  @Output() menuToggle = new EventEmitter<boolean>();
  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    private filmService: FilmService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
        this.closeSearch();
      }
    });
  }

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }

    if (this.showSearch) {
      this.showSearch = false;
      this.searchQuery = '';
      this.filteredFilms = [];
    }

    this.menuOpen = true;
    this.emitPanelState();
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.emitPanelState();
  }

  toggleSearch(): void {
    if (this.showSearch) {
      this.closeSearch();
      return;
    }

    if (this.menuOpen) {
      this.menuOpen = false;
    }

    this.openSearch();
  }

  onHomeLogoClick(): void {
    this.closeMenu();
    this.closeSearch();
  }

  onSearchChange(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.filteredFilms = [];
      return;
    }
    this.filteredFilms = this.allFilms
      .map((film) => ({ film, score: getFilmSearchScore(film, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.film.title.localeCompare(b.film.title))
      .map(({ film }) => film);
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;

    const exact = this.allFilms.find(f => f.title.toLowerCase() === q.toLowerCase());
    if (exact) {
      this.goToProduct(exact.id);
    }
    else {
      this.router.navigate(['/search'], { queryParams: { q } });
      this.closeSearch();
    }
  }


  goToProduct(id: number): void {
    this.router.navigate(getProductLinkById(id), { fragment: getProductFragmentById(id) });
    this.closeSearch();
  }

  isInCollection(filmId: number): boolean {
    return this.collectionService.isInCollection(filmId);
  }

  getSuggestionTitle(film: Film): string {
    return getSearchResultTitle(film);
  }

  getSuggestionDetails(film: Film): string[] {
    return getSearchResultDetails(film);
  }

  closeSearch(): void {
    this.showSearch = false;
    this.searchQuery = '';
    this.filteredFilms = [];
    this.emitPanelState();
  }

  private openSearch(): void {
    this.showSearch = true;
    if (!this.allFilms.length) {
      this.filmService.getAllFilms().subscribe((films) => {
        this.allFilms = [...films, ...getGiftCardSearchFilms()];
      });
    }

    this.emitPanelState();

    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    });
  }

  private emitPanelState(): void {
    this.menuToggle.emit(this.menuOpen || this.showSearch);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
