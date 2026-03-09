import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilmService, Film } from '../services/film.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, NgForOf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public menuOpen = false;
  public showSearch = false;
  public searchQuery = '';
  public allFilms: Film[] = [];
  public filteredFilms: Film[] = [];

  @Output() menuToggle = new EventEmitter<boolean>();
  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    private filmService: FilmService
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
    this.menuToggle.emit(this.menuOpen);
  }
  closeMenu(): void {
    this.menuOpen = false;
    this.menuToggle.emit(this.menuOpen);
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch && !this.allFilms.length) {
      this.filmService.getAllFilms().subscribe(films => this.allFilms = films);
    }
    if (!this.showSearch) this.closeSearch();
  }

  onSearchChange(): void {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      this.filteredFilms = [];
      return;
    }
    this.filteredFilms = this.allFilms.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.director.toLowerCase().includes(q) ||
      f.country.toLowerCase().includes(q) ||
      f.year.toString().includes(q)
    ).slice(0, 5);
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;

    const exact = this.allFilms.find(f => f.title.toLowerCase() === q.toLowerCase());
    if (exact) {
      this.router.navigate(['/product', exact.id]);
    }
    else {
      this.router.navigate(['/shopping'], { queryParams: { q } });
    }

    this.closeSearch();
  }


  goToFilm(id: number): void {
    this.router.navigate(['/product', id]);
    this.closeSearch();
  }

  closeSearch(): void {
    this.showSearch = false;
    this.searchQuery = '';
    this.filteredFilms = [];
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
