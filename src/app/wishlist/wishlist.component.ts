import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../services/wishlist.service';
import { Film } from '../services/film.service';
import { CartService } from '../services/cart.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    NgIf,
    FormsModule,
    NgForOf,
  ]
})
export class WishlistComponent implements OnInit {
  wishlist: Film[] = [];
  filteredWishlist: Film[] = [];
  loading = false;

  allCountries: string[] = [];
  allDirectors: string[] = [];
  allYears: number[] = [];
  allTypes: string[] = [];
  allBrands: string[] = [];

  filteredCountries: string[] = [];
  filteredDirectors: string[] = [];
  filteredYears: number[] = [];
  filteredTypes: string[] = [];
  filteredBrands: string[] = [];

  filters = {
    title: '',
    country: '',
    director: '',
    year: '',
    type: '',
    brand: ''
  };

  showGrid = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.wishlistService.loadWishlistFromServer();
    this.wishlistService.wishlist$.subscribe(films => {
      this.loading = false;
      this.wishlist = films.sort((a, b) => a.title.localeCompare(b.title));
      this.filteredWishlist = [...this.wishlist];

      this.allCountries = [...new Set(films.map(f => f.country))].sort();
      this.allDirectors = [...new Set(films.map(f => f.director))].sort();
      this.allYears = [...new Set(films.map(f => f.year))].sort((a, b) => a - b);
      this.allTypes = [...new Set(films.map(f => f.type))].sort();
      this.allBrands = [...new Set(films.map(f => f.brand?.name).filter(Boolean))].sort();

      this.resetDropdowns();
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    // 1) Filter films
    this.filteredWishlist = this.wishlist.filter(film =>
      (!this.filters.title   || film.title.toLowerCase().includes(this.filters.title.toLowerCase())) &&
      (!this.filters.country || film.country === this.filters.country) &&
      (!this.filters.director|| film.director === this.filters.director) &&
      (!this.filters.year    || film.year.toString() === this.filters.year) &&
      (!this.filters.type    || film.type === this.filters.type) &&
      (!this.filters.brand   || film.brand?.name === this.filters.brand)
    ).sort((a, b) => a.title.localeCompare(b.title));

    this.updateDropdowns();
  }

  private updateDropdowns(): void {
    const c = new Set<string>();
    const d = new Set<string>();
    const y = new Set<number>();
    const t = new Set<string>();
    const b = new Set<string>();

    this.filteredWishlist.forEach(film => {
      c.add(film.country);
      d.add(film.director);
      y.add(film.year);
      if (film.type) t.add(film.type);
      if (film.brand?.name) b.add(film.brand.name);
    });

    this.filteredCountries = [...c].sort();
    this.filteredDirectors = [...d].sort();
    this.filteredYears = [...y].sort((a, b) => a - b);
    this.filteredTypes = [...t].sort();
    this.filteredBrands = [...b].sort();

    if (this.filters.country && !c.has(this.filters.country))   this.filters.country = '';
    if (this.filters.director && !d.has(this.filters.director)) this.filters.director = '';
    if (this.filters.year && !y.has(+this.filters.year))        this.filters.year = '';
    if (this.filters.type && !t.has(this.filters.type))         this.filters.type = '';
    if (this.filters.brand && !b.has(this.filters.brand))       this.filters.brand = '';
  }

  private resetDropdowns(): void {
    this.filteredCountries = [...this.allCountries];
    this.filteredDirectors = [...this.allDirectors];
    this.filteredYears = [...this.allYears];
    this.filteredTypes = [...this.allTypes];
    this.filteredBrands = [...this.allBrands];
  }

  resetFilters(): void {
    this.filters = { title:'', country:'', director:'', year:'', type:'', brand:'' };
    this.filteredWishlist = [...this.wishlist];
    this.resetDropdowns();
  }

  toggleView(): void {
    this.showGrid = !this.showGrid;
  }

  remove(filmId: number): void {
    this.wishlistService.removeFromWishlist(filmId);
  }

  addToCart(film: Film): void {
    this.cartService.addToCart(film);
    this.remove(film.id);
  }
}
