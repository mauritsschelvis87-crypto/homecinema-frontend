import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { IsActiveMatchOptions, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilmService, Film } from '../services/film.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '../services/collection.service';
import { FilmRegionValue, getFilmRegion, matchesFilmSearch } from '../utils/film-search';

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

  @Output() menuToggle = new EventEmitter<boolean>();
  private routerSubscription!: Subscription;
  private searchOpenTimeout?: ReturnType<typeof setTimeout>;

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
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.closeSearch();
    }
    this.menuToggle.emit(this.menuOpen);
  }
  closeMenu(): void {
    this.menuOpen = false;
    this.menuToggle.emit(this.menuOpen);
  }

  toggleSearch(): void {
    if (this.showSearch) {
      this.closeSearch();
      return;
    }

    if (this.menuOpen) {
      this.closeMenu();
      this.clearSearchOpenTimeout();
      this.searchOpenTimeout = setTimeout(() => {
        this.openSearch();
      }, 220);
      return;
    }

    this.openSearch();
  }

  onSearchChange(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.filteredFilms = [];
      return;
    }
    this.filteredFilms = this.allFilms
      .filter(f => matchesFilmSearch(f, q))
      .slice(0, 5);
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;

    const exact = this.allFilms.find(f => f.title.toLowerCase() === q.toLowerCase());
    if (exact) {
      this.router.navigate(['/films', exact.id]);
    }
    else {
      this.router.navigate(['/search'], { queryParams: { q } });
    }

    this.closeSearch();
  }


  goToFilm(id: number): void {
    this.router.navigate(['/films', id]);
    this.closeSearch();
  }

  isInCollection(filmId: number): boolean {
    return this.collectionService.isInCollection(filmId);
  }

  getFilmRegionValue(film: Film): FilmRegionValue | null {
    return getFilmRegion(film);
  }

  closeSearch(): void {
    this.clearSearchOpenTimeout();
    this.showSearch = false;
    this.searchQuery = '';
    this.filteredFilms = [];
  }

  private openSearch(): void {
    this.showSearch = true;
    if (!this.allFilms.length) {
      this.filmService.getAllFilms().subscribe(films => this.allFilms = films);
    }
  }

  private clearSearchOpenTimeout(): void {
    if (this.searchOpenTimeout) {
      clearTimeout(this.searchOpenTimeout);
      this.searchOpenTimeout = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearSearchOpenTimeout();
    this.routerSubscription.unsubscribe();
  }
}
